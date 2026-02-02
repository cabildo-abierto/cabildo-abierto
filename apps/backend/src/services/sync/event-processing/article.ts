import {processContentsBatch} from "#/services/sync/event-processing/content.js";
import {isSelfLabels} from "@atproto/api/dist/client/types/com/atproto/label/defs.js";
import {getDidFromUri, unique} from "@cabildo-abierto/utils";
import {SyncContentProps} from "#/services/sync/types.js";
import {ArCabildoabiertoFeedArticle, ATProtoStrongRef} from "@cabildo-abierto/api"
import {getCidFromBlobRef} from "#/services/sync/utils.js";
import {InsertRecordError, RecordProcessor} from "#/services/sync/event-processing/record-processor.js";
import {DeleteProcessor} from "#/services/sync/event-processing/delete-processor.js";
import {Effect} from "effect";


export class ArticleRecordProcessor extends RecordProcessor<ArCabildoabiertoFeedArticle.Record> {

    validateRecord = ArCabildoabiertoFeedArticle.validateRecord

    addRecordsToDB(records: {ref: ATProtoStrongRef, record: ArCabildoabiertoFeedArticle.Record}[], reprocess: boolean = false) {
        const contents: { ref: ATProtoStrongRef, record: SyncContentProps }[] = records.map(r => ({
            record: {
                format: r.record.format,
                textBlob: {
                    cid: getCidFromBlobRef(r.record.text),
                    authorId: getDidFromUri(r.ref.uri)
                },
                embeds: r.record.embeds ?? [],
                selfLabels: isSelfLabels(r.record.labels) ? r.record.labels.values.map((l: any) => l.val) : undefined,
            },
            ref: r.ref
        }))

        const articles = records.map(r => ({
            uri: r.ref.uri,
            title: r.record.title,
            previewImage: r.record.preview ? getCidFromBlobRef(r.record.preview) : undefined,
            description: r.record.description
        }))

        const insertArticle = this.ctx.kysely.transaction().execute(async (trx) => {
            await this.processRecordsBatch(trx, records)
            await processContentsBatch(this.ctx, trx, contents)

            await trx
                .insertInto("Article")
                .values(articles)
                .onConflict((oc) =>
                    oc.column("uri").doUpdateSet({
                        title: (eb) => eb.ref('excluded.title'),
                        previewImage: eb => eb.ref("excluded.previewImage"),
                        description: eb => eb.ref("excluded.description")
                    })
                )
                .execute()
        })

        const authors = unique(records.map(r => getDidFromUri(r.ref.uri)))

        const addJobs = this.ctx.worker ? Effect.all([
            this.ctx.worker?.addJob("update-author-status", authors, 11),
            this.ctx.worker?.addJob("update-following-feed-on-new-content",  records.map(r => r.ref.uri)),
            this.ctx.worker?.addJob("update-contents-topic-mentions", records.map(r => r.ref.uri), 11),
            this.ctx.worker?.addJob("update-interactions-score", records.map(r => r.ref.uri), 11)
        ], {concurrency: "unbounded"}) : Effect.void

        return Effect.gen(function*() {
            yield* Effect.tryPromise({
                try: () => insertArticle,
                catch: () => new InsertRecordError()
            })

            if(!reprocess) yield* addJobs

            return records.length
        })
    }
}


export class ArticleDeleteProcessor extends DeleteProcessor {
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
                .deleteFrom("Article")
                .where("Article.uri", "in", uris)
                .execute()

            await trx
                .deleteFrom("DiscoverFeedIndex")
                .where("contentId", "in", uris)
                .execute()

            await trx
                .deleteFrom("FollowingFeedIndex")
                .where("contentId", "in", uris)
                .execute()

            await trx
                .deleteFrom("FollowingFeedIndex")
                .where("rootId", "in", uris)
                .execute()

            await trx
                .deleteFrom("RecordModerationProcess")
                .where("recordId", "in", uris)
                .execute()

            await trx
                .deleteFrom("AssignedPayment")
                .where("AssignedPayment.contentId", "in", uris)
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
        if(this.ctx.worker) {
            await Effect.runPromise(this.ctx.worker.addJob("update-contents-topic-mentions", uris))
        }
    }
}