import {AppContext} from "#/setup.js";
import {getCAFollowersDids, getCAFollowsDids} from "#/services/feed/inicio/following.js";
import {unique} from "@cabildo-abierto/utils";
import {Dataplane, joinMaps} from "#/services/hydration/dataplane.js";
import {Agent, SessionAgent} from "#/utils/session-agent.js";
import * as Effect from "effect/Effect";
import {Exit, pipe} from "effect";
import {
    ArCabildoabiertoActorDefs
} from "@cabildo-abierto/api"
import {unfollow} from "#/services/user/users.js";
import {hydrateProfileViewBasic} from "#/services/hydration/profile.js";
import {CAHandler, EffHandler, EffHandlerNoAuth} from "#/utils/handler.js";
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


export const clearFollows = (ctx: AppContext, agent: SessionAgent): Effect.Effect<void, string> => {
    const bskyDid = "did:plc:z72i7hdynmk6r22z27h6tvur"

    return getFollows(ctx, agent, {params: {handleOrDid: agent.did}}).pipe(
        Effect.flatMap(follows => Effect.tryPromise({
            try: async () => {
                if (follows && follows.length == 1 && follows[0].did == bskyDid && follows[0].viewer?.following) {
                    await unfollow(ctx, agent, {followUri: follows[0].viewer.following})
                }

                return
            },
            catch: error => {
                return "Ocurrió un error al limpiar los seguidores"
            }
        })
    ))
}