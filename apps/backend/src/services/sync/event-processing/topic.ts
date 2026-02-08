import {AppContext} from "#/setup.js";
import {RefAndRecord, SyncContentProps} from "#/services/sync/types.js";
import {getDidFromUri} from "@cabildo-abierto/utils";
import {processContentsBatch} from "#/services/sync/event-processing/content.js";
import {ExpressionBuilder, OnConflictDatabase, OnConflictTables, sql} from "kysely";
import {NotificationJobData} from "#/services/notifications/notifications.js";
import {getCidFromBlobRef} from "#/services/sync/utils.js";
import {ArCabildoabiertoEmbedPoll, ArCabildoabiertoWikiTopicVersion, ATProtoStrongRef} from "@cabildo-abierto/api"
import {
    InsertRecordError,
    ProcessCreateError,
    RecordProcessor
} from "#/services/sync/event-processing/record-processor.js";
import {DeleteProcessor} from "#/services/sync/event-processing/delete-processor.js";
import {unique} from "@cabildo-abierto/utils";
import {updateTopicsCurrentVersionBatch} from "#/services/wiki/current-version.js";
import {Effect, pipe} from "effect";
import { DB } from "prisma/generated/types.js";
import {AddJobError, InvalidValueError} from "#/utils/errors.js";
import {JobToAdd} from "#/jobs/worker.js";
import {getPollId} from "#/services/write/topic.js";
import {ValidationResult} from "@atproto/lexicon";


export class TopicVersionRecordProcessor extends RecordProcessor<ArCabildoabiertoWikiTopicVersion.Record> {

    validateRecord(record: ArCabildoabiertoWikiTopicVersion.Record) {
        return Effect.gen(function* () {
            const res = ArCabildoabiertoWikiTopicVersion.validateRecord(record)
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
                            const error: ValidationResult<ArCabildoabiertoWikiTopicVersion.Record> = {
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

    addRecordsToDB(
        records: RefAndRecord<ArCabildoabiertoWikiTopicVersion.Record>[],
        reprocess: boolean = false
    ): Effect.Effect<number, ProcessCreateError | InvalidValueError> {
        const contents: { ref: ATProtoStrongRef, record: SyncContentProps }[] = records.map(r => ({
            record: {
                format: r.record.format,
                textBlob: r.record.text ? {
                    cid: getCidFromBlobRef(r.record.text),
                    authorId: getDidFromUri(r.ref.uri)
                } : undefined,
                embeds: r.record.embeds ?? []
            },
            ref: r.ref
        }))

        const topics = getUniqueTopicUpdates(records)

        const topicVersions = records.map(r => ({
            uri: r.ref.uri,
            topicId: r.record.id,
            message: r.record.message ? r.record.message : undefined,
            props: r.record.props ? JSON.stringify(r.record.props) : undefined,
            authorship: r.record.claimsAuthorship ?? false
        }))

        const insertTopics = this.ctx.kysely.transaction().execute(async (trx) => {
            await this.processRecordsBatch(trx, records)
            const jobs = await processContentsBatch(this.ctx, trx, contents)

            await trx
                .insertInto("Topic")
                .values(topics.map(t => ({...t, synonyms: []})))
                .onConflict((oc) => oc.column("id").doUpdateSet({
                    lastEdit: sql`GREATEST("Topic"."lastEdit", excluded."lastEdit")`
                }))
                .execute()

            if(topicVersions.length > 0){
                const inserted = await trx
                    .insertInto("TopicVersion")
                    .values(topicVersions)
                    .onConflict(oc => oc.column("uri").doUpdateSet({
                        topicId: eb => eb.ref("excluded.topicId"),
                        message: (eb) => eb.ref("excluded.message"),
                        props: (eb: ExpressionBuilder<OnConflictDatabase<DB, "TopicVersion">, OnConflictTables<"TopicVersion">>) => eb.ref("excluded.props")
                    }))
                    .returning(["topicId", "TopicVersion.uri"])
                    .execute()

                await updateTopicsCurrentVersionBatch(this.ctx, trx, inserted.map(t => t.topicId))

                return {inserted, jobs}
            } else {
                return {inserted: [], jobs}
            }
        })

        return pipe(
            Effect.tryPromise({
                try: () => insertTopics,
                catch: () => new InsertRecordError()
            }),
            Effect.tap(({inserted, jobs}) => {
                return !reprocess ? this.createJobs(records, inserted, topics, jobs) : Effect.void
            }),
            Effect.map(() => records.length)
        )
    }

    createJobs(
        records: RefAndRecord<ArCabildoabiertoWikiTopicVersion.Record>[],
        inserted: {uri: string, topicId: string}[] | undefined, topics: {id: string}[],
        jobs: JobToAdd[]
    ): Effect.Effect<void, AddJobError> {
        const authors = unique(records.map(r => getDidFromUri(r.ref.uri)))

        const data: NotificationJobData[] | null = inserted ? inserted.map((i) => ({
            uri: i.uri,
            topics: i.topicId,
            type: "TopicEdit"
        })) : null

        return pipe(
            data ? this.ctx.worker?.addJob("batch-create-notifications", data) : Effect.void,
            Effect.flatMap(() => {
                return addUpdateContributionsJobForTopics(this.ctx, topics.map(t => t.id))
            }),
            Effect.flatMap(() => {
                return this.ctx.worker?.addJobs([
                    ...jobs,
                    {
                        label: "update-author-status",
                        data: authors,
                        priority: 11
                    },
                    {
                        label: "update-contents-topic-mentions",
                        data: records.map(r => r.ref.uri),
                        priority: 11
                    },
                    {
                        label: "update-topic-mentions",
                        data: topics.map(t => t.id),
                        priority: 11
                    }
                ])
            })
        )

    }
}


export class TopicVersionDeleteProcessor extends DeleteProcessor {
    async deleteRecordsFromDB(uris: string[]){
        await processDeleteTopicVersionsBatch(this.ctx, uris)
    }
}


function getUniqueTopicUpdates(records: { ref: ATProtoStrongRef, record: ArCabildoabiertoWikiTopicVersion.Record }[]) {
    const topics = new Map<string, { id: string, lastEdit: Date }>()
    records.forEach(r => {
        const id = r.record.id
        const cur = topics.get(id)
        const date = new Date(r.record.createdAt)
        if (!cur) {
            topics.set(id, {id, lastEdit: date})
        } else {
            topics.set(id, {id, lastEdit: cur.lastEdit > date ? cur.lastEdit : date})
        }
    })
    return Array.from(topics.values())
}


export function addUpdateContributionsJobForTopics(ctx: AppContext, ids: string[]) {
    return ctx.worker ? ctx.worker.addJob(
        "update-topic-contributions",
        ids
    ) : Effect.void
}


export async function processDeleteTopicVersionsBatch(ctx: AppContext, uris: string[]) {
    await ctx.kysely.transaction().execute(async (trx) => {
        try {
            const topicIds = await trx
                .selectFrom("Topic")
                .innerJoin("TopicVersion", "TopicVersion.topicId", "Topic.id")
                .select(["id"])
                .where("TopicVersion.uri", "in", uris)
                .execute()

            await trx
                .deleteFrom("Notification")
                .where("causedByRecordId", "in", uris)
                .execute()

            await trx
                .deleteFrom("HasReacted")
                .where("recordId", "in", uris)
                .execute()

            await trx
                .deleteFrom("VoteReject")
                .using("Reaction")
                .whereRef("VoteReject.uri", "=", "Reaction.uri")
                .where("Reaction.subjectId", "in", uris)
                .execute()

            await trx
                .deleteFrom("Reaction")
                .where("subjectId", "in", uris)
                .execute()

            await trx
                .deleteFrom("Reference")
                .where("referencingContentId", "in", uris)
                .execute()

            await trx
                .deleteFrom("AssignedPayment")
                .where("AssignedPayment.contentId", "in", uris)
                .execute()

            await trx.deleteFrom("FollowingFeedIndex") // en realidad no debería estar
                .where("rootId", "in", uris)
                .execute()

            await trx
                .deleteFrom("RecordModerationProcess")
                .where("recordId", "in", uris)
                .execute()

            await trx
                .deleteFrom("TopicVersion")
                .where("uri", "in", uris)
                .execute()

            await trx
                .deleteFrom("Content")
                .where("uri", "in", uris)
                .execute()

            await trx
                .deleteFrom("Record")
                .where("uri", "in", uris)
                .execute()

            await updateTopicsCurrentVersionBatch(ctx, trx, topicIds.map(t => t.id))

            await Effect.runPromise(Effect.all([
                ctx.worker.addJob("update-contents-topic-mentions", uris),
                ctx.worker.addJob("update-topic-mentions", topicIds.map(t => t.id))
            ], {concurrency: "unbounded"}))
        } catch (err) {
            console.log(err)
            console.log("Error deleting topic versions")
            return
        }

    })
}