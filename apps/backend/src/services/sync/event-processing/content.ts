import {ArCabildoabiertoEmbedPoll, ATProtoStrongRef} from "@cabildo-abierto/api";
import {Transaction} from "kysely";
import {DB} from "../../../../prisma/generated/types.js";
import {
    SyncContentProps
} from "#/services/sync/types.js";
import {AppContext} from "#/setup.js";
import {ContentContextRef, getCollectionFromUri, getPollId} from "@cabildo-abierto/utils";
import {JobToAdd} from "#/jobs/worker.js";


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

    const blobData = records
        .map(c => {
            return c.record.textBlob ?? null
        })
        .filter(b => b != null)

    if (blobData.length > 0) {
        await trx
            .insertInto("Blob")
            .values(blobData)
            .onConflict((oc) => oc.column("cid").doNothing())
            .execute()
    }

    const contentDatasetLinks = records.flatMap(c =>
        (c.record.datasetsUsed ?? []).map(datasetUri => ({
            A: c.ref.uri,
            B: datasetUri
        }))
    )

    const contentData = records.map(c => {
        const r = c.record
        const created_at = "created_at" in c.record ? new Date(c.record.created_at as string) : new Date()
        return {
            text: r.text,
            textBlobId: r.textBlob?.cid,
            uri: c.ref.uri,
            format: r.format,
            selfLabels: r.selfLabels ?? [],
            embeds: c.record.embeds ?? [],
            created_at,
            created_at_tz: created_at
        }
    })
    if (contentData.length > 0) {
        await trx
            .insertInto("Content")
            .values(contentData)
            .onConflict(oc =>
                oc.column("uri").doUpdateSet({
                    text: (eb) => eb.ref('excluded.text'),
                    textBlobId: (eb) => eb.ref('excluded.textBlobId'),
                    format: (eb) => eb.ref('excluded.format'),
                    selfLabels: (eb) => eb.ref('excluded.selfLabels'),
                    created_at: (eb) => eb.ref('excluded.created_at'),
                    created_at_tz: (eb) => eb.ref('excluded.created_at_tz'),
                })
            )
            .execute()

        const textAv: {text: string, created_at: Date, uri: string}[] = contentData
            .map(x => x.text ? {...x, text: x.text} : null)
            .filter(x => x != null)
        if(textAv.length > 0) {
            await trx
                .insertInto("SearchableContent")
                .values(textAv.map(t => {
                    return {
                        text: t.text,
                        created_at: t.created_at,
                        collection: getCollectionFromUri(t.uri),
                        uri: t.uri
                    }
                }))
                .onConflict((oc) => oc.column("uri").doUpdateSet({
                    text: eb => eb.ref("excluded.text")
                }))
                .execute()
        }

        const polls = contentData
            .flatMap((c, i) => c.embeds
                .map(e => {
                    if(ArCabildoabiertoEmbedPoll.isMain(e.value)){
                        const container: ContentContextRef = topicIds ?
                            {type: "topic", id: topicIds[i]} :
                            {type: "uri", uri: c.uri}
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

    if (contentDatasetLinks.length > 0) {
        // TO DO: Borrar datasets que se dejaron de usar
        await trx
            .insertInto('_ContentToDataset')
            .values(contentDatasetLinks)
            .onConflict(oc => oc.columns(['A', 'B']).doNothing())
            .execute()
    }

    const moderationReq = contentData.filter(c => {
        const collection = getCollectionFromUri(c.uri)
        return (c.selfLabels && c.selfLabels.includes('ca:en discusión')) || collection == "ar.cabildoabierto.wiki.topicVersion" || collection == "ar.cabildoabierto.feed.article"
    })
    if(moderationReq.length > 0) {
        return [
            {
                label: "start-content-moderation",
                data: moderationReq.map(c => {
                    return {
                        uri: c.uri,
                        context: "Nuevo contenido."
                    }
                })
            }
        ]
    } else {
        return []
    }
}