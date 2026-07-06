import {AppContext} from "#/setup.js";
import {RefAndRecord} from "#/services/sync/types.js";
import {ExpressionBuilder, OnConflictDatabase, OnConflictTables} from "kysely";
import {NotificationJobData} from "#/services/notifications/notifications.js";
import {ArCabildoabiertoWikiTopic} from "@cabildo-abierto/api"
import {
    addRecordsToDBBatch,
    InsertRecordError,
    ProcessCreateError,
    Processor,
    ValidationError
} from "#/services/record/processor.js";
import {DeleteProcessor} from "#/services/sync/event-processing/delete-processor.js";
import {unique} from "@cabildo-abierto/utils";
import {updateTopicsCurrentVersionBatch} from "#/services/wiki/current-version.js";
import {Effect, pipe} from "effect";
import {DB} from "prisma/generated/types.js";
import {AddJobError, DBDeleteError, InvalidValueError} from "#/utils/errors.js";
import {JobToAdd} from "#/jobs/worker.js";
import {ValidationResult} from "@atproto/lexicon";


/*function validateEmbeds() {
    if (res.value.embeds) {
        const polls = res.value.embeds
            .map(e => e.value)
            .filter(e => ArCabildoabiertoEmbedPoll.isMain(e))
        for (const p of polls) {
            const key = yield* getPollKey(p.poll)
            if (key != p.key) {
                const error: ValidationResult<ArCabildoabiertoWikiTopic.Record> = {
                    success: false,
                    error: new Error("Invalid poll.")
                }
                return yield* Effect.succeed(error)
            }
        }
    }
}*/


export const topicRecordProcessor: Processor<ArCabildoabiertoWikiTopic.Record> = {
    validator: (ctx: AppContext, record: ArCabildoabiertoWikiTopic.Record): Effect.Effect<ValidationResult<ArCabildoabiertoWikiTopic.Record>, ValidationError> => {
        return Effect.succeed(ArCabildoabiertoWikiTopic.validateRecord(record))
    },
    addRecordsToDB: (
        ctx: AppContext,
        records: RefAndRecord<ArCabildoabiertoWikiTopic.Record>[],
        reprocess: boolean = false
    ): Effect.Effect<number, ProcessCreateError | InvalidValueError> => {
        if(records.length === 0) return Effect.succeed(0)
        const topicIds = unique(records.map(r => r.record.id))

        const topicVersions = records.map(r => ({
            uri: r.ref.uri,
            topicId: r.record.id,
            message: r.record.message ? r.record.message : undefined,
            props: r.record.props ? JSON.stringify(r.record.props) : undefined
        }))

        const insertTopics = ctx.kysely.transaction().execute(async (trx) => {
            await addRecordsToDBBatch(trx, records)

            await trx
                .insertInto("Topic")
                .values(topicIds.map(t => ({id: t})))
                .onConflict((oc) => oc.column("id").doNothing())
                .execute()

            if (topicVersions.length > 0) {
                const inserted = await trx
                    .insertInto("TopicVersion")
                    .values(topicVersions)
                    .onConflict(oc => oc.column("uri").doUpdateSet({
                        topicId: eb => eb.ref("excluded.topicId"),
                        props: (eb: ExpressionBuilder<OnConflictDatabase<DB, "TopicVersion">, OnConflictTables<"TopicVersion">>) => eb.ref("excluded.props")
                    }))
                    .returning(["topicId", "TopicVersion.uri"])
                    .execute()

                // await updateTopicsCurrentVersionBatch(ctx, trx, inserted.map(t => t.topicId))

                return {inserted, jobs: []}
            } else {
                return {inserted: [], jobs: []}
            }
        })

        return pipe(
            Effect.tryPromise({
                try: () => insertTopics,
                catch: (error) => new InsertRecordError(error)
            }),
            Effect.tap(({inserted, jobs}) => {
                return !reprocess ? createJobs(ctx, records, inserted, topicIds, jobs) : Effect.void
            }),
            Effect.map(() => records.length),
            Effect.withSpan("TopicVersionRecordProcessor.addRecordsToDB")
        )
    }
}


const createJobs = (
    ctx: AppContext,
    records: RefAndRecord<ArCabildoabiertoWikiTopic.Record>[],
    inserted: { uri: string, topicId: string }[] | undefined,
    topicIds: string[],
    jobs: JobToAdd[]
): Effect.Effect<void, AddJobError> => {
    return Effect.gen(function* () {
        const data: NotificationJobData[] | null = inserted ? inserted.map((i) => ({
            uri: i.uri,
            topics: i.topicId,
            type: "TopicEdit"
        })) : null

        if (data) {
            yield* ctx.worker?.addJob("batch-create-notifications", data)
        }
        yield* ctx.worker?.addJobs(jobs)
    })
}

export const topicVersionDeleteProcessor: DeleteProcessor = (ctx, uris) => Effect.gen(function* () {
    yield* Effect.tryPromise({
        try: () => ctx.kysely.transaction().execute(async (trx) => {

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
                .deleteFrom("Reaction")
                .where("subjectId", "in", uris)
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
                .deleteFrom("Record")
                .where("uri", "in", uris)
                .execute()

            await updateTopicsCurrentVersionBatch(ctx, trx, topicIds.map(t => t.id))

            return topicIds
        }),
        catch: error => new DBDeleteError(error)
    })
})


export function addUpdateContributionsJobForTopics(ctx: AppContext, ids: string[]) {
    return ctx.worker ? ctx.worker.addJob(
        "update-topic-contributions",
        ids
    ) : Effect.void
}