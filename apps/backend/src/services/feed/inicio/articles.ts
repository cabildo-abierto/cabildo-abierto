import {FeedPipelineProps, GetSkeletonProps} from "#/services/feed/feed.js";
import {rootCreationDateSortKey} from "#/services/feed/utils.js";

const getArticlesFeedSkeleton: GetSkeletonProps = async (ctx, agent) => {
    const skeleton = await ctx.kysely
        .selectFrom("Article")
        .innerJoin("Record", "Record.uri", "Article.uri")
        .select(["Record.uri"])
        .orderBy("Record.created_at_tz", "desc")
        .execute()

    return {
        skeleton: skeleton.map(e => ({post: e.uri})),
        cursor: undefined
    }
}

export const articlesFeedPipeline: FeedPipelineProps = {
    getSkeleton: getArticlesFeedSkeleton,
    sortKey: rootCreationDateSortKey
}