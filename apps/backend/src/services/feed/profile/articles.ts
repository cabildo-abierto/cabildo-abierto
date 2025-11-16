import {GetSkeletonProps} from "#/services/feed/feed.js";


export const getArticlesProfileFeedSkeleton = (did: string) : GetSkeletonProps => {
    return async (ctx, agent, data, cursor) => {

        const skeleton = await ctx.kysely
            .selectFrom("Record")
            .select(["uri", "created_at"])
            .where("collection", "=", "ar.cabildoabierto.feed.article")
            .where("authorId", "=", did)
            .$if(cursor != null, qb => qb.where("created_at", "<=", new Date(cursor!)))
            .execute()

        return {
            skeleton: skeleton.map(({uri, created_at}) => ({post: uri, created_at})),
            cursor: undefined
        }
    }
}
