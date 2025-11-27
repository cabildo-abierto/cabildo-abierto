
import { Hydrator } from "./hydrator.js";
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
import {PostViewHydrator} from "#/services/hydration/post-view.js";
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


export class EmbedHydrator extends Hydrator<string, ArCabildoabiertoFeedDefs.PostView["embed"]> {

    hydrate(uri: string): ArCabildoabiertoFeedDefs.PostView["embed"] | null {
        const post = this.dataplane.bskyPosts?.get(uri)
        const caData = this.dataplane.caContents?.get(uri)
        if(!post) {
            return null
        }

        const record = caData?.record ? JSON.parse(caData.record) as AppBskyFeedPost.Record : post.record as AppBskyFeedPost.Record
        const embed = record.embed

        const authorId = getDidFromUri(uri)

        if (ArCabildoabiertoEmbedSelectionQuote.isMain(embed) && record.reply) {
            return this.hydrateSelectionQuoteEmbedView(
                embed,
                record.reply.parent.uri
            )
        } else if (ArCabildoabiertoEmbedVisualization.isMain(embed)) {
            return this.hydrateVisualizationEmbedView(embed)
        } else if (AppBskyEmbedRecord.isMain(embed)) {
            return this.hydrateRecordEmbedView(embed)
        } else if(AppBskyEmbedRecordWithMedia.isMain(embed)) {
            return this.hydrateRecordWithMediaEmbedView(embed, authorId, post)
        } else if (AppBskyEmbedImages.isMain(embed)) {
            return this.hydrateImageEmbedView(
                embed,
                authorId
            )
        } else if (AppBskyEmbedExternal.isMain(embed)) {
            return this.hydrateExternalEmbedView( embed, authorId)
        }

        return post.embed
    }

    hydrateRecordWithMediaEmbedView(embed: $Typed<AppBskyEmbedRecordWithMedia.Main>, authorId: string, postView?: AppBskyFeedDefs.PostView): $Typed<ArCabildoabiertoEmbedRecordWithMedia.View> | null {
        const uri = embed.record.record.uri
        const record = this.hydrateRecordEmbedViewFromUri(uri)

        let media: ArCabildoabiertoEmbedRecordWithMedia.View["media"]

        if(AppBskyEmbedImages.isMain(embed.media)){
            media = this.hydrateImageEmbedView(embed.media, authorId)
        } else if(AppBskyEmbedVideo.isMain(embed.media)) {
            if(postView && AppBskyEmbedRecordWithMedia.isView(postView.embed)) {
                media = postView.embed.media
            } else {
                this.ctx.logger.pino.error("video embed hydration not implemented")
                return null
            }
        } else if(AppBskyEmbedExternal.isMain(embed.media)) {
            media = this.hydrateExternalEmbedView(embed.media, authorId)
        } else {
            this.ctx.logger.pino.error({embed}, "hydration not implemented for media")
            return null
        }

        return {
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
    }


    hydrateRecordEmbedViewFromUri(uri: string): $Typed<ArCabildoabiertoEmbedRecord.View> | null {
        const collection = getCollectionFromUri(uri)

        if (isArticle(collection)) {
            const artView = hydrateArticleView(this.ctx, uri, this.dataplane)
            if (artView.data) {
                return {
                    $type: "ar.cabildoabierto.embed.record#view",
                    record: {
                        ...artView.data,
                        value: artView.data.record,
                        $type: "ar.cabildoabierto.embed.record#viewArticleRecord"
                    }
                }
            }
        } else if (isPost(collection)) {
            const post = new PostViewHydrator(this.ctx, this.dataplane)
                .hydrate(uri)
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
            this.ctx.logger.pino.warn({collection}, `hydration not implemented for collection`)
        }
        return null
    }


    hydrateRecordEmbedView(embed: $Typed<AppBskyEmbedRecord.Main>): $Typed<ArCabildoabiertoEmbedRecord.View> | null {
        const uri = embed.record.uri
        return this.hydrateRecordEmbedViewFromUri(uri)
    }

    hydrateVisualizationEmbedView(embed: ArCabildoabiertoEmbedVisualization.Main): $Typed<ArCabildoabiertoEmbedVisualization.View> | null {
        if (ArCabildoabiertoEmbedVisualization.isDatasetDataSource(embed.dataSource)) {
            const datasetUri = embed.dataSource.dataset
            const dataset = hydrateDatasetView(
                this.ctx,
                datasetUri,
                this.dataplane
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
            const dataset = hydrateTopicsDatasetView(
                this.ctx,
                filters,
                this.dataplane
            )
            if (dataset) {
                return {
                    visualization: embed,
                    dataset,
                    $type: "ar.cabildoabierto.embed.visualization#view",
                }
            }
        } else {
            this.ctx.logger.pino.warn({embed}, "no se pudo hidratar la visualización")

        }
        return null
    }

    hydrateSelectionQuoteEmbedView(embed: ArCabildoabiertoEmbedSelectionQuote.Main, quotedContent: string): $Typed<ArCabildoabiertoEmbedSelectionQuote.View> | null {
        const caData = this.dataplane.caContents?.get(quotedContent)

        if (caData) {
            const authorId = getDidFromUri(caData.uri)
            const author = hydrateProfileViewBasic(this.ctx, authorId, this.dataplane)
            if (!author) {
                this.ctx.logger.pino.warn({authorId}, "couldn't find author of quoted content")
                return null
            }

            const record = caData.record ? JSON.parse(caData.record) as ArCabildoabiertoFeedArticle.Record | ArCabildoabiertoWikiTopicVersion.Record : null

            let text: string | null = null
            let format: string | null = null
            if (caData.text != null) {
                text = caData.text
                format = caData.dbFormat ?? null
            } else if (caData.textBlobId) {
                text = this.dataplane.getFetchedBlob({cid: caData.textBlobId, authorId})
                format = record?.format ?? null
            }
            if (text == null) {
                this.ctx.logger.pino.warn({embed, quotedContent}, "couldn't find text of quoted content")
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
                this.ctx.logger.pino.warn({embed, quotedContent}, "couldn't find title of quoted content")
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
            this.ctx.logger.pino.warn({embed, quotedContent}, "data unavailable for selection quote embed hydration")
            return null
        }
    }

    hydrateImageEmbedView(embed: AppBskyEmbedImages.Main, authorId: string): $Typed<AppBskyEmbedImages.View> {
        const images = embed.images

        return {
            $type: "app.bsky.embed.images#view",
            images: images
                .map(i => this.hydrateImageInImagesEmbed(authorId, i))
                .filter(i => i != null)
        }
    }

    hydrateExternalEmbedView(embed: AppBskyEmbedExternal.Main, authorId: string): $Typed<AppBskyEmbedExternal.View> {
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

    hydrateImageInImagesEmbed(authorId: string, i: AppBskyEmbedImages.Image): AppBskyEmbedImages.ViewImage | null {
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
}