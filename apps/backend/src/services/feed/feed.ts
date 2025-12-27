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
    let pipeline: FeedPipelineProps
    
    const {kind} = params
    const {cursor, metric, time, filter, format} = query
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
        return {error: "Invalid feed kind:" + kind}
    }
    return getFeed({ctx, agent, pipeline, cursor})
}


export type FeedSkeleton = ArCabildoabiertoFeedDefs.SkeletonFeedPost[]


export type GetSkeletonOutput = {skeleton: FeedSkeleton, cursor: string | undefined}
export type GetSkeletonProps = (ctx: AppContext, agent: Agent, data: Dataplane, cursor?: string) => Promise<GetSkeletonOutput>
export type FeedSortKey = ((a: ArCabildoabiertoFeedDefs.FeedViewContent) => number[]) | null

export type FeedPipelineProps = {
    getSkeleton: GetSkeletonProps
    sortKey?: FeedSortKey
    filter?: (ctx: AppContext, feed: ArCabildoabiertoFeedDefs.FeedViewContent[]) => ArCabildoabiertoFeedDefs.FeedViewContent[]
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
    try {
        const res = await pipeline.getSkeleton(ctx, agent, data, cursor)
        newCursor = res.cursor
        skeleton = res.skeleton
    } catch (err) {
        ctx.logger.pino.error({error: err}, "Error getting feed skeleton")
        return {error: "Ocurrió un error al obtener el muro."}
    }

    let feed: ArCabildoabiertoFeedDefs.FeedViewContent[] = await hydrateFeed(ctx, skeleton, data)

    if(pipeline.sortKey){
        feed = sortByKey(feed, pipeline.sortKey, listOrderDesc)
    }

    if(pipeline.filter){
        feed = pipeline.filter(ctx, feed)
    }
    return {data: {feed, cursor: newCursor}}
}