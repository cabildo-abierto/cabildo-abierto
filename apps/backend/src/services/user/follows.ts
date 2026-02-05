import {AppContext} from "#/setup.js";
import {getCAFollowersDids, getCAFollowsDids} from "#/services/feed/inicio/following.js";
import {unique} from "@cabildo-abierto/utils";
import {
    DataPlane,
    FetchFromBskyError,
    joinMapsInPlace,
    makeDataPlane
} from "#/services/hydration/dataplane.js";
import {Agent, SessionAgent} from "#/utils/session-agent.js";
import * as Effect from "effect/Effect";
import {
    ArCabildoabiertoActorDefs
} from "@cabildo-abierto/api"
import {HandleResolutionError, unfollow} from "#/services/user/users.js";
import {hydrateProfileViewBasic} from "#/services/hydration/profile.js";
import {EffHandlerNoAuth} from "#/utils/handler.js";
import {handleOrDidToDid} from "#/id-resolver.js";
import {DBSelectError} from "#/utils/errors.js";
import {$Typed, AppBskyActorDefs} from "@atproto/api";
import {ATDeleteRecordError} from "#/services/delete.js";
import {ProcessDeleteError} from "#/services/sync/event-processing/get-record-processor.js";

async function getFollowxFromCA(
    ctx: AppContext,
    did: string,
    kind: "follows" | "followers"
) {
    const dids = kind == "follows" ?
        await getCAFollowsDids(ctx, did) :
        await getCAFollowersDids(ctx, did)

    return unique(dids)
}


const getFollowxFromBsky = (
    agent: Agent,
    did: string,
    kind: "follows" | "followers"
): Effect.Effect<string[], FetchFromBskyError, DataPlane> => Effect.gen(function* () {
    const users = yield* Effect.tryPromise({
        try: async () => kind == "follows" ?
            (await agent.bsky.app.bsky.graph.getFollows({actor: did})).data.follows :
            (await agent.bsky.app.bsky.graph.getFollowers({actor: did})).data.followers,
        catch: () => new FetchFromBskyError()
    })

    const data = (yield* DataPlane).getState()

    const profiles: Map<string, $Typed<AppBskyActorDefs.ProfileViewBasic>> = new Map(users.map(u => [u.did, {
        ...u,
        $type: "app.bsky.actor.defs#profileViewBasic"
    }]))
    joinMapsInPlace(
        data.bskyBasicUsers,
        profiles
    )
    return users.map(u => u.did)
})


export const getFollowx = (
    ctx: AppContext,
    agent: Agent,
    {handleOrDid, kind}: {
    handleOrDid: string,
    kind: "follows" | "followers"
}): Effect.Effect<ArCabildoabiertoActorDefs.ProfileViewBasic[], DBSelectError | FetchFromBskyError | HandleResolutionError, DataPlane> => Effect.gen(function* () {
    const data = yield* DataPlane

    const did = yield* handleOrDidToDid(ctx, handleOrDid)

    const [caUsers, bskyUsers] = yield* Effect.all([
        Effect.promise(() => getFollowxFromCA(ctx, did, kind)),
        getFollowxFromBsky(agent, did, kind)
    ], {concurrency: "unbounded"})

    const userList = unique([...caUsers, ...bskyUsers])

    yield* data.fetchProfileViewHydrationData(userList)

    const users = yield* Effect.all(userList.map(u => hydrateProfileViewBasic(ctx, u)))

    return users.filter(u => u != null)
})


export const getFollowsHandler: EffHandlerNoAuth<{
    params: { handleOrDid: string }
}, ArCabildoabiertoActorDefs.ProfileViewBasic[]> = (ctx, agent, {params}) => {
    return Effect.provideServiceEffect(
        getFollowx(ctx, agent, {handleOrDid: params.handleOrDid, kind: "follows"}).pipe(
            Effect.catchAll(() => Effect.fail("Ocurrió un error al obtener los usuarios."))
        ),
        DataPlane,
        makeDataPlane(ctx, agent)
    )
}


export const getFollowers: EffHandlerNoAuth<{
    params: { handleOrDid: string }
}, ArCabildoabiertoActorDefs.ProfileViewBasic[]> = (ctx, agent, {params}) => {
    return Effect.provideServiceEffect(
        getFollowx(ctx, agent, {handleOrDid: params.handleOrDid, kind: "followers"}).pipe(
            Effect.catchAll(() => Effect.fail("Ocurrió un error al obtener los usuarios."))
        ),
        DataPlane,
        makeDataPlane(ctx, agent)
    )
}


export const maybeClearFollows = (ctx: AppContext, agent: SessionAgent): Effect.Effect<void, FetchFromBskyError | ATDeleteRecordError | ProcessDeleteError> => {
    const bskyDid = "did:plc:z72i7hdynmk6r22z27h6tvur"

    return Effect.tryPromise({
        try: () => agent.bsky.app.bsky.graph.getFollows({actor: agent.did}),
        catch: () => new FetchFromBskyError()
    }).pipe(
        Effect.flatMap(res => {
            if(res.success) {
                const follows = res.data.follows
                if (follows && follows.length == 1 && follows[0].did == bskyDid && follows[0].viewer?.following) {
                    return unfollow(ctx, agent, follows[0].viewer.following)
                }
            }
            return Effect.void
        })
    )
}


export async function updateAllFollowCounters(ctx: AppContext) {
    const batchSize = 5
    let offset = 0

    while(true) {
        ctx.logger.pino.info({offset, batchSize}, "updating follow counters")
        const users = await ctx.kysely.transaction().execute(async () => {
            const users = await ctx.kysely
                .selectFrom("User")
                .where("User.inCA", "=", true)
                .select([
                    "did",
                    (eb) =>
                        eb
                            .selectFrom("Follow")
                            .innerJoin("Record", "Record.uri", "Follow.uri")
                            .innerJoin("User as Follower", "Follower.did", "Record.authorId")
                            .select(eb.fn.countAll<number>().as("count"))
                            .where("Follower.inCA", "=", true)
                            .whereRef("Follow.userFollowedId", "=", "User.did")
                            .as("followersCount"),
                    (eb) =>
                        eb
                            .selectFrom("Record")
                            .whereRef("Record.authorId", "=", "User.did")
                            .innerJoin("Follow", "Follow.uri", "Record.uri")
                            .innerJoin("User as UserFollowed", "UserFollowed.did", "Follow.userFollowedId")
                            .where("UserFollowed.inCA", "=", true)
                            .select(eb.fn.countAll<number>().as("count"))
                            .as("followsCount"),
                ])
                .offset(offset)
                .limit(batchSize)
                .orderBy("User.created_at_tz asc")
                .execute()

            await ctx.kysely
                .insertInto("User")
                .values(users.map(u => {
                    return {
                        did: u.did,
                        caFollowingCount: u.followsCount ?? 0,
                        caFollowersCount: u.followersCount ?? 0
                    }
                }))
                .onConflict(oc => oc
                .column("did")
                .doUpdateSet(eb => ({
                    caFollowersCount: eb.ref("excluded.caFollowersCount"),
                    caFollowingCount: eb.ref("excluded.caFollowingCount")
                })))
                .execute()

            return users
        })

        offset += batchSize
        if(users.length < batchSize) {
            break
        }
    }
}


export async function deleteNonCAFollows(ctx: AppContext) {
    for(let i = 0; i < 20; i++) {
        const t1 = Date.now()
        const batchSize = 100000
        await ctx.kysely.transaction().execute(async trx => {
            const result = await trx
                .deleteFrom("Follow")
                .where("uri", "in", (eb) =>
                    eb.selectFrom("Record")
                        .innerJoin("User", "User.did", "Record.authorId")
                        .select("Record.uri")
                        .where("User.inCA", "=", false)
                        .limit(batchSize)
                )
                .executeTakeFirst()

            if (result.numDeletedRows === 0n) {
                ctx.logger.pino.info("no follows to delete")
                return
            }
        })
        const t2 = Date.now()
        ctx.logger.logTimes("deleted follows", [t1, t2], {count: batchSize, i})
    }
}