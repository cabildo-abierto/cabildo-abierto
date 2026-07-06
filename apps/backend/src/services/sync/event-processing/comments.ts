import {ATProtoStrongRef} from "@cabildo-abierto/api";
import {
    getCollectionFromUri,
    getDidFromUri,
    isArticle,
    isTopicVersion
} from "@cabildo-abierto/utils";
import {
    AppBskyFeedPost,
    AppBskyEmbedRecord,
    AppBskyEmbedRecordWithMedia,
} from "@cabildo-abierto/api";
import {isSelfLabels} from "@atproto/api/dist/client/types/com/atproto/label/defs.js";
import {
    RefAndRecord,
    SyncContentProps
} from "#/services/sync/types.js";
import {NotificationJobData} from "#/services/notifications/notifications.js";
import {processContentsBatch} from "#/services/sync/event-processing/content.js";
import {
    Processor
} from "#/services/record/processor.js";
import {Transaction} from "kysely";
import {DB} from "../../../../prisma/generated/types.js";
import {Effect} from "effect";
import {JobToAdd} from "#/jobs/worker.js";
import {DeleteProcessor} from "#/services/sync/event-processing/delete-processor.js";
import {DBDeleteError, DBInsertError, DBSelectError} from "#/utils/errors.js";
import {AppContext} from "#/setup.js";
import { processDirtyRecordsBatch } from "#/services/record/creation.js";


function getQuotedPostRef(r: AppBskyFeedPost.Record): ATProtoStrongRef | undefined {
    if (!r.embed) return undefined
    if (AppBskyEmbedRecord.isMain(r.embed)) {
        return {uri: r.embed.record.uri, cid: r.embed.record.cid}
    }
    if (AppBskyEmbedRecordWithMedia.isMain(r.embed)) {
        return {uri: r.embed.record.record.uri, cid: r.embed.record.record.cid}
    }
    return undefined
}


const createReferences = (records: RefAndRecord<AppBskyFeedPost.Record>[], trx: Transaction<DB>) => {
    const referencedRefs: ATProtoStrongRef[] = records.reduce((acc, r) => {
        const quoteRef = getQuotedPostRef(r.record)
        return [
            ...acc,
            ...(r.record.reply?.root ? [{uri: r.record.reply.root.uri, cid: r.record.reply.root.cid}] : []),
            ...(r.record.reply?.parent ? [{uri: r.record.reply.parent.uri, cid: r.record.reply.parent.cid}] : []),
            ...(quoteRef ? [quoteRef] : [])
        ]
    }, [] as ATProtoStrongRef[])
    return processDirtyRecordsBatch(trx, referencedRefs)
}


function createContents(ctx: AppContext, records: RefAndRecord<AppBskyFeedPost.Record>[], trx: Transaction<DB>) {
    const contents: { ref: ATProtoStrongRef, record: SyncContentProps }[] = records.map(r => {

        const record: SyncContentProps = {
            text: r.record.text,
            facets: [],
            selfLabels: isSelfLabels(r.record.labels) ? r.record.labels.values.map((l: any) => l.val) : undefined,
            embeds: []
        }

        return {
            ref: r.ref,
            record
        }
    })

    return processContentsBatch(ctx, trx, contents)
}


function createNotifications(posts: {replyToId: string | null, uri: string}[]): JobToAdd {
    const notifications: NotificationJobData[] = []
    for (const p of posts) {
        if (p.replyToId) {
            const replyToDid = getDidFromUri(p.replyToId)
            if (replyToDid != getDidFromUri(p.uri)) {
                const c = getCollectionFromUri(p.replyToId)
                if (isArticle(c) || isTopicVersion(c)) {
                    notifications.push({
                        userNotifiedId: getDidFromUri(p.replyToId),
                        type: "Reply",
                        causedByRecordId: p.uri,
                        created_at: new Date(),
                        reasonSubject: p.replyToId,
                    })
                }
            }
        }
    }
    return {
        label: "batch-create-notifications",
        data: notifications,
        priority: 10
    }
}


export const commentRecordProcessor: Processor<AppBskyFeedPost.Record> = {
    validator: (ctx, record: AppBskyFeedPost.Record) => {
        return Effect.succeed(AppBskyFeedPost.validateRecord(record))
    },

    addRecordsToDB: (ctx, records, trx, reprocess = false) => Effect.gen(function* () {

        /*yield* createReferences(records, trx)
        const jobs = yield* createContents(ctx, records, trx)

        const posts = records.map(({ref, record: r}) => ({
            facets: r.facets ? JSON.stringify(r.facets) : null,
            embed: r.embed ? JSON.stringify(r.embed) : null,
            uri: ref.uri,
            replyToId: r.reply ? r.reply.parent.uri : null,
            replyToCid: r.reply ? r.reply.parent.cid : null,
            quoteToId: getQuotedPostRef(r)?.uri,
            quoteToCid: getQuotedPostRef(r)?.cid,
            rootId: r.reply && r.reply.root ? r.reply.root.uri : null,
            langs: r.langs ?? []
        }))

        const existing = yield* Effect.tryPromise({
            try: () => trx
                .selectFrom("Post")
                .select("uri")
                .where("uri", "in", posts.map(p => p.uri))
                .execute(),
            catch: (e) => new DBSelectError(e)
        })

        const existingSet = new Set(existing.map(p => p.uri))

        const insertedPosts = yield* Effect.tryPromise({
            try: () => trx
                .insertInto("Comment")
                .values(posts)
                .onConflict((oc) =>
                    oc.column("uri").doUpdateSet({
                        facets: (eb) => eb.ref('excluded.facets'),
                        replyToId: (eb) => eb.ref('excluded.replyToId'),
                        quoteToId: (eb) => eb.ref('excluded.quoteToId'),
                        rootId: (eb) => eb.ref('excluded.rootId'),
                        embed: (eb) => eb.ref('excluded.embed'),
                        langs: (eb) => eb.ref('excluded.langs')
                    })
                )
                .execute(),
            catch: (e) => new DBInsertError(e)
        })

        if (insertedPosts.length > 0 && !reprocess) {
            const parents = insertedPosts.map(i => i.replyToId)
            const quotes = insertedPosts.map(i => i.quoteToId)
            const interactions = [
                ...parents,
                ...quotes,
                ...records.map(r => r.ref.uri)
            ].filter((x): x is string => x != null)

            jobs.push(
                {
                    label: "update-interactions-score",
                    data: interactions
                },
                {
                    label: "update-contents-topic-mentions",
                    data: insertedPosts.map(r => r.uri),
                    priority: 11
                },
                createNotifications(insertedPosts)
            )
        }

        if (!reprocess) {
            jobs.push({
                label: "update-following-feed-on-new-content",
                data: records.map(r => r.ref.uri)
            })
        }

        yield* ctx.worker.addJobs(jobs)
        return posts.length*/
        return 0
    })
}


export const postDeleteProcessor: DeleteProcessor = (ctx, uris) => Effect.gen(function* () {
    const rootUris = yield* Effect.tryPromise({
        try: () => ctx.kysely.transaction().execute(async (trx) => {
            const rootUris = await ctx.kysely
                .selectFrom("Comment")
                .where("uri", "in", uris)
                .select(["Comment.rootId"])
                .execute()

            await trx
                .deleteFrom("Notification")
                .where("Notification.causedByRecordId", "in", uris)
                .execute()

            await trx
                .deleteFrom("HasReacted")
                .where("HasReacted.recordId", "in", uris)
                .execute()

            await trx
                .deleteFrom("RecordModerationProcess")
                .where("recordId", "in", uris)
                .execute()

            await trx
                .deleteFrom("Comment")
                .where("Comment.uri", "in", uris)
                .execute()

            await trx
                .deleteFrom("Content")
                .where("Content.uri", "in", uris)
                .execute()

            await trx
                .deleteFrom("Record")
                .where("Record.uri", "in", uris)
                .execute()

            return rootUris
        }),
        catch: error => new DBDeleteError(error)
    })
    yield* ctx.worker.addJob("update-following-feed-on-deleted-content", rootUris.map(r => r.rootId).filter(x => x != null))
    yield* ctx.worker.addJob("update-contents-topic-mentions", uris)
})
