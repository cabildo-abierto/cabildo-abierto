import {$Typed, AppBskyEmbedImages, AppBskyFeedDefs} from "@atproto/api";
import {
    getCollectionFromUri,
    getDidFromUri,
    isArticle,
    isDataset,
    isPost,
    isTopicVersion,
    listOrderDesc,
    sortByKey
} from "@cabildo-abierto/utils";
import {
    AppBskyFeedPost,
    ArCabildoabiertoDataDataset,
    ArCabildoabiertoFeedArticle,
    ArCabildoabiertoFeedDefs,
    ArCabildoabiertoWikiTopicVersion
} from "@cabildo-abierto/api"
import {FeedSkeleton} from "#/services/feed/feed.js";
import {decompress, getPlainText} from "@cabildo-abierto/editor-core";
import {hydrateEmbedViews, hydrateTopicViewBasicFromUri} from "#/services/wiki/topics.js";
import {getTopicTitle} from "#/services/wiki/utils.js";
import {hydrateDatasetView} from "#/services/dataset/read.js";
import {BlockedPost, isThreadViewPost, ThreadViewPost} from "@atproto/api/dist/client/types/app/bsky/feed/defs.js"
import {hydrateProfileViewBasic} from "#/services/hydration/profile.js"
import removeMarkdown from "remove-markdown"
import {AppContext} from "#/setup.js";
import {Effect} from "effect";
import {DataPlane, FetchFromBskyError} from "#/services/hydration/dataplane.js";
import {NoSessionAgent, SessionAgent} from "#/utils/session-agent.js";
import {hydratePostView} from "#/services/hydration/post-view.js";
import {DBError} from "#/services/write/article.js";


export const hydrateViewer = (agent: SessionAgent | NoSessionAgent, uri: string): Effect.Effect<{
    repost?: string,
    like?: string
}, never, DataPlane> => Effect.gen(function* () {
    const dataplane = yield* DataPlane
    const data = dataplane.getState()
    const bskyPost = data.bskyPosts.get(uri)
    const sessionDid = agent.hasSession() ? agent.did : null
    if (!sessionDid) return {}

    let repost: string | undefined = bskyPost?.viewer?.repost
    if (!repost) {
        const reposts = data.reposts.get(uri)
        reposts?.forEach(r => {
            if (r.uri && getDidFromUri(r.uri) == sessionDid) {
                repost = r.uri
            }
        })
    }

    let like: string | undefined = bskyPost?.viewer?.like
    if (!like) {
        const likes = data.likes.get(uri)
        likes?.forEach(r => {
            if (getDidFromUri(r) == sessionDid) {
                like = r
            }
        })
    }

    return {
        ...bskyPost?.viewer,
        repost,
        like
    }
})


export const hydrateFullArticleView = (ctx: AppContext, agent: SessionAgent | NoSessionAgent, uri: string): Effect.Effect<$Typed<ArCabildoabiertoFeedDefs.FullArticleView> | null, never, DataPlane> => Effect.gen(function* () {
    const dataplane = yield* DataPlane
    const data = dataplane.getState()
    const e = data.caContents?.get(uri)
    if (!e) return null

    const topicsMentioned = data.topicsMentioned?.get(uri) ?? []

    const authorId = getDidFromUri(e.uri)
    const author = yield* hydrateProfileViewBasic(ctx, authorId)
    const viewer = yield* hydrateViewer(agent, e.uri)
    if (!author) {
        ctx.logger.pino.error({authorId, uri}, "author not found during full article view hydration")
        return null
    }

    const record = e.record ?
        JSON.parse(e.record) as ArCabildoabiertoFeedArticle.Record :
        undefined

    let text: string | null = null
    let format: string | null = null
    if (e?.text != null) {
        text = e.text
        format = e.dbFormat ?? null
    } else if (e?.textBlobId) {
        text = dataplane.getFetchedBlob({cid: e?.textBlobId, authorId})
        format = e?.format ?? null
    }

    if (text == null || !e || !e.title) return null

    const embeds = hydrateEmbedViews(author.did, record?.embeds ?? [])
    const {summary, summaryFormat} = getArticleSummary(text, format ?? undefined, e.articleDescription ?? undefined)

    const previewCid = e.articlePreviewImage

    const preview: AppBskyEmbedImages.ViewImage | undefined = previewCid ? {
        thumb: `https://cdn.bsky.app/img/feed_thumbnail/plain/${authorId}/${previewCid}@jpeg`,
        fullsize: `https://cdn.bsky.app/img/feed_fullsize/plain/${authorId}/${previewCid}@jpeg`,
        alt: e.title
    } : undefined

    const res: $Typed<ArCabildoabiertoFeedDefs.FullArticleView> = {
        $type: "ar.cabildoabierto.feed.defs#fullArticleView",
        uri: e.uri,
        cid: e.cid,
        title: e.title,
        text,
        format: format ?? undefined,
        summary,
        summaryFormat,
        author,
        labels: dbLabelsToLabelsView(e.selfLabels ?? [], uri),
        record: e.record ? JSON.parse(e.record) : {},
        indexedAt: new Date(e.created_at).toISOString(),
        likeCount: e.uniqueLikesCount,
        repostCount: e.uniqueRepostsCount,
        replyCount: e.repliesCount,
        quoteCount: e.quotesCount,
        viewer,
        topicsMentioned: topicsMentioned.map(m => ({
            count: m.count ?? 0,
            title: getTopicTitle({
                id: m.id,
                props: m.props as ArCabildoabiertoWikiTopicVersion.TopicProp[] | undefined
            }),
            id: m.id
        })),
        embeds,
        editedAt: e.editedAt?.toISOString(),
        preview: preview
    }
    return res
})


export function dbLabelsToLabelsView(labels: string[], uri: string) {
    const did = getDidFromUri(uri)
    return labels.map(l => ({
        val: l, src: did, uri: uri, cts: new Date().toISOString() // TO DO: Almacenar las timestamps de las labels
    }))
}


export function markdownToPlainText(md: string) {
    return removeMarkdown(md)
        .trim()
        .replaceAll("\n", " ")
        .replaceAll("\\n", " ")
        .replaceAll("\|", " ")
        .replaceAll("\-\-\-", " ")
}


export function getArticleSummary(text: string | null, format: string | undefined, description: string | undefined) {
    if (description) {
        return {
            summary: description,
            summaryFormat: "plain-text"
        }
    }
    if (text == null) {
        return {
            summary: "Contenido no encontrado.",
            summaryFormat: "plain-text"
        }
    }
    let summary = ""
    if (format == "markdown") {
        summary = markdownToPlainText(text)
            .slice(0, 150)
            .trim()
    } else if (!format || format == "lexical-compressed") {
        const summaryJson = JSON.parse(decompress(text))
        summary = getPlainText(summaryJson.root).slice(0, 150).replaceAll("\n", " ")
    }
    return {summary, summaryFormat: "plain-text"}
}


export function getArticlePreviewImage(authorId: string, previewCid: string | undefined, title?: string): AppBskyEmbedImages.ViewImage | undefined {
    return previewCid ? {
        thumb: `https://cdn.bsky.app/img/feed_thumbnail/plain/${authorId}/${previewCid}@jpeg`,
        fullsize: `https://cdn.bsky.app/img/feed_fullsize/plain/${authorId}/${previewCid}@jpeg`,
        alt: title ?? ""
    } : undefined
}


export const hydrateArticleView = (ctx: AppContext, agent: SessionAgent | NoSessionAgent, uri: string): Effect.Effect<$Typed<ArCabildoabiertoFeedDefs.ArticleView> | null, never, DataPlane> => Effect.gen(function* () {
    const dataplane = yield* DataPlane
    const data = dataplane.getState()
    const e = data.caContents?.get(uri)
    if (!e) {
        ctx.logger.pino.error(`No se encontraron los datos para hidratar el artículo: ${uri}`)
        return null
    }

    const viewer = yield* hydrateViewer(agent, e.uri)
    const authorId = getDidFromUri(e.uri)
    const author = yield* hydrateProfileViewBasic(ctx, authorId)
    if (!author) {
        console.log("No se enconctró el autor del contenido.", uri)
        return null
    }

    let text: string | null = null
    let format: string | null = null
    if (e.text != null) {
        text = e.text
        format = e.dbFormat ?? null
    } else if (e.textBlobId) {
        text = dataplane.getFetchedBlob({cid: e?.textBlobId, authorId})
        ctx.logger.pino.warn({
            uri: e.uri,
            textBlobId: e?.textBlobId,
            text: text != null
        }, "no text found, tried fetching blob")
        format = e.format ?? null
    } else {
        ctx.logger.pino.error({uri: e.uri}, "no text and no blob found")
    }

    if (!e.title) {
        ctx.logger.pino.warn({
            uri,
            title: e.title
        }, "content not found")
        return null
    }

    const {summary, summaryFormat} = getArticleSummary(text, format ?? undefined, e.articleDescription ?? undefined)

    const previewCid = e.articlePreviewImage

    const preview = getArticlePreviewImage(authorId, previewCid ?? undefined, e.title)

    return {
        $type: "ar.cabildoabierto.feed.defs#articleView",
        uri: e.uri,
        cid: e.cid,
        title: e.title,
        summary,
        summaryFormat,
        labels: dbLabelsToLabelsView(e.selfLabels ?? [], uri),
        author,
        record: e.record ? JSON.parse(e.record) : {},
        indexedAt: e.created_at.toISOString(),
        likeCount: e.uniqueLikesCount,
        repostCount: e.uniqueRepostsCount,
        replyCount: e.repliesCount,
        quoteCount: e.quotesCount,
        viewer,
        preview
    }
})


type Content = $Typed<ArCabildoabiertoFeedDefs.PostView> | $Typed<ArCabildoabiertoFeedDefs.ArticleView> | $Typed<ArCabildoabiertoFeedDefs.FullArticleView> | $Typed<ArCabildoabiertoWikiTopicVersion.TopicViewBasic> | $Typed<ArCabildoabiertoDataDataset.DatasetView>


export const hydrateContent = (ctx: AppContext, agent: SessionAgent | NoSessionAgent, uri: string, full: boolean = false): Effect.Effect<Content | null, never, DataPlane> => Effect.gen(function* () {
    const collection = getCollectionFromUri(uri)
    if (isPost(collection)) {
        return yield* hydratePostView(ctx, agent, uri)
    } else if (isArticle(collection)) {
        return full ?
            (yield* hydrateFullArticleView(ctx, agent, uri)) :
            (yield* hydrateArticleView(ctx,  agent, uri))
    } else if (isTopicVersion(collection)) {
        return yield* hydrateTopicViewBasicFromUri(ctx, uri)
    } else if (isDataset(collection)) {
        const res = yield* hydrateDatasetView(ctx, uri)
        return res ?? null
    } else {
        ctx.logger.pino.warn({collection}, "hydration not implemented")
        return null
    }
})


export function notFoundPost(uri: string): $Typed<AppBskyFeedDefs.NotFoundPost> {
    return {
        $type: "app.bsky.feed.defs#notFoundPost",
        uri,
        notFound: true
    }
}


const hydrateFeedViewContentReason = (ctx: AppContext, subjectUri: string, reason: ArCabildoabiertoFeedDefs.SkeletonFeedPost["reason"]): Effect.Effect<ArCabildoabiertoFeedDefs.FeedViewContent["reason"] | null, never, DataPlane> => Effect.gen(function* () {
    if (!reason) return null
    const dataplane = yield* DataPlane
    const data = dataplane.getState()
    if (ArCabildoabiertoFeedDefs.isSkeletonReasonRepost(reason)) {
        const user = hydrateProfileViewBasic(ctx, getDidFromUri(reason.repost))
        if (!user) {
            ctx.logger.pino.warn({reason}, "no se encontró el usuario autor del repost")
            return null
        }
        // TO DO (!): Esto está un poco raro, si algo fue reposteado más de una vez no anda
        const repostData = data.reposts.get(subjectUri)
        const repost = repostData ? repostData[0] : undefined
        if (!repost || !repost.created_at) {
            ctx.logger.pino.warn({reason}, "no se encontró el repost")
            return null
        }
        const indexedAt = repost.created_at.toISOString()
        return {
            $type: "ar.cabildoabierto.feed.defs#reasonRepost",
            by: {
                ...user,
                $type: "ar.cabildoabierto.actor.defs#profileViewBasic",
            },
            indexedAt
        }
    }
    ctx.logger.pino.warn({reason}, "failed to hydrate reason")
    return null
})


export const hydrateFeedViewContent = (ctx: AppContext, agent: SessionAgent | NoSessionAgent, e: ArCabildoabiertoFeedDefs.SkeletonFeedPost): Effect.Effect<$Typed<ArCabildoabiertoFeedDefs.FeedViewContent> | null, never, DataPlane> => Effect.gen(function* () {
    const dataplane = yield* DataPlane
    const data = dataplane.getState()
    const reason = yield* hydrateFeedViewContentReason(ctx, e.post, e.reason)

    const childBsky = data.bskyPosts?.get(e.post)
    const reply = childBsky ? (childBsky.record as AppBskyFeedPost.Record).reply : null

    const leaf = yield* hydrateContent(ctx, agent, e.post)
    const parent = reply && !ArCabildoabiertoFeedDefs.isReasonRepost(reason) ? yield* hydrateContent(ctx, agent, reply.parent.uri) : null
    const root = reply && !ArCabildoabiertoFeedDefs.isReasonRepost(reason) ? yield* hydrateContent(ctx, agent, reply.root.uri) : null

    if (!leaf) {
        ctx.logger.pino.warn({uri: e.post}, "content not found")
        return null
    } else if (!reply) {
        const res: $Typed<ArCabildoabiertoFeedDefs.FeedViewContent> = {
            $type: "ar.cabildoabierto.feed.defs#feedViewContent",
            content: leaf,
            reason: reason ?? undefined
        }
        return res
    } else {
        const res: $Typed<ArCabildoabiertoFeedDefs.FeedViewContent> = {
            $type: "ar.cabildoabierto.feed.defs#feedViewContent",
            content: leaf,
            reason: reason ?? undefined,
            reply: {
                parent: parent && parent ? parent : notFoundPost(reply.parent.uri),
                root: root ?? notFoundPost(reply.root.uri) // puede ser igual a parent, el frontend se ocupa
            }
        }
        return res
    }
})


export type BlobRef = { cid: string, authorId: string }


export const hydrateFeed = (ctx: AppContext, agent: SessionAgent | NoSessionAgent, skeleton: FeedSkeleton): Effect.Effect<$Typed<ArCabildoabiertoFeedDefs.FeedViewContent>[], DBError | FetchFromBskyError, DataPlane> => Effect.gen(function* () {
    const dataplane = yield* DataPlane
    yield* dataplane.fetchFeedHydrationData(skeleton)

    const feed = yield* Effect.all(skeleton
        .map((e) => (hydrateFeedViewContent(ctx, agent, e)))
        .filter(x => x != null))

    return feed.filter(x => ArCabildoabiertoFeedDefs.isFeedViewContent(x))
})


export type ThreadSkeleton = {
    post: string
    replies?: ThreadSkeleton[]
    parent?: ThreadSkeleton
}


type ThreadViewContentReply =
    $Typed<ArCabildoabiertoFeedDefs.ThreadViewContent>
    | $Typed<AppBskyFeedDefs.NotFoundPost>
    | $Typed<BlockedPost>
    | { $type: string }


export const threadRepliesSortKey = (authorId: string) => (r: ThreadViewContentReply) => {


    return ArCabildoabiertoFeedDefs.isThreadViewContent(r) && ArCabildoabiertoFeedDefs.isPostView(r.content) && r.content.author.did == authorId ?
        [1, new Date(r.content.indexedAt).getTime()] : [0, 0]
}


export const threadPostRepliesSortKey = (authorId: string) => (r: ThreadViewPost) => {
    return isThreadViewPost(r) &&
    AppBskyFeedDefs.isPostView(r.post) &&
    r.post.author.did == authorId ?
        [1, -new Date(r.post.indexedAt).getTime()] : [0, 0]
}


export const hydrateThreadViewContent = (ctx: AppContext, agent: SessionAgent | NoSessionAgent, skeleton: ThreadSkeleton, includeReplies: boolean = false, isMain: boolean = false): Effect.Effect<$Typed<ArCabildoabiertoFeedDefs.ThreadViewContent> | null, never, DataPlane> => Effect.gen(function* () {
    const content = yield* hydrateContent(ctx, agent, skeleton.post, isMain)
    if (!content) {
        ctx.logger.pino.error({uri: skeleton.post}, "content not found during thread hydration")
        return null
    }

    const authorDid = getDidFromUri(skeleton.post)

    let replies: $Typed<ArCabildoabiertoFeedDefs.ThreadViewContent>[] | undefined
    if (includeReplies && skeleton.replies) {
        replies = (yield* Effect.all(skeleton.replies
            .map((r) => (hydrateThreadViewContent(ctx, agent, r, true))))).filter(x => x != null)

        replies = sortByKey(replies, threadRepliesSortKey(authorDid), listOrderDesc)
    }

    let parent: $Typed<ArCabildoabiertoFeedDefs.ThreadViewContent> | undefined
    if (skeleton.parent) {
        const hydratedParent = yield* hydrateThreadViewContent(
            ctx, agent, skeleton.parent, false)
        if (hydratedParent) {
            parent = {
                ...hydratedParent,
                $type: "ar.cabildoabierto.feed.defs#threadViewContent"
            }
        }
    }

    return {
        $type: "ar.cabildoabierto.feed.defs#threadViewContent",
        content,
        replies,
        parent
    }
})