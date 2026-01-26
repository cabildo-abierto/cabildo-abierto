import {AppContext} from "#/setup.js";
import {getCAFollowersDids, getCAFollowsDids} from "#/services/feed/inicio/following.js";
import {unique} from "@cabildo-abierto/utils";
import {Dataplane, joinMaps} from "#/services/hydration/dataplane.js";
import {Agent} from "#/utils/session-agent.js";
import * as Effect from "effect/Effect";
import {Exit, pipe} from "effect";
import {
    ArCabildoabiertoActorDefs
} from "@cabildo-abierto/api"
import {unfollow} from "#/services/user/users.js";
import {hydrateProfileViewBasic} from "#/services/hydration/profile.js";
import {CAHandler, EffHandlerNoAuth} from "#/utils/handler.js";
import {handleOrDidToDid} from "#/id-resolver.js";

async function getFollowxFromCA(ctx: AppContext, did: string, data: Dataplane, kind: "follows" | "followers") {
    const dids = kind == "follows" ?
        await getCAFollowsDids(ctx, did) :
        await getCAFollowersDids(ctx, did)

    return unique(dids)
}


async function getFollowxFromBsky(agent: Agent, did: string, data: Dataplane, kind: "follows" | "followers") {
    const users = kind == "follows" ?
        (await agent.bsky.app.bsky.graph.getFollows({actor: did})).data.follows :
        (await agent.bsky.app.bsky.graph.getFollowers({actor: did})).data.followers

    data.bskyBasicUsers = joinMaps(data.bskyBasicUsers,
        new Map(users.map(u => [u.did, {
            ...u,
            $type: "app.bsky.actor.defs#profileViewBasic"
        }])))
    return users.map(u => u.did)
}


export const getFollowx = (ctx: AppContext, agent: Agent, {handleOrDid, kind}: {
    handleOrDid: string,
    kind: "follows" | "followers"
}): Effect.Effect<ArCabildoabiertoActorDefs.ProfileViewBasic[], string> => {
    const data = new Dataplane(ctx, agent)

    return pipe(
        handleOrDidToDid(ctx, handleOrDid),
        Effect.flatMap(did => {
            return Effect.all([
                Effect.promise(() => getFollowxFromCA(ctx, did, data, kind)),
                Effect.promise(() => getFollowxFromBsky(agent, did, data, kind))
            ])
        }),
        Effect.map(([caUsers, bskyUsers]) => {
            return unique([...caUsers, ...bskyUsers])
        }),
        Effect.tap(userList => {
            return Effect.promise(() => data.fetchProfileViewHydrationData(userList))
        }),
        Effect.flatMap(userList => {
            return Effect.succeed(userList.map(u => hydrateProfileViewBasic(ctx, u, data)).filter(u => u != null))
        }),
        Effect.catchAll(error => {
            return Effect.fail("Usuario no encontrado.")
        })
    )

}


export const getFollows: EffHandlerNoAuth<{
    params: { handleOrDid: string }
}, ArCabildoabiertoActorDefs.ProfileViewBasic[]> = (ctx, agent, {params}) => {
    return getFollowx(ctx, agent, {handleOrDid: params.handleOrDid, kind: "follows"})
}


export const getFollowers: EffHandlerNoAuth<{
    params: { handleOrDid: string }
}, ArCabildoabiertoActorDefs.ProfileViewBasic[]> = (ctx, agent, {params}) => {
    return getFollowx(ctx, agent, {handleOrDid: params.handleOrDid, kind: "followers"})
}


export const clearFollowsHandler: CAHandler<{}, {}> = async (ctx, agent, {}) => {
    const bskyDid = "did:plc:z72i7hdynmk6r22z27h6tvur"
    const exit = await Effect.runPromiseExit(getFollows(ctx, agent, {params: {handleOrDid: agent.did}}))

    return Exit.match(exit, {
        onFailure: () => {
            return {error: "Error al obtener los seguidores."}
        },
        onSuccess: async follows => {
            if (follows && follows.length == 1 && follows[0].did == bskyDid && follows[0].viewer?.following) {
                await unfollow(ctx, agent, {followUri: follows[0].viewer.following})
            }

            return {data: {}}
        }
    });
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