import {AppBskyGraphFollow} from "@atproto/api"
import {InsertRecordError, RecordProcessor} from "#/services/sync/event-processing/record-processor.js";
import {RefAndRecord} from "#/services/sync/types.js";
import {getDidFromUri} from "@cabildo-abierto/utils";
import {Effect} from "effect";
import {DeleteProcessor} from "#/services/sync/event-processing/delete-processor.js";
import {DBDeleteError} from "#/utils/errors.js";


export class FollowRecordProcessor extends RecordProcessor<AppBskyGraphFollow.Record> {
    validateRecord(record: AppBskyGraphFollow.Record) {
        return Effect.succeed(AppBskyGraphFollow.validateRecord(record))
    }

    addRecordsToDB(records: RefAndRecord<AppBskyGraphFollow.Record>[], reprocess: boolean = false) {

        const follows = records.map(r => ({
            uri: r.ref.uri,
            userFollowedId: r.record.subject,
            authorId: getDidFromUri(r.ref.uri)
        }))

        const insertRecords = this.ctx.kysely.transaction().execute(async (trx) => {
            await this.processRecordsBatch(trx, records)
            await this.createUsersBatch(trx, records.map(r => r.record.subject))

            await trx
                .insertInto("Follow")
                .values(follows)
                .onConflict((oc) =>
                    oc.column("uri").doUpdateSet({
                        userFollowedId: (eb) => eb.ref('excluded.userFollowedId'),
                    })
                )
                .execute()
            return records.length
        })

        const addJobs = !reprocess ? this.ctx.worker?.addJob("update-following-feed-on-follow-change", follows.map(f => ({
            follower: getDidFromUri(f.uri),
            followed: f.userFollowedId
        }))) : undefined

        return Effect.tryPromise({
            try: () => insertRecords,
            catch: () => new InsertRecordError()
        }).pipe(
            Effect.tap(() => addJobs)
        )
    }
}


export const followDeleteProcessor: DeleteProcessor = (ctx, uris) => Effect.gen(function* () {
    const follows = yield* Effect.tryPromise({
        try: () => ctx.kysely.transaction().execute(async (trx) => {
            const follows = await trx.selectFrom("Follow")
                .where("Follow.uri", "in", uris)
                .select(["Follow.userFollowedId", "Follow.uri"])
                .execute()

            await trx
                .deleteFrom("Follow")
                .where("Follow.uri", "in", uris)
                .execute()

            await trx
                .deleteFrom("Record")
                .where("Record.uri", "in", uris)
                .execute()

            return follows
        }),
        catch: error => new DBDeleteError(error)
    })

    yield* ctx.worker.addJob("update-following-feed-on-follow-change", follows.map(f => ({
        follower: getDidFromUri(f.uri),
        followed: f.userFollowedId
    })).filter(x => x.followed != null))
})