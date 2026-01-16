import {GetSkeletonProps} from "#/services/feed/feed.js";
import {min} from "@cabildo-abierto/utils";



export const getEditsProfileFeedSkeleton = (did: string) : GetSkeletonProps => {
    return async (ctx, agent, data, cursor) => {
        const cursor_ts = cursor ? new Date(cursor) : new Date()

        const skeleton = await ctx.kysely
            .selectFrom("Record")
            .select(["uri", "created_at_tz"])
            .where("collection", "=", "ar.cabildoabierto.wiki.topicVersion")
            .where("authorId", "=", did)
            .where("Record.created_at_tz", "<", cursor_ts)
            .limit(25)
            .execute()

        return {
            skeleton: skeleton.map(r => ({post: r.uri})),
            cursor: min(skeleton, e => e.created_at_tz?.getTime() ?? Date.now())?.created_at_tz?.toISOString()
        }
    }
}