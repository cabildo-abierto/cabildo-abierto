import {EffHandler} from "#/utils/handler.js";
import {getUri} from "@cabildo-abierto/utils";
import {DataPlane, FetchFromBskyError, makeDataPlane} from "#/services/hydration/dataplane.js";
import {hydrateFeedViewContent} from "#/services/hydration/hydrate.js";
import {getSkeletonFromTimeline} from "#/services/feed/inicio/following.js";
import {ArCabildoabiertoFeedDefs, GetFeedOutput} from "@cabildo-abierto/api";
import {Effect} from "effect";


export const getCustomFeed: EffHandler<
    {params: {did: string, rkey: string}, query?: {cursor?: string}},
    GetFeedOutput<ArCabildoabiertoFeedDefs.FeedViewContent>
> = (ctx, agent, {params, query}) => Effect.provideServiceEffect(Effect.gen(function* () {
    const dataplane = yield* DataPlane
    const uri = getUri(params.did, "app.bsky.feed.generator", params.rkey)

    const res = yield* Effect.tryPromise({
        try: () => agent.bsky.app.bsky.feed.getFeed({
            feed: uri,
            cursor: query?.cursor,
            limit: 25
        }),
        catch: () => new FetchFromBskyError()
    })

    if(res.success) {
        dataplane.storeFeedViewPosts(res.data.feed)

        const skeleton = getSkeletonFromTimeline(ctx, res.data.feed)

        yield* dataplane.fetchFeedHydrationData(skeleton)
        const feed = (yield* Effect.all(skeleton
            .map(e => hydrateFeedViewContent(ctx, agent, e))))
            .filter(x => x != null)

        return {
            feed,
            cursor: res.data.cursor
        }
    } else {
        return yield* Effect.fail("Ocurrió un error al obtener el muro.")
    }
}).pipe(
    Effect.catchTag("DBError", () => Effect.fail("Ocurrió un error al obtener el muro.")),
    Effect.catchTag("FetchFromBskyError", () => Effect.fail("Ocurrió un error al obtener el muro."))
), DataPlane, makeDataPlane(ctx, agent))