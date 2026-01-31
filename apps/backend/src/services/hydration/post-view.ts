import {$Typed} from "@atproto/api";
import {getDidFromUri} from "@cabildo-abierto/utils";
import {hydrateProfileViewBasic} from "#/services/hydration/profile.js";
import {ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api"
import {dbLabelsToLabelsView, hydrateViewer} from "#/services/hydration/hydrate.js";
import {DataPlane} from "#/services/hydration/dataplane.js";
import {Effect} from "effect";
import {hydrateEmbedView} from "#/services/hydration/embed.js";
import {AppContext} from "#/setup.js";
import {NoSessionAgent, SessionAgent} from "#/utils/session-agent.js";



export const hydratePostView = (ctx: AppContext, agent: SessionAgent | NoSessionAgent, uri: string): Effect.Effect<$Typed<ArCabildoabiertoFeedDefs.PostView> | null, never, DataPlane> => Effect.gen(function* () {
    const dataplane = yield* DataPlane
    const state = dataplane.getState()
    const post = state.bskyPosts?.get(uri)
    const caData = state.caContents?.get(uri)

    if(!post && !caData) {
        return null
    }

    const embedView = yield* hydrateEmbedView(ctx, agent,  uri)

    const authorId = getDidFromUri(uri)
    const author = yield* hydrateProfileViewBasic(ctx, authorId)
    if (!author) {
        return null
    }

    const viewer = yield* hydrateViewer(agent, uri)

    const rootCreationDate = state.rootCreationDates?.get(uri)

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
})