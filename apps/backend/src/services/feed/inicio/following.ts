import {Agent, SessionAgent} from "#/utils/session-agent.js";
import {AppContext} from "#/setup.js";
import {FeedPipelineProps, FollowingFeedFilter, GetSkeletonProps} from "#/services/feed/feed.js";
import {min} from "@cabildo-abierto/utils";
import {ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api"
import {DataPlane, FetchFromBskyError} from "#/services/hydration/dataplane.js";
import {$Typed, AppBskyFeedDefs} from "@atproto/api";
import {FeedFormatOption} from "#/services/feed/inicio/discusion.js";
import {FeedViewPost} from "@atproto/api/dist/client/types/app/bsky/feed/defs.js";
import {Effect} from "effect";
import {DBError} from "#/services/write/article.js";

export type RepostQueryResult = {
    uri?: string
    created_at: Date | null
    subjectId: string | null
}

export type SkeletonFeedPostWithDate = ArCabildoabiertoFeedDefs.SkeletonFeedPost & { created_at: Date }

function bskySkeletonReasonToCA(reason: FeedViewPost["reason"]): ArCabildoabiertoFeedDefs.SkeletonFeedPost["reason"] {
    if (AppBskyFeedDefs.isReasonRepost(reason)) {
        return {
            $type: "ar.cabildoabierto.feed.defs#skeletonReasonRepost",
            repost: reason.uri
        }
    } else {
        return undefined
    }
}

export const feedViewPostToSkeletonElement = (p: FeedViewPost): SkeletonFeedPostWithDate => {
    return {
        $type: "ar.cabildoabierto.feed.defs#skeletonFeedPost",
        post: p.post.uri,
        reason: bskySkeletonReasonToCA(p.reason),
        created_at: new Date(p.post.indexedAt)
    }
}


export type FeedSkeletonWithDate = SkeletonFeedPostWithDate[]


export const getSkeletonFromTimeline = (ctx: AppContext, timeline: FeedViewPost[], onlyFollowedRoots: boolean = false) => {
    let filtered = onlyFollowedRoots ? timeline
        .filter(t => {
            if (t.reason && AppBskyFeedDefs.isReasonRepost(t.reason)) return true
            if (AppBskyFeedDefs.isPostView(t.reply?.root)) {
                if (!t.reply.root.author.viewer?.following) {
                    return false
                }
            }
            return true
        }) : timeline

    let skeleton: FeedSkeletonWithDate = filtered
        .map(feedViewPostToSkeletonElement)

    return skeleton
}


export const getArticlesForFollowingFeed = (
    ctx: AppContext,
    agent: SessionAgent,
    startDate: Date
): Effect.Effect<{
    created_at: Date,
    contentId: string
    repostedContentId: string | null
}[], DBError, DataPlane> => Effect.gen(function* () {
    const res = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("FollowingFeedIndex")
            .where("FollowingFeedIndex.collection", "=", "ArCabildoabiertoFeedArticle")
            .where("readerId", "=", agent.did)
            .select([
                "FollowingFeedIndex.created_at",
                "FollowingFeedIndex.contentId",
                "FollowingFeedIndex.repostedContentId"
            ])
            .where("FollowingFeedIndex.created_at", "<", startDate)
            .orderBy("FollowingFeedIndex.created_at", "desc")
            .limit(25)
            .execute(),
        catch: () => new DBError()
    })

    const data = yield* DataPlane
    res.forEach(r => {
        if (r.repostedContentId) {
            data.storeRepost({
                subjectId: r.repostedContentId,
                uri: r.contentId,
                created_at: r.created_at,
            })
        }
    })

    return res
})


async function retry<X, Y>(x: X, f: (params: X) => Promise<Y>, attempts: number, delay: number = 200): Promise<Y> {
    try {
        return await f(x)
    } catch (err) {
        if (attempts > 0) {
            await new Promise(r => setTimeout(r, delay))
            return retry(x, f, attempts - 1)
        } else {
            throw (err)
        }
    }

}


const getBskyTimeline = (
    ctx: AppContext,
    agent: SessionAgent,
    limit: number,
    cursor?: string
): Effect.Effect<{
    feed: $Typed<FeedViewPost>[],
    cursor: string | undefined
}, FetchFromBskyError, DataPlane> => Effect.gen(function* () {
    const res = yield* Effect.tryPromise({
        try: () => retry({limit, cursor}, agent.bsky.getTimeline, 3),
        catch: () => new FetchFromBskyError()
    })
    const dataplane = yield* DataPlane

    const newCursor = res.data.cursor
    const feed = res.data.feed
    dataplane.storeFeedViewPosts(feed)

    return {
        feed: feed.map(f => ({
            ...f,
            $type: "app.bsky.feed.defs#feedViewPost",
        })),
        cursor: newCursor
    }
})


const getFollowingFeedSkeletonAll: GetSkeletonProps = (
    ctx,
    agent,
    cursor
) => Effect.gen(function* () {
    if (!agent.hasSession()) return {skeleton: [], cursor: undefined}

    const timelineQuery = getBskyTimeline(
        ctx,
        agent,
        25,
        cursor
    )

    const cursorDate = cursor ? new Date(cursor) : new Date()

    let [timeline, articles] = yield* Effect.all([
        timelineQuery,
        getArticlesForFollowingFeed(ctx, agent, cursorDate)
    ], {concurrency: "unbounded"})

    // borramos todos los artículos y reposts de artículos anteriores en fecha al último post de la timeline
    const lastInTimeline = timeline.feed.length > 0 ? timeline.feed[timeline.feed.length - 1].post.indexedAt : null
    if (lastInTimeline) { // si la timeline no tiene nada más, mantenemos los artículos
        const lastInTimelineDate = new Date(lastInTimeline)
        articles = articles.filter(a => a.created_at >= lastInTimelineDate && a.created_at <= cursorDate)
    }

    const timelineSkeleton = getSkeletonFromTimeline(ctx, timeline.feed, true)

    const skeleton = [
        ...timelineSkeleton,
        ...articles.map(a => ({post: a.repostedContentId ?? a.contentId}))
    ]

    return {
        skeleton,
        cursor: timelineSkeleton.length > 0 ? timeline.cursor : undefined
    }
})


export async function getCAFollowersDids(ctx: AppContext, did: string): Promise<string[]> {
    const rows = await ctx.kysely
        .selectFrom("Follow")
        .innerJoin("Record", "Follow.uri", "Record.uri")
        .select("Record.authorId")
        .innerJoin("User as Follower", "Follower.did", "Record.authorId")
        .where("Follow.userFollowedId", "=", did)
        .where("Follower.inCA", "=", true)
        .execute()

    return rows
        .map(x => x.authorId)
}


export async function getFollowsDids(ctx: AppContext, did: string): Promise<string[]> {
    const rows = await ctx.kysely
        .selectFrom("Follow")
        .select("Follow.userFollowedId as did")
        .innerJoin("Record", "Follow.uri", "Record.uri")
        .where("Record.authorId", "=", did)
        .execute();

    return rows
        .map(x => x.did)
        .filter(x => x != null)
}


export async function getCAFollowsDids(ctx: AppContext, did: string): Promise<string[]> {

    let cached_dids = await ctx.redisCache.CAFollows.get(did)
    if (cached_dids != null) {
        return cached_dids
    }
    const rows = await ctx.kysely
        .selectFrom("Follow")
        .select("Follow.userFollowedId as did")
        .innerJoin("Record", "Follow.uri", "Record.uri")
        .innerJoin("User", "User.did", "Follow.userFollowedId")
        .where("Record.authorId", "=", did)
        .where("User.inCA", "=", true)
        .execute();

    const dids = rows
        .map(x => x.did)
        .filter(x => x != null);

    await ctx.redisCache.CAFollows.set(did, dids)

    return dids
}

export type SkeletonQuery<T> = (
    ctx: AppContext,
    agent: Agent,
    from: string | undefined,
    to: string | undefined,
    limit: number
) => Promise<(T & { score: number })[]>


export type FollowingFeedSkeletonElement = {
    uri: string
    createdAt: Date
    repostedRecordUri: string | undefined
}

export type GetNextCursor<T> = (cursor: string | undefined, skeleton: T[], limit: number) => (string | undefined)


export function getNextFollowingFeedCursor(cursor: string | undefined, skeleton: FollowingFeedSkeletonElement[], limit: number) {
    if (skeleton.length < limit) return undefined
    const m = Math.min(...skeleton.map(x => new Date(x.createdAt).getTime()))
    return new Date(m).toISOString()
}


async function followingFeedOnlyCABaseQueryAll(ctx: AppContext, agent: SessionAgent, limit: number, cursor?: string) {
    return await ctx.kysely
        .selectFrom("FollowingFeedIndex")
        .select([
            "contentId",
            "repostedContentId",
            "created_at"
        ])
        .where("readerId", "=", agent.did)
        .where("authorInCA", "=", true)
        .$if(cursor != null, qb => qb.where("created_at", "<", new Date(cursor!)))
        .orderBy("created_at desc")
        .limit(limit)
        .execute()
}


async function followingFeedOnlyCABaseQueryArticles(ctx: AppContext, agent: SessionAgent, limit: number, cursor?: string) {
    return await ctx.kysely
        .selectFrom("FollowingFeedIndex")
        .select([
            "contentId",
            "repostedContentId",
            "created_at"
        ])
        .where("readerId", "=", agent.did)
        .where("authorInCA", "=", true)
        .where("collection", "=", "ArCabildoabiertoFeedArticle")
        .$if(cursor != null, qb => qb.where("created_at", "<", new Date(cursor!)))
        .orderBy("created_at desc")
        .limit(limit)
        .execute()
}


const getFollowingFeedSkeletonOnlyCA = (
    format: FeedFormatOption
): GetSkeletonProps => (
    ctx,
    agent,
    cursor
) => Effect.gen(function* () {
    if (!agent.hasSession()) return {skeleton: [], cursor: undefined}

    const limit = 25

    const queryRes = yield* Effect.tryPromise({
        try: () => (format == "Todos" ?
            followingFeedOnlyCABaseQueryAll(ctx, agent, limit, cursor) :
            followingFeedOnlyCABaseQueryArticles(ctx, agent, limit, cursor)),
        catch: () => new DBError()
    })

    function queryToSkeletonElement(e: {
        contentId: string,
        repostedContentId: string | null
    }): ArCabildoabiertoFeedDefs.SkeletonFeedPost {
        if (!e.repostedContentId) {
            return {
                $type: "ar.cabildoabierto.feed.defs#skeletonFeedPost",
                post: e.contentId
            }
        } else {
            return {
                $type: "ar.cabildoabierto.feed.defs#skeletonFeedPost",
                post: e.repostedContentId,
                reason: {
                    $type: "ar.cabildoabierto.feed.defs#skeletonReasonRepost",
                    repost: e.contentId
                }
            }
        }
    }

    const newCursor = min(queryRes, x => x.created_at.getTime())?.created_at?.toISOString()

    const skeleton = queryRes.map(queryToSkeletonElement)

    const data = yield* DataPlane

    queryRes.forEach(r => {
        if (r.repostedContentId) {
            data.storeRepost({
                subjectId: r.repostedContentId,
                uri: r.contentId,
                created_at: r.created_at
            })
        }
    })

    return {
        skeleton,
        cursor: newCursor
    }
})


export const getFollowingFeedSkeleton: (
    filter: FollowingFeedFilter,
    format: FeedFormatOption
) => GetSkeletonProps = (filter, format) => (ctx, agent, cursor) => {
    if (filter == "Todos" && format == "Todos") {
        return getFollowingFeedSkeletonAll(ctx, agent, cursor)
    } else {
        return getFollowingFeedSkeletonOnlyCA(format)(ctx, agent, cursor)
    }
}


export const getFollowingFeedPipeline: (filter?: FollowingFeedFilter, format?: FeedFormatOption) => FeedPipelineProps = (filter = "Todos", format = "Todos") => ({
    getSkeleton: getFollowingFeedSkeleton(filter, format),
    debugName: `following:${filter}:${format}`
})