import {GetSkeletonProps} from "#/services/feed/feed.js";
import {min} from "@cabildo-abierto/utils";
import {DBSelectError} from "#/utils/errors.js";
import {Effect} from "effect";



export const getEditsProfileFeedSkeleton = (did: string) : GetSkeletonProps => {
    return (ctx, agent, cursor) => {
        const cursor_ts = cursor ? new Date(cursor) : new Date()

        return Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("Record")
                .select(["uri", "createdAt"])
                .where("collection", "=", "ar.cabildoabierto.wiki.topicVersion")
                .where("authorId", "=", did)
                .where("Record.createdAt", "<", cursor_ts)
                .limit(25)
                .execute(),
            catch: (error) => new DBSelectError(error)
        }).pipe(Effect.map(skeleton => {
            return {
                skeleton: skeleton.map(r => ({post: r.uri})),
                cursor: min(skeleton, e => e.createdAt?.getTime() ?? Date.now())?.createdAt?.toISOString()
            }
        }))
    }
}