import {FeedPipelineProps, GetSkeletonProps} from "#/services/feed/feed.js";
import {min} from "@cabildo-abierto/utils";
import {Effect} from "effect";
import {DBError} from "#/services/write/article.js";

export class SessionRequiredError {
    readonly _tag = "SessionRequiredError"
}


export class InvalidCursorError {
    readonly _tag = "InvalidCursorError"
}


const getDiscoverFeedSkeleton: GetSkeletonProps = (ctx, agent, cursor) => Effect.gen(function* () {
    if (!agent.hasSession()) {
        return yield* Effect.fail(new SessionRequiredError())
    }

    const interests = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("UserInterest")
            .select(["UserInterest.topicCategoryId as id"])
            .where("UserInterest.userId", "=", agent.did)
            .execute(),
        catch: () => new DBError()
    })

    if(interests.length == 0) {
        return {
            skeleton: [],
            cursor: undefined
        }
    }

    let dateSince = new Date()
    let firstFetchDate = new Date()
    if (cursor) {
        const s = cursor.split("::")
        if (s.length == 2) {
            dateSince = new Date(s[1])
            firstFetchDate = new Date(s[0])
        } else {
            return yield* Effect.fail(new InvalidCursorError())
        }
    }

    const skeleton = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("DiscoverFeedIndex")
            .innerJoin("Content", "Content.uri", "DiscoverFeedIndex.contentId")
            .where("Content.caModeration", "=", "Ok")
            .select(["DiscoverFeedIndex.contentId", "DiscoverFeedIndex.created_at"])
            .where("DiscoverFeedIndex.created_at", "<", firstFetchDate)
            .where("DiscoverFeedIndex.created_at", "<", dateSince)
            .where("DiscoverFeedIndex.categoryId", "in", interests.map(i => i.id))
            .orderBy("DiscoverFeedIndex.created_at", "desc")
            .distinct()
            .limit(25)
            .execute(),
        catch: () => new DBError()
    })

    const newDateSince = min(skeleton, x => x.created_at?.getTime() ?? 0)?.created_at

    const newCursor = newDateSince ? [
        newDateSince.toISOString(),
        firstFetchDate.toISOString()
    ].join("::") : undefined

    return {
        skeleton: skeleton.map(u => ({post: u.contentId})),
        cursor: newCursor
    }
})

export const discoverFeedPipeline: FeedPipelineProps = {
    getSkeleton: getDiscoverFeedSkeleton,
    sortKey: (a) => [0],
    debugName: "discover"
}