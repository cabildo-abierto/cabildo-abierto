import {
    getCollectionFromUri,
    getPollContainerFromId,
    getPollKeyFromId
} from "@cabildo-abierto/utils";
import {
    processDirtyRecordsBatch,
    Processor
} from "#/services/sync/event-processing/record-processor.js";
import {ArCabildoabiertoEmbedPollVote} from "@cabildo-abierto/api"
import {DeleteProcessor} from "#/services/sync/event-processing/delete-processor.js";
import {RefAndRecord} from "#/services/sync/types.js";
import {Effect} from "effect";
import {ValidationResult} from "@atproto/lexicon";
import {CIDEncodeError, getPollKey} from "#/services/write/topic.js";
import {DBDeleteError, DBInsertError} from "#/utils/errors.js";
import {AppContext} from "#/setup.js";


export const pollVoteProcessor: Processor<ArCabildoabiertoEmbedPollVote.Record> = {
    validator: (ctx, record: ArCabildoabiertoEmbedPollVote.Record): Effect.Effect<ValidationResult<ArCabildoabiertoEmbedPollVote.Record>, CIDEncodeError> => {
        return Effect.gen(function* () {
            const res = ArCabildoabiertoEmbedPollVote.validateRecord(record)
            if (res.success) {
                const poll = res.value.subjectPoll
                const key = yield* getPollKey(poll)

                if (key == getPollKeyFromId(res.value.subjectId)) {
                    return res
                } else {
                    return {
                        success: false,
                        error: new Error("Invalid poll id")
                    }
                }
            } else {
                return res
            }
        })
    },

    addRecordsToDB: (ctx: AppContext, records: RefAndRecord<ArCabildoabiertoEmbedPollVote.Record>[], trx, reprocess = false) => {
        records = records.filter(r => getCollectionFromUri(r.ref.uri) == "ar.cabildoabierto.embed.pollVote")
        if (records.length == 0) return Effect.succeed(0)

        return Effect.gen(function* () {
            const containers = records
                .map(r => {
                    const container = getPollContainerFromId(r.record.subjectId)
                    if (container.uri) return {uri: container.uri}
                    return null
                })
                .filter((x): x is { uri: string } => x != null)
            yield* processDirtyRecordsBatch(trx, containers)

            const polls = records.map(r => ({
                id: r.record.subjectId,
                choices: r.record.subjectPoll.choices.map(c => c.label),
                description: r.record.subjectPoll.description,
                createdAt: new Date()
            }))

            if (polls.length > 0) {
                yield* Effect.tryPromise({
                    try: () => trx
                        .insertInto("Poll")
                        .values(polls)
                        .onConflict(oc => oc.column("id").doNothing())
                        .execute(),
                    catch: error => new DBInsertError(error)
                })
            }

            const votes = records.map(r => ({
                uri: r.ref.uri,
                pollId: r.record.subjectId,
                choice: r.record.choice
            }))

            yield* Effect.tryPromise({
                try: () => trx
                    .insertInto("PollVote")
                    .values(votes)
                    .onConflict((oc) =>
                        oc.column("uri").doUpdateSet({
                            pollId: eb => eb.ref('excluded.pollId'),
                            choice: eb => eb.ref("excluded.choice")
                        })
                    )
                    .execute(),
                catch: error => new DBInsertError(error)
            })

            return records.length
        }).pipe(Effect.withSpan("addRecordsToDB PollVote"))
    }
}


export const pollVoteDeleteProcessor: DeleteProcessor = (ctx, uris) => {
    return Effect.tryPromise({
        try: () => ctx.kysely.transaction().execute(async (db) => {
            await db.deleteFrom("TopicInteraction").where("recordId", "in", uris).execute()
            await db.deleteFrom("Notification").where("causedByRecordId", "in", uris).execute()
            await db.deleteFrom("PollVote").where("uri", "in", uris).execute()
            await db.deleteFrom("Record").where("uri", "in", uris).execute()
        }),
        catch: error => new DBDeleteError(error)
    })
}
