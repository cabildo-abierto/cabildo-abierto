import {FeedPipelineProps, getFeed, GetSkeletonProps} from "#/services/feed/feed.js";
import {min} from "@cabildo-abierto/utils";
import {CAHandler} from "#/utils/handler.js";

const getAllCAFeedPipeline: GetSkeletonProps = async (ctx, agent, data, cursor) => {
    if (!agent.hasSession()) {
        throw Error("Sin sesión")
    }

    let dateSince = new Date()
    let firstFetchDate = new Date()
    if (cursor) {
        const s = cursor.split("::")
        if (s.length == 2) {
            dateSince = new Date(s[1])
            firstFetchDate = new Date(s[0])
        } else {
            throw Error("Cursor inválido")
        }
    }


    const t1 = Date.now()
    const skeleton = await ctx.kysely
        .selectFrom("Content")
        .select(["uri", "created_at_tz"])
        .where("Content.created_at_tz", "<", firstFetchDate)
        .where("Content.created_at_tz", "<", dateSince)
        .orderBy("Content.created_at_tz", "desc")
        .distinct()
        .limit(25)
        .execute()

    const t2 = Date.now()

    ctx.logger.logTimes("discover feed skeleton", [t1, t2])

    const newDateSince = min(skeleton, x => x.created_at_tz?.getTime() ?? 0)?.created_at_tz

    const newCursor = newDateSince ? [
        newDateSince.toISOString(),
        firstFetchDate.toISOString()
    ].join("::") : undefined

    return {
        skeleton: skeleton.map(u => ({post: u.uri})),
        cursor: newCursor
    }
}

export const allCAFeedPipeline: FeedPipelineProps = {
    getSkeleton: getAllCAFeedPipeline,
    sortKey: (a) => [0]
}


export const getAllCAFeed: CAHandler<{query: {cursor?: string}}, {}> = async (ctx, agent, {query}) => {
    return getFeed({ctx, agent, pipeline: allCAFeedPipeline, cursor: query?.cursor})
}