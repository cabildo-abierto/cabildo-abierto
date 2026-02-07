import {EffHandlerNoAuth} from "#/utils/handler.js";
import {ArCabildoabiertoActorDefs, ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api"
import {DataPlane, FetchFromBskyError, makeDataPlane} from "#/services/hydration/dataplane.js";
import {hydrateProfileViewBasic} from "#/services/hydration/profile.js";
import {Agent} from "#/utils/session-agent.js";
import {getCollectionFromUri, getUri, isArticle, isPost} from "@cabildo-abierto/utils";
import {AppContext} from "#/setup.js";
import {Effect} from "effect";
import {DBSelectError} from "#/utils/errors.js";
import {hydratePostView} from "#/services/hydration/post-view.js";


const getLikesSkeleton = (
    ctx: AppContext,
    agent: Agent,
    uri: string,
    limit: number,
    cursor: string | undefined
): Effect.Effect<{
    dids: string[];
    cursor?: string;
}, FetchFromBskyError, DataPlane> => Effect.gen(function* () {
    const likesSkeletonResponse = yield* Effect.tryPromise({
        try: () => agent.bsky.app.bsky.feed.getLikes({uri, limit, cursor: cursor}),
        catch: () => new FetchFromBskyError()
    })
    const dataplane = yield* DataPlane
    const state = dataplane.getState()
    for (const user of likesSkeletonResponse.data.likes) {
        state.bskyBasicUsers.set(user.actor.did, {...user.actor, $type: "app.bsky.actor.defs#profileViewBasic"})
    }

    return {
        dids: likesSkeletonResponse.success ? likesSkeletonResponse.data.likes.map((value) => value.actor.did) : [],
        cursor: likesSkeletonResponse.data.cursor
    }
})


const getRepostsSkeleton = (
    ctx: AppContext,
    agent: Agent,
    uri: string,
    limit: number,
    cursor: string | undefined
): Effect.Effect<{
    dids: string[];
    cursor?: string;
}, DBSelectError | FetchFromBskyError, DataPlane> => Effect.gen(function* () {

    const collection = getCollectionFromUri(uri)
    const dataplane = yield* DataPlane
    const state = dataplane.getState()

    if(isPost(collection)) {
        return yield* Effect.tryPromise({
            try: () => agent.bsky.app.bsky.feed.getRepostedBy({uri, limit, cursor: cursor}),
            catch: () => new FetchFromBskyError()
        }).pipe(
            Effect.map(repostsSkeletonResponse => {
                for (const user of repostsSkeletonResponse.data.repostedBy) {
                    state.bskyBasicUsers.set(user.did, {...user, $type: "app.bsky.actor.defs#profileViewBasic"})
                }
                return {
                    dids: repostsSkeletonResponse.success ? repostsSkeletonResponse.data.repostedBy.map((value) => value.did) : [],
                    cursor: repostsSkeletonResponse.data.cursor
                }
            }),
            Effect.catchTag("FetchFromBskyError", () => {
                return Effect.succeed({
                    dids: [],
                    cursor: undefined
                })
            })
        )
    } else if(isArticle(collection)) {
        const reactions = yield* Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("Reaction")
                .innerJoin("Record", "Record.uri", "Reaction.uri")
                .where("Reaction.subjectId", "=", uri)
                .where("Record.collection", "=", "app.bsky.feed.repost")
                .select(["Record.authorId as did"])
                .orderBy("Record.created_at_tz desc")
                .execute(),
            catch: () => new DBSelectError()
        })
        return {
            dids: reactions.map((value) => value.did),
            cursor: undefined
        }
    } else {
        return {
            dids: [],
            cursor: undefined
        }
    }
})


const getQuotesSkeleton = (
    ctx: AppContext,
    agent: Agent,
    uri: string,
    limit: number,
    cursor: string | undefined
): Effect.Effect<{
    uris: string[];
    cursor?: string;
}, FetchFromBskyError, DataPlane> => Effect.gen(function* () {
    const dataplane = yield* DataPlane

    const quotesSkeletonResponse = yield* Effect.tryPromise({
        try: () => agent.bsky.app.bsky.feed.getQuotes({uri, limit, cursor: cursor}),
        catch: () => new FetchFromBskyError()
    })

    const state = dataplane.getState()
    for (const post of quotesSkeletonResponse.data.posts) {
        state.bskyPosts.set(post.uri, post)
    }

    return {
        uris: quotesSkeletonResponse.success ? quotesSkeletonResponse.data.posts.map((value) => value.uri) : [],
        cursor: quotesSkeletonResponse.data.cursor
    }
})


type GetInteractionsType = EffHandlerNoAuth<{
    params: { did: string, rkey: string, collection: string },
    query: { limit?: string, cursor?: string }
}, { profiles: ArCabildoabiertoActorDefs.ProfileViewBasic[], cursor?: string }>


export const getLikes: GetInteractionsType = (
    ctx,
    agent,
    {params, query}
) => Effect.provideServiceEffect(Effect.gen(function* () {
    const {did, collection, rkey} = params
    const uri = getUri(did, collection, rkey)

    const dataplane = yield* DataPlane
    const {
        dids,
        cursor
    } = yield* getLikesSkeleton(
        ctx,
        agent,
        uri,
        parseInt(query.limit ?? "25"),
        query.cursor
    )
    yield* dataplane.fetchProfileViewHydrationData(dids)

    const profiles = yield* Effect.all(dids.map(d => hydrateProfileViewBasic(ctx, d)))

    return {
        profiles: profiles.filter(x => x != null),
        cursor: cursor
    }
}).pipe(Effect.catchAll(() => Effect.fail("Ocurrió un error al obtener los me gustas."))), DataPlane, makeDataPlane(ctx, agent))


export const getReposts: GetInteractionsType = (
    ctx,
    agent,
    {params, query}
) => Effect.provideServiceEffect(Effect.gen(function* () {
    const {did, collection, rkey} = params
    const uri = getUri(did, collection, rkey)

    const dataplane = yield* DataPlane
    const {
        dids,
        cursor
    } = yield* getRepostsSkeleton(
        ctx,
        agent,
        uri,
        parseInt(query.limit ?? "25"),
        query.cursor
    )
    yield* dataplane.fetchProfileViewHydrationData(dids)

    const profiles = yield* Effect.all(dids.map(d => hydrateProfileViewBasic(ctx, d)))

    return {
        profiles: profiles.filter(x => x != null),
        cursor: cursor
    }
}).pipe(Effect.catchAll(() => Effect.fail("Ocurrió un error al obtener los me gustas."))), DataPlane, makeDataPlane(ctx, agent))



type GetQuotesType = EffHandlerNoAuth<{
    params: { did: string, rkey: string, collection: string },
    query: { limit?: string, cursor?: string }
}, { posts: ArCabildoabiertoFeedDefs.PostView[], cursor?: string }>


export const getQuotes: GetQuotesType = (
    ctx,
    agent,
    {params, query}
) => Effect.provideServiceEffect(Effect.gen(function* () {
    const {did, collection, rkey} = params
    const uri = getUri(did, collection, rkey)
    const dataplane = yield* DataPlane
    const {
        uris,
        cursor
    } = yield* getQuotesSkeleton(ctx, agent, uri, parseInt(query.limit ?? "25"), query.cursor)
    yield* dataplane.fetchPostAndArticleViewsHydrationData(uris)

    const posts = yield* Effect.all(uris.map(d => hydratePostView(ctx, agent, d)))

    return {
        posts: posts.filter(x => x != null),
        cursor: cursor
    }
}).pipe(Effect.catchAll(() => Effect.fail("Ocurrió un error al obtener las citas."))), DataPlane, makeDataPlane(ctx, agent))