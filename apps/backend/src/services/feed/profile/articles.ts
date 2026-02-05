import {GetSkeletonProps} from "#/services/feed/feed.js";
import {Effect} from "effect";
import {DBSelectError} from "#/utils/errors.js";


export const getArticlesProfileFeedSkeleton = (did: string) : GetSkeletonProps => {
    return (ctx, agent, cursor) => {

        return Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("Record")
                .select(["uri", "created_at"])
                .where("collection", "=", "ar.cabildoabierto.feed.article")
                .where("authorId", "=", did)
                .$if(cursor != null, qb => qb.where("created_at", "<=", new Date(cursor!)))
                .execute(),
            catch: () => new DBSelectError()
        }).pipe(Effect.map(skeleton => {
            return {
                skeleton: skeleton.map(({uri, created_at}) => ({post: uri, created_at})),
                cursor: undefined
            }
        }))
    }
}
