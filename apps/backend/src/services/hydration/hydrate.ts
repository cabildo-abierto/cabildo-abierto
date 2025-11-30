import {$Typed, AppBskyEmbedImages} from "@atproto/api";
import {getCollectionFromUri, getDidFromUri, isArticle, isDataset, isPost, isTopicVersion} from "@cabildo-abierto/utils";
import {
    AppBskyFeedPost,
    ArCabildoabiertoFeedDefs,
    ArCabildoabiertoFeedArticle,
    ArCabildoabiertoWikiTopicVersion,
    ArCabildoabiertoDataDataset
} from "@cabildo-abierto/api"
import {AppBskyFeedDefs} from "@atproto/api"
import {FeedSkeleton} from "#/services/feed/feed.js";
import {decompress} from "#/utils/compression.js";
import {getAllText} from "#/services/wiki/diff.js";
import {listOrderDesc, sortByKey} from "@cabildo-abierto/utils";
import {Dataplane} from "#/services/hydration/dataplane.js";
import {hydrateEmbedViews, hydrateTopicViewBasicFromUri} from "#/services/wiki/topics.js";
import {getTopicTitle} from "#/services/wiki/utils.js";
import {hydrateDatasetView} from "#/services/dataset/read.js";
import {
    BlockedPost,
    isThreadViewPost,
    ThreadViewPost
} from "@atproto/api/dist/client/types/app/bsky/feed/defs.js"
import {hydrateProfileViewBasic} from "#/services/hydration/profile.js"
import removeMarkdown from "remove-markdown"
import {AppContext} from "#/setup.js";
import {PostViewHydrator} from "#/services/hydration/post-view.js";


export function hydrateViewer(uri: string, data: Dataplane): { repost?: string, like?: string } {
    const bskyPost = data.bskyPosts.get(uri)
    const sessionDid = data.agent.hasSession() ? data.agent.did : null
    if(!sessionDid) return {}

    let repost: string | undefined = bskyPost?.viewer?.repost
    if(!repost){
        const reposts = data.reposts.get(uri)
        reposts?.forEach(r => {
            if(r.uri && getDidFromUri(r.uri) == sessionDid){
                repost = r.uri
            }
        })
    }

    let like: string | undefined = bskyPost?.viewer?.like
    if(!like){
        const likes = data.likes.get(uri)
        likes?.forEach(r => {
            if(getDidFromUri(r) == sessionDid){
                like = r
            }
        })
    }

    return {
        ...bskyPost?.viewer,
        repost,
        like
    }
}


export function hydrateFullArticleView(ctx: AppContext, uri: string, data: Dataplane): {
    data?: $Typed<ArCabildoabiertoFeedDefs.FullArticleView>
    error?: string
} {
    const e = data.caContents?.get(uri)
    if (!e) return {error: "Ocurrió un error al cargar el contenido."}

    const topicsMentioned = data.topicsMentioned?.get(uri) ?? []

    const authorId = getDidFromUri(e.uri)
    const author = hydrateProfileViewBasic(ctx, authorId, data)
    const viewer = hydrateViewer(e.uri, data)
    if (!author) {
        ctx.logger.pino.error({authorId, uri}, "author not found during full article view hydration")
        return {error: "Ocurrió un error al cargar el contenido."}
    }

    const record = e.record ? JSON.parse(e.record) as ArCabildoabiertoFeedArticle.Record : undefined

    let text: string | null = null
    let format: string | null = null
    if (e?.text != null) {
        text = e.text
        format = e.dbFormat ?? null
    } else if (e?.textBlobId) {
        text = data.getFetchedBlob({cid: e?.textBlobId, authorId})
        format = e?.format ?? null
    }

    if (text == null || !e || !e.title) return {error: "Ocurrió un error al cargar el contenido."}

    const embeds = hydrateEmbedViews(author.did, record?.embeds ?? [])
    const {summary, summaryFormat} = getArticleSummary(text, format ?? undefined, e.articleDescription ?? undefined)

    const previewCid = e.articlePreviewImage

    const preview: AppBskyEmbedImages.ViewImage | undefined = previewCid ? {
        thumb: `https://cdn.bsky.app/img/feed_thumbnail/plain/${authorId}/${previewCid}@jpeg`,
        fullsize: `https://cdn.bsky.app/img/feed_fullsize/plain/${authorId}/${previewCid}@jpeg`,
        alt: e.title
    } : undefined

    return {
        data: {
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
                title: getTopicTitle({id: m.id, props: m.props as ArCabildoabiertoWikiTopicVersion.TopicProp[] | undefined}),
                id: m.id
            })),
            embeds,
            editedAt: e.editedAt?.toISOString(),
            preview: preview
        }
    }
}


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
    if(description) {
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
        summary = getAllText(summaryJson.root).slice(0, 150).replaceAll("\n", " ")
    }
    return {summary, summaryFormat: "plain-text"}
}


export function hydrateArticleView(ctx: AppContext, uri: string, data: Dataplane): {
    data?: $Typed<ArCabildoabiertoFeedDefs.ArticleView>
    error?: string
} {
    const e = data.caContents?.get(uri)
    if (!e) {
        ctx.logger.pino.error(`No se encontraron los datos para hidratar el artículo: ${uri}`)
        return {error: "Ocurrió un error al cargar el contenido."}
    }

    const viewer = hydrateViewer(e.uri, data)
    const authorId = getDidFromUri(e.uri)
    const author = hydrateProfileViewBasic(ctx, authorId, data)
    if (!author) {
        console.log("No se enconctró el autor del contenido.", uri)
        return {error: "No se encontró el autor del contenido."}
    }

    let text: string | null = null
    let format: string | null = null
    if (e.text != null) {
        text = e.text
        format = e.dbFormat ?? null
    } else if (e.textBlobId) {
        text = data.getFetchedBlob({cid: e?.textBlobId, authorId})
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
        return {error: "Ocurrió un error al cargar el artículo."}
    }

    const {summary, summaryFormat} = getArticleSummary(text, format ?? undefined, e.articleDescription ?? undefined)

    const previewCid = e.articlePreviewImage

    const preview: AppBskyEmbedImages.ViewImage | undefined = previewCid ? {
        thumb: `https://cdn.bsky.app/img/feed_thumbnail/plain/${authorId}/${previewCid}@jpeg`,
        fullsize: `https://cdn.bsky.app/img/feed_fullsize/plain/${authorId}/${previewCid}@jpeg`,
        alt: e.title
    } : undefined

    return {
        data: {
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
    }
}


export function hydrateContent(ctx: AppContext, uri: string, data: Dataplane, full: boolean = false): {
    data?: $Typed<ArCabildoabiertoFeedDefs.PostView> | $Typed<ArCabildoabiertoFeedDefs.ArticleView> | $Typed<ArCabildoabiertoFeedDefs.FullArticleView> | $Typed<ArCabildoabiertoWikiTopicVersion.TopicViewBasic> | $Typed<ArCabildoabiertoDataDataset.DatasetView>,
    error?: string
} {
    const collection = getCollectionFromUri(uri)
    if (isPost(collection)) {
        return {data: new PostViewHydrator(ctx, data).hydrate(uri) ?? undefined}
    } else if (isArticle(collection)) {
        return full ? hydrateFullArticleView(ctx, uri, data) : hydrateArticleView(ctx, uri, data)
    } else if (isTopicVersion(collection)) {
        return hydrateTopicViewBasicFromUri(uri, data)
    } else if (isDataset(collection)) {
        const res = hydrateDatasetView(ctx, uri, data)
        if (res) return {data: res}; else return {error: "No se pudo hidratar el dataset."}
    } else {
        ctx.logger.pino.warn({collection}, "hydration not implemented")
        return {error: "Hidratación no implementada para: " + collection}
    }
}


export function notFoundPost(uri: string): $Typed<AppBskyFeedDefs.NotFoundPost> {
    return {
        $type: "app.bsky.feed.defs#notFoundPost",
        uri,
        notFound: true
    }
}


function hydrateFeedViewContentReason(ctx: AppContext, subjectUri: string, reason: ArCabildoabiertoFeedDefs.SkeletonFeedPost["reason"], data: Dataplane): ArCabildoabiertoFeedDefs.FeedViewContent["reason"] | null {
    if (!reason) return null
    if (ArCabildoabiertoFeedDefs.isSkeletonReasonRepost(reason)) {
        const user = hydrateProfileViewBasic(ctx, getDidFromUri(reason.repost), data)
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
}


export function hydrateFeedViewContent(ctx: AppContext, e: ArCabildoabiertoFeedDefs.SkeletonFeedPost, data: Dataplane): $Typed<ArCabildoabiertoFeedDefs.FeedViewContent> | null {
    const reason = hydrateFeedViewContentReason(ctx, e.post, e.reason, data) ?? undefined

    const childBsky = data.bskyPosts?.get(e.post)
    const reply = childBsky ? (childBsky.record as AppBskyFeedPost.Record).reply : null

    const leaf = hydrateContent(ctx, e.post, data)
    const parent = reply && !ArCabildoabiertoFeedDefs.isReasonRepost(reason) ? hydrateContent(ctx, reply.parent.uri, data) : null
    const root = reply && !ArCabildoabiertoFeedDefs.isReasonRepost(reason) ? hydrateContent(ctx, reply.root.uri, data) : null

    if (!leaf.data || leaf.error) {
        ctx.logger.pino.warn({uri: e.post}, "content not found")
        return null
    } else if (!reply) {
        return {
            $type: "ar.cabildoabierto.feed.defs#feedViewContent",
            content: leaf.data,
            reason
        }
    } else {
        return {
            $type: "ar.cabildoabierto.feed.defs#feedViewContent",
            content: leaf.data,
            reason,
            reply: {
                parent: parent && parent.data ? parent.data : notFoundPost(reply.parent.uri),
                root: root && root.data ? root.data : notFoundPost(reply.root.uri) // puede ser igual a parent, el frontend se ocupa
            }
        }
    }
}


export type BlobRef = { cid: string, authorId: string }


export async function hydrateFeed(ctx: AppContext, skeleton: FeedSkeleton, data: Dataplane): Promise<$Typed<ArCabildoabiertoFeedDefs.FeedViewContent>[]> {
    await data.fetchFeedHydrationData(skeleton)

    const feed = skeleton
        .map((e) => (hydrateFeedViewContent(ctx, e, data)))
        .filter(x => x != null)

    return feed.filter(x => ArCabildoabiertoFeedDefs.isFeedViewContent(x))
}


export type ThreadSkeleton = {
    post: string
    replies?: ThreadSkeleton[]
    parent?: ThreadSkeleton
}


type ThreadViewContentReply = $Typed<ArCabildoabiertoFeedDefs.ThreadViewContent> | $Typed<AppBskyFeedDefs.NotFoundPost> | $Typed<BlockedPost> | { $type: string }


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

export function hydrateThreadViewContent(ctx: AppContext, skeleton: ThreadSkeleton, data: Dataplane, includeReplies: boolean = false, isMain: boolean = false): $Typed<ArCabildoabiertoFeedDefs.ThreadViewContent> | null {
    const content = hydrateContent(ctx, skeleton.post, data, isMain).data
    if (!content) {
        ctx.logger.pino.error({uri: skeleton.post}, "content not found during thread hydration")
        return null
    }

    const authorDid = getDidFromUri(skeleton.post)

    let replies: $Typed<ArCabildoabiertoFeedDefs.ThreadViewContent>[] | undefined
    if (includeReplies && skeleton.replies) {
        replies = skeleton.replies
            .map((r) => (hydrateThreadViewContent(ctx, r, data, true)))
            .filter(x => x != null)

        replies = sortByKey(replies, threadRepliesSortKey(authorDid), listOrderDesc)
    }

    let parent: $Typed<ArCabildoabiertoFeedDefs.ThreadViewContent> | undefined
    if (skeleton.parent) {
        const hydratedParent = hydrateThreadViewContent(ctx, skeleton.parent, data, false)
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
}


