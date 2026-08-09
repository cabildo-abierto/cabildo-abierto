import {ArCabildoabiertoEmbedPoll, ATProtoStrongRef} from "@cabildo-abierto/api";
import {Transaction} from "kysely";
import {DB} from "../../../../prisma/generated/types.js";
import {
    SyncContentProps
} from "#/services/sync/types.js";
import {AppContext} from "#/setup.js";
import {ContentContextRef, getCollectionFromUri, getPollId} from "@cabildo-abierto/utils";
import {JobToAdd} from "#/jobs/worker.js";
import {processDirtyRecordsBatch} from "#/services/sync/event-processing/record-processor.js";
import {Effect} from "effect";
import {DBInsertError} from "#/utils/errors.js";


export const processContentsBatch = (
    ctx: AppContext,
    trx: Transaction<DB>,
    records: {
        ref: ATProtoStrongRef,
        record: SyncContentProps
    }[],
    topicIds?: string[]
): Effect.Effect<JobToAdd[], DBInsertError> => Effect.gen(function* () {
    if (records.length == 0) return []

    const blobData = records
        .map(c => {
            return c.record.textBlob ?? null
        })
        .filter(b => b != null)

    if (blobData.length > 0) {
        yield* Effect.tryPromise({
            try: () => trx
                .insertInto("Blob")
                .values(blobData)
                .onConflict((oc) => oc.column("cid").doNothing())
                .execute(),
            catch: (error) => new DBInsertError(error)
        })
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
            createdAt: created_at
        }
    })
    if (contentData.length > 0) {
        yield* Effect.tryPromise({
            try: () => trx
                .insertInto("Content")
                .values(contentData)
                .onConflict(oc =>
                    oc.column("uri").doUpdateSet({
                        text: (eb) => eb.ref('excluded.text'),
                        textBlobId: (eb) => eb.ref('excluded.textBlobId'),
                        format: (eb) => eb.ref('excluded.format'),
                        selfLabels: (eb) => eb.ref('excluded.selfLabels'),
                        createdAt: (eb) => eb.ref('excluded.createdAt'),
                    })
                )
                .execute(),
            catch: (error) => new DBInsertError(error)
        })

        const textAv: {text: string, createdAt: Date, uri: string}[] = contentData
            .map(x => x.text ? {...x, text: x.text} : null)
            .filter(x => x != null)

        if(textAv.length > 0) {
            yield* Effect.tryPromise({
                try: () => trx
                    .insertInto("SearchableContent")
                    .values(textAv.map(t => {
                        return {
                            text: t.text,
                            createdAt: t.createdAt,
                            collection: getCollectionFromUri(t.uri),
                            uri: t.uri
                        }
                    }))
                    .onConflict((oc) => oc.column("uri").doUpdateSet({
                        text: eb => eb.ref("excluded.text")
                    }))
                    .execute(),
                catch: (error) => new DBInsertError(error)
            })
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
            const pollTopicIds = polls
                .map(p => p.container.type == "topic" ? p.container.id : undefined)
                .filter(x => x != null)
            if(pollTopicIds.length > 0) {
                yield* Effect.tryPromise({
                    try: () => trx.insertInto("Topic")
                        .values(pollTopicIds.map(p => ({id: p, synonyms: []})))
                        .onConflict(oc => oc.column("id").doNothing())
                        .execute(),
                    catch: (error) => new DBInsertError(error)
                })
            }

            yield* Effect.tryPromise({
                try: () => trx
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
                    .execute(),
                catch: (error) => new DBInsertError(error)
            })
        }
    }

    if (contentDatasetLinks.length > 0) {
        yield* processDirtyRecordsBatch(trx, contentDatasetLinks.map(c => ({uri: c.B})))
        yield* Effect.tryPromise({
            try: () => trx.insertInto("Dataset").values(contentDatasetLinks.map(c => ({
                uri: c.B,
                title: "",
                columns: []
            }))).onConflict(oc => oc.doNothing()).execute(),
            catch: (error) => new DBInsertError(error)
        })
        // TO DO: Borrar datasets que se dejaron de usar
        yield* Effect.tryPromise({
            try: () => trx
                .insertInto("_ContentToDataset")
                .values(contentDatasetLinks)
                .onConflict(oc => oc.columns(['A', 'B']).doNothing())
                .execute(),
            catch: (error) => new DBInsertError(error)
        })
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
})
