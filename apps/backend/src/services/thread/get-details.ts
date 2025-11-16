import {CAHandlerNoAuth} from "#/utils/handler.js";
import {ArCabildoabiertoActorDefs, ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api"
import {Dataplane} from "#/services/hydration/dataplane.js";
import {hydrateProfileViewBasic} from "#/services/hydration/profile.js";
import {Agent} from "#/utils/session-agent.js";
import {getCollectionFromUri, getUri, isArticle, isPost} from "@cabildo-abierto/utils";
import {AppContext} from "#/setup.js";
import {PostViewHydrator} from "#/services/hydration/post-view.js";


async function getLikesSkeleton(ctx: AppContext, agent: Agent, uri: string, dataplane: Dataplane, limit: number, cursor: string | undefined): Promise<{
    dids: string[];
    cursor?: string;
}> {
    const likesSkeletonResponse = await agent.bsky.app.bsky.feed.getLikes({uri, limit, cursor: cursor})
    for (const user of likesSkeletonResponse.data.likes) {
        dataplane.bskyBasicUsers.set(user.actor.did, {...user.actor, $type: "app.bsky.actor.defs#profileViewBasic"})
    }

    return {
        dids: likesSkeletonResponse.success ? likesSkeletonResponse.data.likes.map((value) => value.actor.did) : [],
        cursor: likesSkeletonResponse.data.cursor
    }
}

async function getRepostsSkeleton(ctx: AppContext, agent: Agent, uri: string, dataplane: Dataplane, limit: number, cursor: string | undefined): Promise<{
    dids: string[];
    cursor?: string;
}> {
    const collection = getCollectionFromUri(uri)
    ctx.logger.pino.info({uri}, "getting reposts sk")

    if(isPost(collection)) {
        try {
            const repostsSkeletonResponse = await agent.bsky.app.bsky.feed.getRepostedBy({uri, limit, cursor: cursor})

            for (const user of repostsSkeletonResponse.data.repostedBy) {
                dataplane.bskyBasicUsers.set(user.did, {...user, $type: "app.bsky.actor.defs#profileViewBasic"})
            }
            return {
                dids: repostsSkeletonResponse.success ? repostsSkeletonResponse.data.repostedBy.map((value) => value.did) : [],
                cursor: repostsSkeletonResponse.data.cursor
            }
        } catch (error) {
            ctx.logger.pino.error({error, uri}, "error al obtener reposted by de bluesky")
            return {
                dids: [],
                cursor: undefined
            }
        }
    } else if(isArticle(collection)) {
        const reactions = await ctx.kysely
            .selectFrom("Reaction")
            .innerJoin("Record", "Record.uri", "Reaction.uri")
            .where("Reaction.subjectId", "=", uri)
            .where("Record.collection", "=", "app.bsky.feed.repost")
            .select(["Record.authorId as did"])
            .orderBy("Record.created_at_tz desc")
            .execute()
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
}

async function getQuotesSkeleton(ctx: AppContext, agent: Agent, uri: string, dataplane: Dataplane, limit: number, cursor: string | undefined): Promise<{
    uris: string[];
    cursor?: string;
}> {
    const quotesSkeletonResponse = await agent.bsky.app.bsky.feed.getQuotes({uri, limit, cursor: cursor})
    for (const post of quotesSkeletonResponse.data.posts) {
        dataplane.bskyPosts.set(post.uri, post)
    }

    return {
        uris: quotesSkeletonResponse.success ? quotesSkeletonResponse.data.posts.map((value) => value.uri) : [],
        cursor: quotesSkeletonResponse.data.cursor
    }
}

type GetInteractionsType = CAHandlerNoAuth<{
    params: { did: string, rkey: string, collection: string },
    query: { limit?: string, cursor?: string }
}, { profiles: ArCabildoabiertoActorDefs.ProfileViewBasic[], cursor?: string }>

export const getLikes: GetInteractionsType = async (ctx, agent, {params, query}) => {
    const {did, collection, rkey} = params
    const uri = getUri(did, collection, rkey)
    const dataplane = new Dataplane(ctx, agent)
    const {
        dids,
        cursor
    } = await getLikesSkeleton(ctx, agent, uri, dataplane, parseInt(query.limit ?? "25"), query.cursor)
    await dataplane.fetchProfileViewHydrationData(dids)

    const data = {
        profiles: dids.map(d => hydrateProfileViewBasic(ctx, d, dataplane)).filter(x => x != null),
        cursor: cursor
    }
    return {data}
}

export const getReposts: GetInteractionsType = async (ctx, agent, {params, query}) => {
    const {did, collection, rkey} = params
    const uri = getUri(did, collection, rkey)
    const dataplane = new Dataplane(ctx, agent)
    const {
        dids,
        cursor
    } = await getRepostsSkeleton(ctx, agent, uri, dataplane, parseInt(query.limit ?? "25"), query.cursor)
    await dataplane.fetchProfileViewHydrationData(dids)

    const data = {
        profiles: dids.map(d => hydrateProfileViewBasic(ctx, d, dataplane)).filter(x => x != null),
        cursor: cursor
    }
    return {data}
}


type GetQuotesType = CAHandlerNoAuth<{
    params: { did: string, rkey: string, collection: string },
    query: { limit?: string, cursor?: string }
}, { posts: ArCabildoabiertoFeedDefs.PostView[], cursor?: string }>


export const getQuotes: GetQuotesType = async (ctx, agent, {params, query}) => {
    const {did, collection, rkey} = params
    const uri = getUri(did, collection, rkey)
    const dataplane = new Dataplane(ctx, agent)
    const {
        uris,
        cursor
    } = await getQuotesSkeleton(ctx, agent, uri, dataplane, parseInt(query.limit ?? "25"), query.cursor)
    await dataplane.fetchPostAndArticleViewsHydrationData(uris)

    const hydrator = new PostViewHydrator(ctx, dataplane)
    const data = {
        posts: uris.map(d => hydrator.hydrate(d)).filter(x => x != null),
        cursor: cursor
    }
    return {data}
}