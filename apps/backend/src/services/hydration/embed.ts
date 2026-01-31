import {hydrateProfileViewBasic} from "#/services/hydration/profile.js";
import {
    $Typed,
    AppBskyEmbedExternal,
    AppBskyEmbedImages,
    AppBskyEmbedRecord,
    AppBskyEmbedRecordWithMedia,
    AppBskyEmbedVideo, AppBskyFeedDefs
} from "@atproto/api";
import {getCollectionFromUri, getDidFromUri, isArticle, isPost, isTopicVersion} from "@cabildo-abierto/utils";
import {getTopicTitle} from "#/services/wiki/utils.js";
import {hydrateEmbedViews} from "#/services/wiki/topics.js";
import {hydrateDatasetView, hydrateTopicsDatasetView} from "#/services/dataset/read.js";
import {hydrateArticleView} from "#/services/hydration/hydrate.js";
import {
    ArCabildoabiertoFeedDefs,
    AppBskyFeedPost,
    ArCabildoabiertoEmbedSelectionQuote,
    ArCabildoabiertoEmbedVisualization,
    ArCabildoabiertoEmbedRecord,
    ArCabildoabiertoEmbedRecordWithMedia,
    ArCabildoabiertoWikiTopicVersion,
    ArCabildoabiertoFeedArticle
} from "@cabildo-abierto/api"
import { Effect } from "effect";
import {DataPlane} from "#/services/hydration/dataplane.js";
import {AppContext} from "#/setup.js";
import {NoSessionAgent, SessionAgent} from "#/utils/session-agent.js";
import {hydratePostView} from "#/services/hydration/post-view.js";


export const hydrateEmbedView = (ctx: AppContext, agent: SessionAgent | NoSessionAgent, uri: string): Effect.Effect<ArCabildoabiertoFeedDefs.PostView["embed"] | null, never, DataPlane> => Effect.gen(function* () {
    const dataplane = yield* DataPlane
    const state = dataplane.getState()
    const post = state.bskyPosts?.get(uri)
    const caData = state.caContents?.get(uri)
    if(!post) return null

    const record = caData?.record ?
        JSON.parse(caData.record) as AppBskyFeedPost.Record :
        post.record as AppBskyFeedPost.Record

    const embed = record.embed

    const authorId = getDidFromUri(uri)

    if (ArCabildoabiertoEmbedSelectionQuote.isMain(embed) && record.reply) {
        return yield* hydrateSelectionQuoteEmbedView(
            ctx,
            embed,
            record.reply.parent.uri
        )
    } else if (ArCabildoabiertoEmbedVisualization.isMain(embed)) {
        return yield* hydrateVisualizationEmbedView(ctx, embed)
    } else if (AppBskyEmbedRecord.isMain(embed)) {
        return yield* hydrateRecordEmbedView(ctx, agent, embed)
    } else if(AppBskyEmbedRecordWithMedia.isMain(embed)) {
        return yield* hydrateRecordWithMediaEmbedView(ctx, agent, embed, authorId, post)
    } else if (AppBskyEmbedImages.isMain(embed)) {
        return yield* hydrateImageEmbedView(
            embed,
            authorId
        )
    } else if (AppBskyEmbedExternal.isMain(embed)) {
        return hydrateExternalEmbedView( embed, authorId)
    }

    return post.embed
})

const hydrateRecordWithMediaEmbedView = (ctx: AppContext, agent: SessionAgent | NoSessionAgent, embed: $Typed<AppBskyEmbedRecordWithMedia.Main>, authorId: string, postView?: AppBskyFeedDefs.PostView): Effect.Effect<$Typed<ArCabildoabiertoEmbedRecordWithMedia.View> | null, never, DataPlane> => Effect.gen(function* () {
    const uri = embed.record.record.uri
    const record = yield* hydrateRecordEmbedViewFromUri(ctx, agent, uri)

    let media: ArCabildoabiertoEmbedRecordWithMedia.View["media"]

    if(AppBskyEmbedImages.isMain(embed.media)){
        media = yield* hydrateImageEmbedView(embed.media, authorId)
    } else if(AppBskyEmbedVideo.isMain(embed.media)) {
        if(postView && AppBskyEmbedRecordWithMedia.isView(postView.embed)) {
            media = postView.embed.media
        } else {
            ctx.logger.pino.error("video embed hydration not implemented")
            return null
        }
    } else if(AppBskyEmbedExternal.isMain(embed.media)) {
        media = hydrateExternalEmbedView(embed.media, authorId)
    } else {
        ctx.logger.pino.error({embed}, "hydration not implemented for media")
        return null
    }

    const res: $Typed<ArCabildoabiertoEmbedRecordWithMedia.View> = {
        $type: "ar.cabildoabierto.embed.recordWithMedia#view",
        record: record ?? {
            record: {
                $type: "app.bsky.embed.record#viewNotFound",
                notFound: true,
                uri
            }
        },
        media
    }
    return res
})


const hydrateRecordEmbedViewFromUri = (ctx: AppContext, agent: SessionAgent | NoSessionAgent, uri: string): Effect.Effect<$Typed<ArCabildoabiertoEmbedRecord.View> | null, never, DataPlane> => Effect.gen(function* () {
    const collection = getCollectionFromUri(uri)

    if (isArticle(collection)) {
        const artView = yield* hydrateArticleView(ctx, agent, uri)
        return {
            $type: "ar.cabildoabierto.embed.record#view",
            record: {
                ...artView,
                value: artView.record,
                $type: "ar.cabildoabierto.embed.record#viewArticleRecord"
            }
        }
    } else if (isPost(collection)) {
        const post = yield* hydratePostView(ctx, agent, uri)
        if (post) {
            const embed = post.embed
            return {
                $type: "ar.cabildoabierto.embed.record#view",
                record: {
                    ...post,
                    embeds: embed ? [embed] : undefined,
                    value: post.record,
                    $type: "ar.cabildoabierto.embed.record#viewRecord"
                }
            }
        }
    } else {
        ctx.logger.pino.warn({collection}, `hydration not implemented for collection`)
    }
    return null
})


const hydrateRecordEmbedView = (ctx: AppContext, agent: SessionAgent | NoSessionAgent, embed: $Typed<AppBskyEmbedRecord.Main>): Effect.Effect<$Typed<ArCabildoabiertoEmbedRecord.View> | null, never, DataPlane> => {
    const uri = embed.record.uri
    return hydrateRecordEmbedViewFromUri(ctx, agent, uri)
}


const hydrateVisualizationEmbedView = (ctx: AppContext, embed: ArCabildoabiertoEmbedVisualization.Main): Effect.Effect<$Typed<ArCabildoabiertoEmbedVisualization.View> | null, never, DataPlane> => Effect.gen(function* () {
    if (ArCabildoabiertoEmbedVisualization.isDatasetDataSource(embed.dataSource)) {
        const datasetUri = embed.dataSource.dataset
        const dataset = yield* hydrateDatasetView(
            ctx,
            datasetUri
        )
        if (dataset) {
            return {
                visualization: embed,
                dataset,
                $type: "ar.cabildoabierto.embed.visualization#view",
            }
        }
    } else if (ArCabildoabiertoEmbedVisualization.isTopicsDataSource(embed.dataSource)) {
        const filters = embed.filters?.filter(ArCabildoabiertoEmbedVisualization.isColumnFilter) ?? []
        const dataset = yield* hydrateTopicsDatasetView(
            ctx,
            filters
        )
        if (dataset) {
            return {
                visualization: embed,
                dataset,
                $type: "ar.cabildoabierto.embed.visualization#view",
            }
        }
    } else {
        ctx.logger.pino.warn({embed}, "no se pudo hidratar la visualización")
    }
    return null
})


const hydrateSelectionQuoteEmbedView = (ctx: AppContext, embed: ArCabildoabiertoEmbedSelectionQuote.Main, quotedContent: string): Effect.Effect<$Typed<ArCabildoabiertoEmbedSelectionQuote.View> | null, never, DataPlane> => Effect.gen(function* () {
    const dataplane = yield* DataPlane
    const state = dataplane.getState()
    const caData = state.caContents?.get(quotedContent)

    if (caData) {
        const authorId = getDidFromUri(caData.uri)
        const author = yield* hydrateProfileViewBasic(ctx, authorId)
        if (!author) {
            ctx.logger.pino.warn({authorId}, "couldn't find author of quoted content")
            return null
        }

        const record = caData.record ? JSON.parse(caData.record) as ArCabildoabiertoFeedArticle.Record | ArCabildoabiertoWikiTopicVersion.Record : null

        let text: string | null = null
        let format: string | null = null
        if (caData.text != null) {
            text = caData.text
            format = caData.dbFormat ?? null
        } else if (caData.textBlobId) {
            text = dataplane.getFetchedBlob({cid: caData.textBlobId, authorId})
            format = record?.format ?? null
        }
        if (text == null) {
            ctx.logger.pino.warn({embed, quotedContent}, "couldn't find text of quoted content")
            return null
        }

        const collection = getCollectionFromUri(quotedContent)
        let title: string | undefined
        if (isArticle(collection)) {
            title = caData.title ?? undefined
        } else if (isTopicVersion(collection) && caData.topicId) {
            title = getTopicTitle({
                id: caData.topicId,
                props: caData.props as ArCabildoabiertoWikiTopicVersion.TopicProp[]
            })
        }
        if (!title) {
            ctx.logger.pino.warn({embed, quotedContent}, "couldn't find title of quoted content")
            return null
        }

        const embedsData = caData.embeds ?? []
        const embeds = hydrateEmbedViews(author.did, embedsData as unknown as ArCabildoabiertoFeedArticle.ArticleEmbed[])

        return {
            $type: "ar.cabildoabierto.embed.selectionQuote#view",
            start: embed.start,
            end: embed.end,
            quotedText: text,
            quotedTextFormat: format ?? undefined,
            quotedContentTitle: title,
            quotedContent,
            quotedContentAuthor: author,
            quotedContentEmbeds: embeds
        }
    } else {
        ctx.logger.pino.warn({embed, quotedContent}, "data unavailable for selection quote embed hydration")
        return null
    }
})

function hydrateImageEmbedView(embed: AppBskyEmbedImages.Main, authorId: string): Effect.Effect<$Typed<AppBskyEmbedImages.View>, never, DataPlane> {
    return Effect.gen(function* () {
        const images = embed.images
            .map(i => hydrateImageInImagesEmbed(authorId, i))

        return {
            $type: "app.bsky.embed.images#view",
            images: images.filter(i => i != null)
        }
    })
}

function hydrateExternalEmbedView(embed: AppBskyEmbedExternal.Main, authorId: string): $Typed<AppBskyEmbedExternal.View> {
    const thumb = embed.external.thumb
    const cid = thumb ? (thumb.ref.$link ?? thumb.ref.toString()) : undefined

    return {
        $type: "app.bsky.embed.external#view",
        external: {
            uri: embed.external.uri,
            title: embed.external.title,
            description: embed.external.description,
            thumb: cid ? `https://cdn.bsky.app/img/feed_thumbnail/plain/${authorId}/${cid}@jpeg` : undefined
        }
    }
}

function hydrateImageInImagesEmbed(authorId: string, i: AppBskyEmbedImages.Image): AppBskyEmbedImages.ViewImage | null {
    const cid = i.image ? (i.image.ref.$link ?? i.image.ref.toString()) : undefined
    if(!cid) return null
    return {
        $type: "app.bsky.embed.images#viewImage",
        thumb: `https://cdn.bsky.app/img/feed_thumbnail/plain/${authorId}/${cid}@jpeg`,
        fullsize: `https://cdn.bsky.app/img/feed_fullsize/plain/${authorId}/${cid}@jpeg`,
        alt: i.alt,
        aspectRatio: i.aspectRatio
    }
}