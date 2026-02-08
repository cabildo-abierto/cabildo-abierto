import {processContentsBatch} from "#/services/sync/event-processing/content.js";
import {isSelfLabels} from "@atproto/api/dist/client/types/com/atproto/label/defs.js";
import {getDidFromUri, unique} from "@cabildo-abierto/utils";
import {SyncContentProps} from "#/services/sync/types.js";
import {ArCabildoabiertoEmbedPoll, ArCabildoabiertoFeedArticle, ATProtoStrongRef} from "@cabildo-abierto/api"
import {getCidFromBlobRef} from "#/services/sync/utils.js";
import {InsertRecordError, RecordProcessor} from "#/services/sync/event-processing/record-processor.js";
import {DeleteProcessor} from "#/services/sync/event-processing/delete-processor.js";
import {Effect} from "effect";
import {JobToAdd} from "#/jobs/worker.js";
import {getPollId} from "#/services/write/topic.js";
import {ValidationResult} from "@atproto/lexicon";





export class ArticleRecordProcessor extends RecordProcessor<ArCabildoabiertoFeedArticle.Record> {

    validateRecord(record: ArCabildoabiertoFeedArticle.Record) {
        return Effect.gen(function* () {
            const res = ArCabildoabiertoFeedArticle.validateRecord(record)
            if(!res.success) {
                return yield* Effect.succeed(res)
            } else {
                if(res.value.embeds) {
                    const polls = res.value.embeds
                        .map(e => e.value)
                        .filter(e => ArCabildoabiertoEmbedPoll.isMain(e))
                    for(const p of polls) {
                        const id = yield* getPollId(p.poll)
                        if(id != p.id) {
                            const error: ValidationResult<ArCabildoabiertoFeedArticle.Record> = {
                                success: false,
                                error: new Error("Invalid poll.")
                            }
                            return yield* Effect.succeed(error)
                        }
                    }
                }
                return yield* Effect.succeed(res)
            }
        })
    }

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

        let jobs: JobToAdd[] = []
        const insertArticle = this.ctx.kysely.transaction().execute(async (trx) => {
            await this.processRecordsBatch(trx, records)
            jobs.push(...await processContentsBatch(this.ctx, trx, contents))

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

        jobs.push(
            {
                label: "update-author-status",
                data: authors,
                priority: 11
            },
            {
                label: "update-following-feed-on-new-content",
                data: records.map(r => r.ref.uri)
            },
            {
                label: "update-contents-topic-mentions",
                data: records.map(r => r.ref.uri),
                priority: 11
            },
            {
                label: "update-interactions-score",
                data: records.map(r => r.ref.uri),
                priority: 11
            }
        )

        const addJobs = this.ctx.worker?.addJobs(jobs)

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