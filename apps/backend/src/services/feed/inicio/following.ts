import {Agent, SessionAgent} from "#/utils/session-agent.js";
import {AppContext} from "#/setup.js";
import {FeedPipelineProps, FollowingFeedFilter, GetSkeletonProps} from "#/services/feed/feed.js";
import {getCollectionFromUri, getDidFromUri, isArticle, isPost, isTopicVersion, min} from "@cabildo-abierto/utils";
import {AppBskyFeedPost, ArCabildoabiertoFeedDefs, ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api"
import {isKnownContent} from "#/utils/type-utils.js";
import {Dataplane} from "#/services/hydration/dataplane.js";
import {$Typed, AppBskyFeedDefs} from "@atproto/api";
import {FeedFormatOption} from "#/services/feed/inicio/discusion.js";
import {FeedViewPost, isFeedViewPost} from "@atproto/api/dist/client/types/app/bsky/feed/defs.js";

export type RepostQueryResult = {
    uri?: string
    created_at: Date | null
    subjectId: string | null
}


function skeletonFromArticleReposts(p: RepostQueryResult): ArCabildoabiertoFeedDefs.SkeletonFeedPost | null {
    if (p.subjectId) {
        return {
            post: p.subjectId,
            reason: {
                $type: "ar.cabildoabierto.feed.defs#skeletonReasonRepost",
                repost: p.uri
            }
        }
    }
    return null
}


function getRootUriFromPost(ctx: AppContext, e: FeedViewPost | ArCabildoabiertoFeedDefs.FeedViewContent): string | null {
    if (!e.reply) {
        if (isFeedViewPost(e)) {
            return e.post.uri
        } else if (ArCabildoabiertoFeedDefs.isFeedViewContent(e) && isKnownContent(e.content)) {
            return e.content.uri
        } else {
            ctx.logger.pino.warn({e}, "Warning: No se encontró el root del post")
            return null
        }
    } else if (e.reply.root && "uri" in e.reply.root) {
        return e.reply.root.uri
    } else if (e.reply.parent && "uri" in e.reply.parent) {
        return e.reply.parent.uri
    } else {
        ctx.logger.pino.warn({e}, "No se encontró el root del post")
        return null
    }
}


function getRootTopicIdFromPost(ctx: AppContext, e: ArCabildoabiertoFeedDefs.FeedViewContent): string | null {
    if (!e.reply) {
        if (ArCabildoabiertoFeedDefs.isFeedViewContent(e) && isKnownContent(e.content)) {
            return e.content.uri
        } else {
            ctx.logger.pino.warn({e}, "no se encontró el root del post")
            return null
        }
    } else if (e.reply.root) {
        return ArCabildoabiertoWikiTopicVersion.isTopicViewBasic(e.reply.root) ? e.reply.root.id : null
    } else if (e.reply.parent) {
        return ArCabildoabiertoWikiTopicVersion.isTopicViewBasic(e.reply.parent) ? e.reply.parent.id : null
    } else {
        // console.log("Warning: No se encontró el root del post", e)
        return null
    }
}

export type SkeletonFeedPostWithDate = ArCabildoabiertoFeedDefs.SkeletonFeedPost & {created_at: Date}

function bskySkeletonReasonToCA(reason: FeedViewPost["reason"]): ArCabildoabiertoFeedDefs.SkeletonFeedPost["reason"] {
    if(AppBskyFeedDefs.isReasonRepost(reason)) {
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


export const getSkeletonFromTimeline = (ctx: AppContext, timeline: FeedViewPost[], following?: string[]) => {
    // Idea:
    // Me quedo con todos los posts cuyo root sea seguido por el agent
    // Si un root está más de una vez, me quedo solo con los que tengan respuestas únicamente del mismo autor,
    // y de esos con el que más respuestas tenga

    let filtered = following ? timeline.filter(t => {
        if (t.reason && AppBskyFeedDefs.isReasonRepost(t.reason)) return true
        const rootUri = getRootUriFromPost(ctx, t)
        if (!rootUri) {
            return false
        }
        const rootAuthor = getDidFromUri(rootUri)
        return following.includes(rootAuthor)
    }) : timeline

    let skeleton: FeedSkeletonWithDate = filtered.map(feedViewPostToSkeletonElement)

    return skeleton
}


export async function getArticlesForFollowingFeed(ctx: AppContext, agent: SessionAgent, data: Dataplane, startDate: Date, following: string[]): Promise<{
    created_at: Date,
    uri: string
}[]> {
    const res = await ctx.kysely
        .selectFrom("Article")
        .innerJoin("Record", "Record.uri", "Article.uri")
        .select(["Record.created_at_tz as created_at", "Record.uri"])
        .where("Record.authorId", "in", [agent.did, ...following])
        .where("Record.created_at_tz", "<", startDate)
        .orderBy("Record.created_at_tz", "desc")
        .limit(25)
        .execute()
    return res
        .map(x => x.created_at ? {...x, created_at: x.created_at} : null)
        .filter(x => x != null)
}


export async function getArticleRepostsForFollowingFeed(ctx: AppContext, agent: SessionAgent, dataplane: Dataplane, startDate: Date, following: string[]): Promise<RepostQueryResult[]> {
    const res = await ctx.kysely
        .selectFrom("Record")
        .innerJoin("Reaction", "Reaction.uri", "Record.uri")
        .innerJoin("Record as RepostedRecord", "RepostedRecord.uri", "Reaction.subjectId")
        .select(["Record.uri as repostUri", "Record.created_at as repostCreatedAt", "RepostedRecord.uri as recordUri"])
        .where("Record.authorId", "in", [agent.did, ...following])
        .where("Record.collection", "=", "app.bsky.feed.repost")
        .where("RepostedRecord.collection", "=", "ar.cabildoabierto.feed.article")
        .orderBy("Record.created_at", "desc")
        .execute()

    const qrs: RepostQueryResult[] = []
    res.forEach(r => {
        const qr = {
            subjectId: r.recordUri,
            uri: r.repostUri,
            created_at: r.repostCreatedAt,
        }
        qrs.push(qr)
        dataplane.storeRepost(qr)
    })
    return qrs
}


async function retry<X, Y>(x: X, f: (params: X) => Promise<Y>, attempts: number, delay: number = 200): Promise<Y> {
    try {
        return await f(x)
    } catch (err) {
        if (attempts > 0) {
            console.log(`Retrying after error. Attempts remaining ${attempts - 1}. Error:`, err)
            await new Promise(r => setTimeout(r, delay))
            return retry(x, f, attempts - 1)
        } else {
            throw (err)
        }
    }

}


export async function getBskyTimeline(ctx: AppContext, agent: SessionAgent, limit: number, data: Dataplane, cursor?: string): Promise<{
    feed: $Typed<FeedViewPost>[],
    cursor: string | undefined
}> {
    const res = await retry({limit, cursor}, agent.bsky.getTimeline, 3)

    const newCursor = res.data.cursor
    const feed = res.data.feed
    data.storeFeedViewPosts(feed)
    return {
        feed: feed.map(f => ({
            ...f,
            $type: "app.bsky.feed.defs#feedViewPost",
        })),
        cursor: newCursor
    }
}


async function getFollowingFeedSkeletonAllCASide(ctx: AppContext, agent: SessionAgent, data: Dataplane, startDate: Date) {
    const following = await getFollowsDids(ctx, agent.did)
    const articlesQuery = getArticlesForFollowingFeed(
        ctx,
        agent,
        data,
        startDate,
        following
    )

    const articleRepostsQuery: Promise<RepostQueryResult[]> = getArticleRepostsForFollowingFeed(
        ctx,
        agent,
        data,
        startDate,
        following
    )

    const [articles, articleReposts] = await Promise.all([
        articlesQuery,
        articleRepostsQuery,
    ])

    return {
        articles,
        articleReposts,
        following: [agent.did, ...following]
    }
}


const getFollowingFeedSkeletonAll: GetSkeletonProps = async (ctx, agent, data, cursor) => {
    if (!agent.hasSession()) return {skeleton: [], cursor: undefined}

    const timelineQuery = getBskyTimeline(ctx, agent, 25, data, cursor)

    const cursorDate = cursor ? new Date(cursor) : new Date()

    let [timeline, {articles, articleReposts, following}] = await Promise.all([
        timelineQuery,
        getFollowingFeedSkeletonAllCASide(ctx, agent, data, cursorDate)
    ])

    // borramos todos los artículos y reposts de artículos anteriores en fecha al último post de la timeline
    const lastInTimeline = timeline.feed.length > 0 ? timeline.feed[timeline.feed.length - 1].post.indexedAt : null
    if (lastInTimeline) {
        const lastInTimelineDate = new Date(lastInTimeline)
        articles = articles.filter(a => a.created_at >= lastInTimelineDate && a.created_at <= cursorDate)
        articleReposts = articleReposts.filter(a => a.created_at && a.created_at >= lastInTimelineDate && a.created_at <= cursorDate)
    }

    const timelineSkeleton = getSkeletonFromTimeline(ctx, timeline.feed, following)

    const articleRepostsSkeleton = articleReposts.map(skeletonFromArticleReposts).filter(x => x != null)

    const skeleton = [
        ...timelineSkeleton,
        ...articles.map(a => ({post: a.uri})),
        ...articleRepostsSkeleton
    ]

    return {
        skeleton,
        cursor: timelineSkeleton.length > 0 ? timeline.cursor : undefined
    }
}


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
) => Promise<(T & {score: number})[]>


export type FollowingFeedSkeletonElement = {
    uri: string
    createdAt: Date
    repostedRecordUri: string | undefined
}

export type GetNextCursor<T> = (cursor: string | undefined, skeleton: T[], limit: number) => (string | undefined)


export function getNextFollowingFeedCursor(cursor: string | undefined, skeleton: FollowingFeedSkeletonElement[], limit: number){
    if(skeleton.length < limit) return undefined
    const m = Math.min(...skeleton.map(x => new Date(x.createdAt).getTime()))
    return new Date(m).toISOString()
}


async function followingFeedOnlyCABaseQueryAll(ctx: AppContext, agent: SessionAgent, limit: number, cursor?: string){
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


const getFollowingFeedSkeletonOnlyCA = (format: FeedFormatOption): GetSkeletonProps => async (ctx, agent, data, cursor) => {
    if (!agent.hasSession()) return {skeleton: [], cursor: undefined}

    const limit = 25

    const t1 = Date.now()
    const queryRes = await (format == "Todos" ?
        followingFeedOnlyCABaseQueryAll(ctx, agent, limit, cursor) :
        followingFeedOnlyCABaseQueryArticles(ctx, agent, limit, cursor))

    const t2 = Date.now()
    ctx.logger.logTimes("posts for skeleton only ca", [t1, t2])

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


    return {
        skeleton,
        cursor: newCursor
    }
}


export const getFollowingFeedSkeleton: (filter: FollowingFeedFilter, format: FeedFormatOption) => GetSkeletonProps = (filter, format) => async (ctx, agent, data, cursor) => {
    if (filter == "Todos" && format == "Todos") {
        return getFollowingFeedSkeletonAll(ctx, agent, data, cursor)
    } else {
        return getFollowingFeedSkeletonOnlyCA(format)(ctx, agent, data, cursor)
    }
}


export function filterFeed(ctx: AppContext, feed: ArCabildoabiertoFeedDefs.FeedViewContent[], allowTopicVersions: boolean = false) {

    feed = feed.filter(a => {
        if (!ArCabildoabiertoFeedDefs.isPostView(a.content)) return true
        const record = a.content.record as AppBskyFeedPost.Record

        if (!record.reply) return true

        const parent = getCollectionFromUri(record.reply.parent.uri)
        const root = getCollectionFromUri(record.reply.root.uri)

        const badParent = !isArticle(parent) && !isPost(parent) && (!allowTopicVersions || !isTopicVersion(parent))
        const badRoot = !isArticle(root) && !isPost(root) && (!allowTopicVersions || !isTopicVersion(root))
        return !badParent && !badRoot
    })

    let roots = new Set<string>()
    const res: ArCabildoabiertoFeedDefs.FeedViewContent[] = []
    feed.forEach(a => {
        const rootUri = getRootUriFromPost(ctx, a)
        if (rootUri && !roots.has(rootUri)) {
            res.push(a)
            roots.add(rootUri)
        } else if (!rootUri) {
            const rootTopic = getRootTopicIdFromPost(ctx, a)
            if (rootTopic) {
                res.push(a)
            }
            ctx.logger.pino.warn("Warning: Filtrando porque no se encontró el root.")
        }
    })

    return res
}


export const getFollowingFeedPipeline: (filter?: FollowingFeedFilter, format?: FeedFormatOption) => FeedPipelineProps = (filter = "Todos", format = "Todos") => ({
    getSkeleton: getFollowingFeedSkeleton(filter, format)
})