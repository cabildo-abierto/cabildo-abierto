import {ATProtoStrongRef} from "#/lib/types.js";
import {
    getCollectionFromUri,
    getDidFromUri,
    isArticle,
    isTopicVersion
} from "@cabildo-abierto/utils";
import {
    AppBskyFeedPost,
    ArCabildoabiertoEmbedVisualization,
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
import {RecordProcessor} from "#/services/sync/event-processing/record-processor.js";
import {DeleteProcessor} from "#/services/sync/event-processing/delete-processor.js";
import {Transaction} from "kysely";
import {DB} from "../../../../prisma/generated/types.js";


export class PostRecordProcessor extends RecordProcessor<AppBskyFeedPost.Record> {

    validateRecord = AppBskyFeedPost.validateRecord

    async createReferences(records: RefAndRecord<AppBskyFeedPost.Record>[], trx: Transaction<DB>){
        const referencedRefs: ATProtoStrongRef[] = records.reduce((acc, r) => {
            const quoteRef = this.getQuotedPostRef(r.record)
            return [
                ...acc,
                ...(r.record.reply?.root ? [{uri: r.record.reply.root.uri, cid: r.record.reply.root.cid}] : []),
                ...(r.record.reply?.parent ? [{uri: r.record.reply.parent.uri, cid: r.record.reply.parent.cid}] : []),
                ...(quoteRef? [quoteRef] : [])
            ]
        }, [] as ATProtoStrongRef[])
        await this.processDirtyRecordsBatch(trx, referencedRefs)
    }

    async createContents(records: RefAndRecord<AppBskyFeedPost.Record>[], trx: Transaction<DB>){
        const contents: { ref: ATProtoStrongRef, record: SyncContentProps }[] = records.map(r => {
            let datasetsUsed: string[] = []
            if (ArCabildoabiertoEmbedVisualization.isMain(r.record.embed) && ArCabildoabiertoEmbedVisualization.isDatasetDataSource(r.record.embed.dataSource)) {
                datasetsUsed.push(r.record.embed.dataSource.dataset)
            }

            return {
                ref: r.ref,
                record: {
                    format: "plain-text",
                    text: r.record.text,
                    selfLabels: isSelfLabels(r.record.labels) ? r.record.labels.values.map((l: any) => l.val) : undefined,
                    datasetsUsed,
                    embeds: []
                }
            }
        })

        await processContentsBatch(this.ctx, trx, contents)
    }

    getQuotedPostRef(r: AppBskyFeedPost.Record){
        if (!r.embed){
            return undefined
        }
        else {
            let quoteRef: ATProtoStrongRef | undefined = undefined
            if (AppBskyEmbedRecord.isMain(r.embed)){
                quoteRef = {uri: r.embed.record.uri, cid: r.embed.record.cid}
            }
            else {
                if (AppBskyEmbedRecordWithMedia.isMain(r.embed)){
                    quoteRef = {uri: r.embed.record.record.uri, cid: r.embed.record.record.cid}
                }
            }
            return quoteRef
        }
    }

    async addRecordsToDB(records: RefAndRecord<AppBskyFeedPost.Record>[], reprocess: boolean = false) {
        const insertedPosts = await this.ctx.kysely.transaction().execute(async (trx) => {
            await this.processRecordsBatch(trx, records)
            await this.createReferences(records, trx)
            await this.createContents(records, trx)

            const posts = records.map(({ref, record: r}) => {
                return {
                    facets: r.facets ? JSON.stringify(r.facets) : null,
                    embed: r.embed ? JSON.stringify(r.embed) : null,
                    uri: ref.uri,
                    replyToId: r.reply ? r.reply.parent.uri : null,
                    replyToCid: r.reply ? r.reply.parent.cid : null,
                    quoteToId: this.getQuotedPostRef(r)?.uri,
                    quoteToCid: this.getQuotedPostRef(r)?.cid,
                    rootId: r.reply && r.reply.root ? r.reply.root.uri : null,
                    langs: r.langs ?? []
                }
            })

            const existing = await trx
                .selectFrom("Post")
                .select("uri")
                .where("uri", "in", posts.map(p => p.uri))
                .execute()

            const existingSet = new Set(existing.map(p => p.uri))

            await trx
                .insertInto("Post")
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
                .execute()

            return posts
                .filter(p => !existingSet.has(p.uri))
        })

        if (insertedPosts && !reprocess) {
            const parents = insertedPosts.map(i => i.replyToId)
            const quotes = insertedPosts.map(i => i.quoteToId)
            const interactions = [...parents, ...quotes, ...records.map(r => r.ref.uri)].filter(x => x != null)

            await Promise.all([
                this.ctx.worker?.addJob("update-interactions-score", interactions),
                this.createNotifications(insertedPosts),
                this.ctx.worker?.addJob("update-contents-topic-mentions", insertedPosts.map(r => r.uri), 11)
            ])
        }
    }

    async createNotifications(posts: {replyToId: string | null, uri: string}[]) {
        const notifications: NotificationJobData[] = []
        for(const p of posts) {
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
        this.ctx.worker?.addJob("batch-create-notifications", notifications, 10)
    }
}


export class PostDeleteProcessor extends DeleteProcessor {
    async deleteRecordsFromDB(uris: string[]){
        await this.ctx.kysely.transaction().execute(async (trx) => {
            await trx
                .deleteFrom("Notification")
                .where("Notification.causedByRecordId", "in", uris)
                .execute()

            await trx
                .deleteFrom("TopicInteraction")
                .where("TopicInteraction.recordId", "in", uris)
                .execute()

            await trx
                .deleteFrom("HasReacted")
                .where("HasReacted.recordId", "in", uris)
                .execute()

            await trx
                .deleteFrom("Reference")
                .where("Reference.referencingContentId", "in", uris)
                .execute()

            await trx
                .deleteFrom("Post")
                .where("Post.uri", "in", uris)
                .execute()

            await trx
                .deleteFrom("Content")
                .where("Content.uri", "in", uris)
                .execute()

            await trx
                .deleteFrom("Record")
                .where("Record.uri", "in", uris)
                .execute()
        })
        await this.ctx.worker?.addJob("update-contents-topic-mentions", uris)
    }
}