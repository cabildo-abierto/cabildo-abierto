import {CAHandler} from "#/utils/handler.js";
import {GetFeedOutput} from "#/services/feed/feed.js";
import {getUri} from "@cabildo-abierto/utils";
import {Dataplane} from "#/services/hydration/dataplane.js";
import {hydrateFeedViewContent} from "#/services/hydration/hydrate.js";
import {getSkeletonFromTimeline} from "#/services/feed/inicio/following.js";


export const getCustomFeed: CAHandler<{params: {did: string, rkey: string}, query?: {cursor?: string}}, GetFeedOutput> = async (ctx, agent, {params, query}) => {
    const uri = getUri(params.did, "app.bsky.feed.generator", params.rkey)

    const res = await agent.bsky.app.bsky.feed.getFeed({
        feed: uri,
        cursor: query?.cursor
    })

    if(res.success) {
        const dataplane = new Dataplane(ctx, agent)

        dataplane.storeFeedViewPosts(res.data.feed)

        const skeleton = getSkeletonFromTimeline(ctx, res.data.feed)

        await dataplane.fetchFeedHydrationData(skeleton)
        const feed = skeleton
            .map(e => hydrateFeedViewContent(ctx, e, dataplane))
            .filter(x => x != null)
        return {
            data: {
                feed,
                cursor: res.data.cursor
            }
        }
    } else {
        return {error: "Ocurrió un error al obtener el muro."}
    }
}