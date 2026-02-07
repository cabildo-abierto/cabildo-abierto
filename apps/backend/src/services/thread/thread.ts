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
import {EffHandlerNoAuth} from "#/utils/handler.js";
import {DataPlane, FetchFromBskyError, makeDataPlane} from "#/services/hydration/dataplane.js";
import {isThreadViewPost, ThreadViewPost} from "@atproto/api/dist/client/types/app/bsky/feed/defs.js";
import {listOrderDesc, sortByKey} from "@cabildo-abierto/utils";
import {Effect} from "effect";
import {handleOrDidToDid} from "#/id-resolver.js";
import {DBSelectError} from "#/utils/errors.js";

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


const getThreadRepliesSkeletonForPostFromBsky = (
    ctx: AppContext,
    agent: Agent,
    uri: string) => Effect.gen(function* () {
    const {data} = yield* Effect.tryPromise({
        try: () => agent.bsky.app.bsky.feed.getPostThread({uri}),
        catch: () => new FetchFromBskyError()
    })
    const thread = isThreadViewPost(data.thread) ? data.thread : null

    if(thread){
        const dataplane = yield* DataPlane
        dataplane.saveDataFromPostThread(thread, true)
    }

    return thread ? threadViewPostToThreadSkeleton(thread) : {post: uri}
})


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


const getThreadSkeletonForPost = (
    ctx: AppContext,
    agent: Agent,
    uri: string
): Effect.Effect<ThreadSkeleton, DBSelectError | FetchFromBskyError, DataPlane> => Effect.gen(function* () {
    const [skeletonBsky, skeletonCA] = yield* Effect.all([
        getThreadRepliesSkeletonForPostFromBsky(ctx, agent, uri),
        Effect.tryPromise({
            try: () => getThreadRepliesSkeletonForPostFromCA(ctx, uri),
            catch: () => new DBSelectError()
        })
    ], {concurrency: "unbounded"})

    return skeletonBsky ?? skeletonCA
})


export function getThreadSkeletonForArticle(ctx: AppContext, uri: string): Effect.Effect<ThreadSkeleton, DBSelectError> {
    return Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("Post")
            .where("Post.replyToId", "=", uri)
            .select("uri")
            .execute(),
        catch: () => new DBSelectError()
    }).pipe(
        Effect.map(replies => {
            return {
                post: uri,
                replies: replies.map(r => ({post: r.uri}))
            }
        })
    )
}


export class NotImplementedError {
    readonly _tag = "NotImplementedError"
    constructor(readonly message?: string) {}
}


const getThreadSkeleton = (
    ctx: AppContext,
    agent: Agent,
    uri: string
): Effect.Effect<ThreadSkeleton, DBSelectError | DBSelectError | FetchFromBskyError | NotImplementedError, DataPlane> => Effect.gen(function* () {
    const collection = getCollectionFromUri(uri)

    if(isPost(collection)){
        return yield* getThreadSkeletonForPost(ctx, agent, uri)
    } else if(isArticle(collection)) {
        return yield* getThreadSkeletonForArticle(ctx, uri)
    } else if(isDataset(collection)){
        return {post: uri}
    } else {
        return yield* Effect.fail(new NotImplementedError(collection))
    }
})


export const getThread: EffHandlerNoAuth<
    {params: {handleOrDid: string, collection: string, rkey: string}},
    ArCabildoabiertoFeedDefs.ThreadViewContent
> = (ctx, agent, {params}) => Effect.provideServiceEffect(Effect.gen(function* () {
    let {handleOrDid, collection, rkey} = params
    collection = shortCollectionToCollection(collection)
    const data = yield* DataPlane

    const did = yield* handleOrDidToDid(ctx, handleOrDid)

    const uri = getUri(did, collection, rkey)
    const skeleton = yield* getThreadSkeleton(ctx, agent, uri)

    yield* data.fetchThreadHydrationData(skeleton)

    const thread = yield* hydrateThreadViewContent(ctx, agent, skeleton, true, true)

    if(!thread) {
        return yield* Effect.fail("Ocurrió un error al obtener el hilo.")
    }

    return thread
}).pipe(
    Effect.catchAll(() => Effect.fail("Ocurrió un error al obtener el hilo."))
), DataPlane, makeDataPlane(ctx, agent))


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