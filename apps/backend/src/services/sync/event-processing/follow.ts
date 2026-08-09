import {AppBskyGraphFollow} from "@atproto/api"
import {
    Processor
} from "#/services/sync/event-processing/record-processor.js";
import {getDidFromUri} from "@cabildo-abierto/utils";
import {Effect} from "effect";
import {DeleteProcessor} from "#/services/sync/event-processing/delete-processor.js";
import {DBDeleteError, DBInsertError} from "#/utils/errors.js";
import {
    incrementCaFollowCounters,
    decrementCaFollowCounters
} from "#/services/user/follows.js";
import {createUsersBatch} from "#/services/user/creation.js";


export const followProcessor: Processor<AppBskyGraphFollow.Record> = {
    validator: (ctx, record: AppBskyGraphFollow.Record) => {
        return Effect.succeed(AppBskyGraphFollow.validateRecord(record))
    },

    addRecordsToDB: (ctx, records, trx, reprocess = false) => Effect.gen(function* () {
        const follows = records.map(r => ({
            uri: r.ref.uri,
            userFollowedId: r.record.subject,
            authorId: getDidFromUri(r.ref.uri)
        }))

        yield* createUsersBatch(trx, records.map(r => r.record.subject))

        const insertedFollows = yield* Effect.tryPromise({
            try: () => trx
                .insertInto("Follow")
                .values(follows)
                .onConflict((oc) => oc.column("uri").doNothing())
                .returning(["uri", "userFollowedId", "authorId"])
                .execute(),
            catch: error => new DBInsertError(error)
        })

        yield* Effect.tryPromise({
            try: () => incrementCaFollowCounters(trx, insertedFollows),
            catch: error => new DBInsertError(error)
        })

        if (!reprocess) {
            yield* ctx.worker?.addJob("update-following-feed-on-follow-change", follows.map(f => ({
                follower: getDidFromUri(f.uri),
                followed: f.userFollowedId
            })))
        }

        return records.length
    })
}

export const followRecordProcessor = followProcessor


export const followDeleteProcessor: DeleteProcessor = (ctx, uris) => Effect.gen(function* () {
    const follows = yield* Effect.tryPromise({
        try: () => ctx.kysely.transaction().execute(async (trx) => {
            const follows = await trx.selectFrom("Follow")
                .where("Follow.uri", "in", uris)
                .select(["Follow.userFollowedId", "Follow.uri", "Follow.authorId"])
                .execute()

            await decrementCaFollowCounters(trx, follows)

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
        follower: f.authorId ?? getDidFromUri(f.uri),
        followed: f.userFollowedId
    })).filter(x => x.followed != null))
})
