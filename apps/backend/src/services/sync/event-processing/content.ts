import {ArCabildoabiertoEmbedPoll, ATProtoStrongRef} from "@cabildo-abierto/api";
import {Transaction} from "kysely";
import {DB} from "../../../../prisma/generated/types.js";
import {
    SyncContentProps
} from "#/services/sync/types.js";
import {AppContext} from "#/setup.js";
import {ContentContextRef, getPollId} from "@cabildo-abierto/utils";
import {JobToAdd} from "#/jobs/worker.js";
import {v4 as uuidv4} from 'uuid'


export const processContentsBatch = async (
    ctx: AppContext,
    trx: Transaction<DB>,
    records: {
        ref: ATProtoStrongRef,
        record: SyncContentProps
    }[],
    topicIds?: string[]
): Promise<JobToAdd[]> => {
    if (records.length == 0) return []

    const contentData = records.map(c => {
        const r = c.record
        return {
            id: uuidv4(),
            uri: c.ref.uri,
            body: r.text,
            facets: c.record.facets
        }
    })
    if (contentData.length > 0) {
        await trx
            .insertInto("Content")
            .values(contentData)
            .onConflict(oc =>
                oc.column("uri").doUpdateSet({
                    body: (eb) => eb.ref('excluded.body'),
                    facets: (eb) => eb.ref('excluded.facets'),
                })
            )
            .execute()

        const polls = records
            .flatMap((c, i) => c.record.embeds
                .map(e => {
                    if(ArCabildoabiertoEmbedPoll.isMain(e.value)){
                        const container: ContentContextRef = topicIds ?
                            {type: "topic", id: topicIds[i]} :
                            {type: "uri", uri: c.ref.uri}
                        return {
                            poll: e.value,
                            container
                        }
                    } else {
                        return null
                    }
                }))
            .filter(x => x != null)

        if(polls.length > 0) {
            await trx
                .insertInto("Poll")
                .values(polls.map(p => {
                    const poll = p.poll
                    const id = getPollId(poll.key, p.container)

                    return {
                        id,
                        choices: poll.poll.choices.map(c => c.label),
                        description: poll.poll.description,
                        createdAt: new Date(),
                        topicId: p.container.type == "topic" ? p.container.id : undefined,
                        parentRecordId: p.container.type == "uri" ? p.container.uri : undefined,
                    }
                }))
                .onConflict((oc) => oc.column("id").doNothing())
                .execute()
        }
    }
    return []
}