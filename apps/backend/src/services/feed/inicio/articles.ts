import {FeedPipelineProps, GetSkeletonProps} from "#/services/feed/feed.js";
import {rootCreationDateSortKey} from "#/services/feed/utils.js";
import {DBError} from "#/services/write/article.js";
import {Effect} from "effect";

const getArticlesFeedSkeleton: GetSkeletonProps = (ctx, agent) => {
    return Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("Article")
            .innerJoin("Record", "Record.uri", "Article.uri")
            .select(["Record.uri"])
            .orderBy("Record.created_at_tz", "desc")
            .execute(),
        catch: () => new DBError()
    }).pipe(
        Effect.map(skeleton => {
            return {
                skeleton: skeleton.map(e => ({post: e.uri})),
                cursor: undefined
            }
        })
    )
}

export const articlesFeedPipeline: FeedPipelineProps = {
    getSkeleton: getArticlesFeedSkeleton,
    sortKey: rootCreationDateSortKey
}