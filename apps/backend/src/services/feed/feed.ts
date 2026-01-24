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
import {discoverFeedPipeline} from "#/services/feed/discover/discover.js";
import {CAHandlerNoAuth, CAHandlerOutput} from "#/utils/handler.js";
import {Dataplane} from "#/services/hydration/dataplane.js";
import {articlesFeedPipeline} from "#/services/feed/inicio/articles.js";
import {clearFollowsHandler, getProfile, getSessionData} from "#/services/user/users.js";
import {SpanStatusCode} from "@opentelemetry/api";


export type FollowingFeedFilter = "Todos" | "Solo Cabildo Abierto"


async function maybeClearFollows(ctx: AppContext, agent: Agent) {
    if(agent.hasSession()){
        const data = await getSessionData(ctx, agent.did)
        if(data && (!data.seenTutorial || !data.seenTutorial.home)){
            const {data: profile} = await getProfile(ctx, agent, {params: {handleOrDid: agent.did}})
            if(profile && profile.bskyFollowsCount == 1){
                await clearFollowsHandler(ctx, agent, {})
            }
        }
    }
}


export const getFeedByKind: CAHandlerNoAuth<{params: {kind: string}, query: {cursor?: string, metric?: EnDiscusionMetric, time?: EnDiscusionTime, format?: FeedFormatOption, filter?: FollowingFeedFilter}}, GetFeedOutput<ArCabildoabiertoFeedDefs.FeedViewContent>> = async (ctx, agent, {params, query}) => {
    const {kind} = params
    return await ctx.tracer.startActiveSpan(`getFeedByKind/${kind}`, async span => {
        let pipeline: FeedPipelineProps
        const {cursor, metric, time, filter, format} = query
        span.setAttributes({cursor, metric, time, filter, format, kind})
        if(kind == "discusion"){
            pipeline = getEnDiscusionFeedPipeline(metric, time, format)
        } else if(kind == "siguiendo"){
            await maybeClearFollows(ctx, agent)
            pipeline = getFollowingFeedPipeline(filter, format)
        } else if(kind == "descubrir") {
            pipeline = discoverFeedPipeline
        } else if(kind == "articulos") {
            pipeline = articlesFeedPipeline
        } else {
            const message = `Invalid feed kind: ${kind}`
            span.setStatus({code: SpanStatusCode.ERROR, message })
            span.end()
            return {error: message}
        }

        const res = await getFeed({ctx, agent, pipeline, cursor})

        span.end()
        return res
    })
}


export type FeedSkeleton = ArCabildoabiertoFeedDefs.SkeletonFeedPost[]


export type GetSkeletonOutput = {skeleton: FeedSkeleton, cursor: string | undefined}
export type GetSkeletonProps = (ctx: AppContext, agent: Agent, data: Dataplane, cursor?: string) => Promise<GetSkeletonOutput>
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

export const getFeed = async ({ctx, agent, pipeline, cursor}: GetFeedProps): CAHandlerOutput<GetFeedOutput<ArCabildoabiertoFeedDefs.FeedViewContent>> => {
    const data = new Dataplane(ctx, agent)

    let newCursor: string | undefined
    let skeleton: FeedSkeleton
    const {data: skeletonData, error: skeletonError} = await ctx.tracer.startActiveSpan("getSkeleton", async span => {
        span.setAttributes({cursor, pipeline: pipeline.debugName || "unknown"})

        try {
            const res = await pipeline.getSkeleton(ctx, agent, data, cursor)
            span.end()
            return {data: res}
        } catch {
            span.setStatus({code: SpanStatusCode.ERROR, message: "Ocurrió un error al obtener el esqueleto del feed"})
            span.end()
            return {error: "Ocurrió un error al obtener el muro."}
        }
    })
    if(skeletonError || !skeletonData) return {error: skeletonError}

    newCursor = skeletonData.cursor
    skeleton = skeletonData.skeleton

    let feed: ArCabildoabiertoFeedDefs.FeedViewContent[] = await ctx.tracer.startActiveSpan("hydrateFeed", async span => {
        const res = await hydrateFeed(ctx, skeleton, data)
        span.end()
        return res
    })

    if(pipeline.sortKey){
        feed = sortByKey(feed, pipeline.sortKey, listOrderDesc)
    }

    if(pipeline.filter){
        feed = pipeline.filter(ctx, feed)
    }

    return {data: {feed, cursor: newCursor}}
}