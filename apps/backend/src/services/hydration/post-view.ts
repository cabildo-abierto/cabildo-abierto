import {$Typed} from "@atproto/api";
import {getDidFromUri} from "@cabildo-abierto/utils";
import {hydrateProfileViewBasic} from "#/services/hydration/profile.js";
import {ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api"
import {dbLabelsToLabelsView, hydrateViewer} from "#/services/hydration/hydrate.js";
import {EmbedHydrator} from "#/services/hydration/embed.js";
import {Hydrator} from "#/services/hydration/hydrator.js";


export class PostViewHydrator extends Hydrator<string, $Typed<ArCabildoabiertoFeedDefs.PostView>> {
    hydrate(uri: string): $Typed<ArCabildoabiertoFeedDefs.PostView> | null {
        const post = this.dataplane.bskyPosts?.get(uri)
        const caData = this.dataplane.caContents?.get(uri)

        if(!post && !caData) {
            this.ctx.logger.pino.warn({uri}, "sin datos para hidratar el post")
            return null
        }

        if (!post) {
            this.ctx.logger.pino.warn({uri}, "no se encontró el post en bsky")
        }

        const embedView = new EmbedHydrator(this.ctx, this.dataplane)
            .hydrate(uri)

        const authorId = getDidFromUri(uri)
        const author = hydrateProfileViewBasic(this.ctx, authorId, this.dataplane)
        if (!author) {
            this.ctx.logger.pino.warn({uri}, "Warning: No se encontraron los datos del autor")
            return null
        }

        const viewer = hydrateViewer(uri, this.dataplane)

        const rootCreationDate = this.dataplane.rootCreationDates?.get(uri)

        return {
            ...post,
            uri,
            cid: (caData?.cid ?? post?.cid)!,
            indexedAt: (post?.indexedAt ?? caData?.created_at.toISOString())!, // TO DO: Usar indexed at
            record: (caData?.record ? JSON.parse(caData.record) : post?.record)!,
            author,
            labels: dbLabelsToLabelsView(caData?.selfLabels ?? [], uri),
            $type: "ar.cabildoabierto.feed.defs#postView",
            embed: embedView ?? undefined,
            ...(caData ? {
                text: caData.text,
                likeCount: caData.uniqueLikesCount,
                repostCount: caData.uniqueRepostsCount,
                quoteCount: caData.quotesCount
            } : {
                likeCount: 0,
                repostCount: 0,
                quoteCount: 0
            }),
            bskyLikeCount: post?.likeCount,
            bskyRepostCount: post?.repostCount,
            bskyQuoteCount: post?.quoteCount,
            replyCount: post?.replyCount ?? caData?.repliesCount, // TO DO: Mostrar solo replies de CA por defecto
            rootCreationDate: rootCreationDate?.toISOString(),
            editedAt: caData?.editedAt?.toISOString(),
            viewer
        }
    }
}