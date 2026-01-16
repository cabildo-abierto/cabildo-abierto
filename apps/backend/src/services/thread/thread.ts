import {ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api"
import {AppContext} from "#/setup.js";
import {Agent} from "#/utils/session-agent.js";
import {
    getCollectionFromUri,
    getDidFromUri,
    getUri,
    isArticle,
    isDataset,
    isPost,
    shortCollectionToCollection
} from "@cabildo-abierto/utils";
import {
    hydrateThreadViewContent,
    threadPostRepliesSortKey,
    ThreadSkeleton
} from "#/services/hydration/hydrate.js";
import {CAHandlerNoAuth} from "#/utils/handler.js";
import {handleToDid} from "#/services/user/users.js";
import {Dataplane} from "#/services/hydration/dataplane.js";
import {isThreadViewPost, ThreadViewPost} from "@atproto/api/dist/client/types/app/bsky/feed/defs.js";
import {listOrderDesc, sortByKey} from "@cabildo-abierto/utils";

function threadViewPostToThreadSkeleton(thread: ThreadViewPost, isAncestor: boolean = false): ThreadSkeleton {
    return {
        post: thread.post.uri,
        replies: !isAncestor && thread.replies ? sortByKey(
            thread.replies.filter(isThreadViewPost),
            threadPostRepliesSortKey(getDidFromUri(thread.post.uri)),
            listOrderDesc
        ).map(r => threadViewPostToThreadSkeleton(r)) : undefined,
        parent: thread.parent && isThreadViewPost(thread.parent) ? threadViewPostToThreadSkeleton(thread.parent, true) : undefined
    }
}


async function getThreadRepliesSkeletonForPostFromBsky(ctx: AppContext, agent: Agent, uri: string, dataplane: Dataplane){
    try {
        const {data} = await agent.bsky.app.bsky.feed.getPostThread({uri})
        const thread = isThreadViewPost(data.thread) ? data.thread : null

        if(thread){
            dataplane.saveDataFromPostThread(thread, true)
        }

        return thread ? threadViewPostToThreadSkeleton(thread) : {post: uri}
    } catch (error) {
        ctx.logger.pino.warn({uri, error}, "error fetching thread from bsky")
        return null
    }
}


function buildParentFromAncestorsList(uri: string, ancestors: {uri: string, replyToId: string | null}[]): ThreadSkeleton | undefined {
    const p = ancestors
        .find(p => p.uri == uri)

    if(!p || !p.replyToId) return undefined

    return {
        post: p.replyToId,
        parent: buildParentFromAncestorsList(p.replyToId, ancestors)
    }
}


export async function getThreadRepliesSkeletonForPostFromCA(ctx: AppContext, uri: string): Promise<ThreadSkeleton> {
    // necesario solo porque getPostThread de Bsky no funciona con posts que tienen selection quote

    const replies = await ctx.kysely.selectFrom("Post")
        .select("uri")
        .where("replyToId", "=", uri)
        .execute()

    const collection = getCollectionFromUri(uri)

    let parent: ThreadSkeleton | undefined = undefined

    if(isPost(collection)){
        const ancestors = await ctx.kysely
            .withRecursive("ancestors", (db) => {
                const base = db
                    .selectFrom("Post")
                    .where("Post.uri", "=", uri)
                    .select(["Post.replyToId", "Post.uri"])

                const recursive = db
                    .selectFrom("ancestors")
                    .innerJoin("Post", "Post.uri", "ancestors.replyToId")
                    .select(["Post.replyToId", "Post.uri"])

                return base.unionAll(recursive)
            })
            .selectFrom("ancestors")
            .selectAll()
            .execute()

        parent = buildParentFromAncestorsList(uri, ancestors)
    }

    return {
        parent,
        post: uri,
        replies: replies.map(x => ({post: x.uri}))
    }
}


async function getThreadSkeletonForPost(ctx: AppContext, agent: Agent, uri: string, data: Dataplane): Promise<ThreadSkeleton> {
    const [skeletonBsky, skeletonCA] = await Promise.all([
        getThreadRepliesSkeletonForPostFromBsky(ctx, agent, uri, data),
        getThreadRepliesSkeletonForPostFromCA(ctx, uri)
    ])

    return skeletonBsky ?? skeletonCA
}


export async function getThreadSkeletonForArticle(ctx: AppContext, uri: string): Promise<ThreadSkeleton> {
    const replies = await ctx.kysely
        .selectFrom("Post")
        .where("Post.replyToId", "=", uri)
        .select("uri")
        .execute()

    return {
        post: uri,
        replies: replies.map(r => ({post: r.uri}))
    }
}


export async function getThreadSkeleton(ctx: AppContext, agent: Agent, uri: string, data: Dataplane): Promise<ThreadSkeleton> {
    const collection = getCollectionFromUri(uri)

    if(isPost(collection)){
        return await getThreadSkeletonForPost(ctx, agent, uri, data)
    } else if(isArticle(collection)) {
        return await getThreadSkeletonForArticle(ctx, uri)
    } else if(isDataset(collection)){
        return {post: uri}
    } else {
        throw Error("Thread skeleton not implemented for:" + collection)
    }
}


export const getThread: CAHandlerNoAuth<{params: {handleOrDid: string, collection: string, rkey: string}}, ArCabildoabiertoFeedDefs.ThreadViewContent> = async (ctx, agent, {params})  => {
    let {handleOrDid, collection, rkey} = params
    collection = shortCollectionToCollection(collection)

    const did = await handleToDid(ctx, agent, handleOrDid)
    if(!did) {
        return {error: "No se encontró el autor."}
    }
    const data = new Dataplane(ctx, agent)

    const uri = getUri(did, collection, rkey)
    const skeleton = await getThreadSkeleton(ctx, agent, uri, data)

    await data.fetchThreadHydrationData(skeleton)

    let thread = hydrateThreadViewContent(ctx, skeleton, data, true, true)

    return thread ? {data: thread} : {error: "Ocurrió un error al obtener el contenido."}
}


export function getUrisFromThreadSkeleton(skeleton: ThreadSkeleton): string[] {
    const ancestors: string[] = []
    let parent = skeleton.parent
    while(parent){
        ancestors.push(parent.post)
        parent = parent.parent
    }

    return [
        ...getUrisFromThreadSkeletonSubtree(skeleton),
        ...ancestors
    ]
}


export function getUrisFromThreadSkeletonSubtree(skeleton: ThreadSkeleton): string[] {
    return [
        skeleton.post,
        ...(skeleton.replies?.flatMap(getUrisFromThreadSkeletonSubtree)
            .filter(x => x != null)) ?? []
    ]
}