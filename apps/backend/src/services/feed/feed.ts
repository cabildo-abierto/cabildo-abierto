import {ArCabildoabiertoFeedDefs, GetFeedOutput} from "@cabildo-abierto/api"
import {getFollowingFeedPipeline} from "#/services/feed/inicio/following.js";
import {Agent} from "#/utils/session-agent.js";
import {hydrateFeed} from "#/services/hydration/hydrate.js";
import {listOrderDesc, sortByKey} from "@cabildo-abierto/utils";
import {AppContext} from "#/setup.js";
import {
    EnDiscusionMetric,
    EnDiscusionTime,
    FeedFormatOption,
    getEnDiscusionFeedPipeline
} from "#/services/feed/inicio/discusion.js";
import {discoverFeedPipeline, InvalidCursorError, SessionRequiredError} from "#/services/feed/discover/discover.js";
import {EffHandlerNoAuth} from "#/utils/handler.js";
import {DataPlane, makeDataPlane, FetchFromBskyError} from "#/services/hydration/dataplane.js";
import {articlesFeedPipeline} from "#/services/feed/inicio/articles.js";
import * as Effect from "effect/Effect";
import {pipe} from "effect";
import {maybeClearFollows} from "#/services/user/follows.js";
import {DBSelectError} from "#/utils/errors.js";


export type FollowingFeedFilter = "Todos" | "Solo Cabildo Abierto"


export const getFeedByKind: EffHandlerNoAuth<{params: {kind: string}, query: {cursor?: string, metric?: EnDiscusionMetric, time?: EnDiscusionTime, format?: FeedFormatOption, filter?: FollowingFeedFilter}}, GetFeedOutput<ArCabildoabiertoFeedDefs.FeedViewContent>> = (ctx, agent, {params, query}) => {
    const {kind} = params
    const {cursor, metric, time, filter, format} = query

    return pipe(
        kind == "siguiendo" && agent.hasSession() ? maybeClearFollows(ctx, agent) : Effect.void,
        Effect.flatMap(() => {
            return Effect.tryPromise({
                try: async () => {
                    if (kind == "discusion") {
                        return getEnDiscusionFeedPipeline(metric, time, format)
                    } else if (kind == "siguiendo") {
                        return getFollowingFeedPipeline(filter, format)
                    } else if (kind == "descubrir") {
                        return discoverFeedPipeline
                    } else if (kind == "articulos") {
                        return articlesFeedPipeline
                    } else {
                        throw Error(`Invalid feed kind: ${kind}`)
                    }
                },
                catch: () => {
                    return "No se encontró el muro"
                }
            })
        }),
        Effect.flatMap(pipeline => {
            return getFeed({ctx, agent, pipeline, cursor})
        }),
        Effect.catchAll(error => {
            return typeof error == "string" ?
                Effect.fail(error) :
                Effect.fail("Ocurrió un error al cargar el muro.")
        })
    )
}


export type GetSkeletonError = DBSelectError | FetchFromBskyError | InvalidCursorError | SessionRequiredError


export type FeedSkeleton = ArCabildoabiertoFeedDefs.SkeletonFeedPost[]


export type GetSkeletonOutput = {skeleton: FeedSkeleton, cursor: string | undefined}
export type GetSkeletonProps = (ctx: AppContext, agent: Agent, cursor?: string) => Effect.Effect<GetSkeletonOutput, GetSkeletonError, DataPlane>
export type FeedSortKey = ((a: ArCabildoabiertoFeedDefs.FeedViewContent) => number[]) | null

export type FeedPipelineProps = {
    getSkeleton: GetSkeletonProps
    sortKey?: FeedSortKey
    filter?: (ctx: AppContext, feed: ArCabildoabiertoFeedDefs.FeedViewContent[]) => ArCabildoabiertoFeedDefs.FeedViewContent[]
    debugName?: string
}


export type GetFeedProps = {
    pipeline: FeedPipelineProps
    agent: Agent
    ctx: AppContext
    cursor?: string
    params?: { metric?: string, time?: string }
}

type GetFeedError = GetSkeletonError | DBSelectError | FetchFromBskyError

export const getFeed = ({ctx, agent, pipeline, cursor}: GetFeedProps): Effect.Effect<GetFeedOutput<ArCabildoabiertoFeedDefs.FeedViewContent>, GetFeedError> => {
    return Effect.provideServiceEffect(
        Effect.gen(function* () {
            const skRes = yield* pipeline.getSkeleton(ctx, agent, cursor)
            const skeleton = skRes.skeleton
            const feed = yield* hydrateFeed(ctx, agent, skeleton)
            const sortedFeed = pipeline.sortKey ? sortByKey(feed, pipeline.sortKey, listOrderDesc) : feed
            const filteredFeed = pipeline.filter ? pipeline.filter(ctx, sortedFeed) : sortedFeed
            return {
                feed: filteredFeed,
                cursor: skRes.cursor
            }
        }).pipe(Effect.withSpan("getFeed", {attributes: {cursor, name: pipeline.debugName}})),
        DataPlane,
        makeDataPlane(ctx, agent)
    )
}