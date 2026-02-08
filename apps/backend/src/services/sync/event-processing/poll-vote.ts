import {
    getCollectionFromUri
} from "@cabildo-abierto/utils";
import {InsertRecordError, RecordProcessor} from "#/services/sync/event-processing/record-processor.js";
import {
    ArCabildoabiertoEmbedPollVote
} from "@cabildo-abierto/api"
import {DeleteProcessor} from "#/services/sync/event-processing/delete-processor.js";
import {RefAndRecord} from "#/services/sync/types.js";
import {Effect, pipe} from "effect";
import {ValidationResult} from "@atproto/lexicon";
import {CIDEncodeError, getPollId} from "#/services/write/topic.js";


export class PollVoteRecordProcessor extends RecordProcessor<ArCabildoabiertoEmbedPollVote.Record> {
    validateRecord = (record: ArCabildoabiertoEmbedPollVote.Record): Effect.Effect<ValidationResult<ArCabildoabiertoEmbedPollVote.Record>, CIDEncodeError> => {
        return Effect.gen(function* () {
            const res = ArCabildoabiertoEmbedPollVote.validateRecord(record)
            if(res.success) {
                const poll = res.value.subjectPoll
                const id = yield* getPollId(poll)
                if(id == res.value.subjectId) {
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

    }

    addRecordsToDB(records: RefAndRecord<ArCabildoabiertoEmbedPollVote.Record>[], reprocess: boolean = false) {
        records = records.filter(r => {
            return getCollectionFromUri(r.ref.uri) == "ar.cabildoabierto.embed.pollVote"
        })
        if (records.length == 0) return Effect.succeed(0)

        const insertVotes = this.ctx.kysely.transaction().execute(async (trx) => {

            await this.processRecordsBatch(trx, records)

            const containers = records
                .map(r => {
                    if(r.record.subjectPoll.containerRef.uri) {
                        return {uri: r.record.subjectPoll.containerRef.uri}
                    } else {
                        return null
                    }
                })
                .filter(x => x != null)
            await this.processDirtyRecordsBatch(trx, containers)

            const polls = records.map(r => ({
                id: r.record.subjectId,
                choices: r.record.subjectPoll.choices.map(c => c.label),
                description: r.record.subjectPoll.description,
                createdAt: r.record.subjectPoll.createdAt
            }))

            if(polls.length > 0) {
                await trx
                    .insertInto("Poll")
                    .values(polls)
                    .onConflict(oc => oc.column("id").doNothing())
                    .execute()
            }

            const votes = records.map(r => ({
                uri: r.ref.uri,
                pollId: r.record.subjectId,
                choice: r.record.choice
            }))

            await trx
                .insertInto("PollVote")
                .values(votes)
                .onConflict((oc) =>
                    oc.column("uri").doUpdateSet({
                        pollId: eb => eb.ref('excluded.pollId'),
                        choice: eb => eb.ref("excluded.choice")
                    })
                )
                .execute()
        })

        return pipe(
            Effect.tryPromise({
                try: () => insertVotes,
                catch: error => {
                    return new InsertRecordError(error instanceof Error ? error : undefined)
                }
            }),
            Effect.map(() => records.length),
            Effect.withSpan("addRecordsToDB PollVote")
        )
    }
}


export class PollVoteDeleteProcessor extends DeleteProcessor {
    async deleteRecordsFromDB(uris: string[]) {
        uris = uris.filter(uri => getCollectionFromUri(uri) == "ar.cabildoabierto.embed.pollVote")
        if (uris.length == 0) return

        await this.ctx.kysely.transaction().execute(async (db) => {
            await db.deleteFrom("TopicInteraction").where("recordId", "in", uris).execute()
            await db.deleteFrom("Notification").where("causedByRecordId", "in", uris).execute()
            await db.deleteFrom("PollVote").where("uri", "in", uris).execute()
            await db.deleteFrom("Record").where("uri", "in", uris).execute()
        })
    }
}