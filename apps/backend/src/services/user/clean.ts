import {AppContext} from "#/setup.js";
import {deleteRecords, deleteUsers} from "#/services/delete.js";
import {Effect} from "effect";
import {DBSelectError} from "#/utils/errors.js";


type ValueCount = { value: string; count: number }

export function countValues(values: string[]): ValueCount[] {
    const map = new Map<string, number>()

    for (const v of values) {
        map.set(v, (map.get(v) ?? 0) + 1)
    }

    return Array.from(map.entries()).map(([value, count]) => ({
        value,
        count,
    }))
}


export const runClean = (ctx: AppContext) => Effect.all([
    cleanRecords(ctx),
    cleanUsers(ctx)
])


// por ahora solo limpiamos follows
export const cleanRecords = (ctx: AppContext) => Effect.gen(function* () {
    const follows = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("Record")
            .select("uri")
            .innerJoin("User", "User.did", "Record.authorId")
            .where("User.inCA", "=", false)
            .where("Record.collection", "=", "app.bsky.graph.follow")
            .limit(1000)
            .execute(),
        catch: (error) => new DBSelectError(error)
    })

    yield* deleteRecords({ctx, uris: follows.map(u => u.uri), atproto: false})
})


export const cleanUsers = (ctx: AppContext) => Effect.gen(function* () {
    // borramos los usuarios que:
    //  - no estén en CA
    //  - no estén seguidos por nadie de CA
    //  - no sean autores de ningún record de la DB
    const users = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("User")
            .where("inCA", "=", false)
            .where(eb => eb.not(eb.exists(
                eb.selectFrom("Follow")
                    .innerJoin("Record", "Record.uri", "Follow.uri")
                    .innerJoin("User as Follower", "Follower.did", "Record.authorId")
                    .where("Follower.inCA", "=", true)
                    .whereRef("Follow.userFollowedId", "=", "User.did")
            )))
            .where(eb => eb.not(eb.exists(
                eb.selectFrom("Record")
                    .whereRef("Record.authorId", "=", "User.did")
            )))
            .select("did")
            .limit(250)
            .execute(),
        catch: (error) => new DBSelectError(error)
    })

    yield* deleteUsers(ctx, users.map(u => u.did))
})