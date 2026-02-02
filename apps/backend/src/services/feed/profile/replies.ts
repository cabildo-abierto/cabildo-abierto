import {GetSkeletonProps} from "#/services/feed/feed.js";
import {SessionAgent} from "#/utils/session-agent.js";
import {FeedSkeletonWithDate, getSkeletonFromTimeline} from "#/services/feed/inicio/following.js";
import {DataPlane, FetchFromBskyError} from "#/services/hydration/dataplane.js";
import {getMainProfileFeedSkeletonCA} from "#/services/feed/profile/main.js";
import {AppContext} from "#/setup.js";
import {Effect} from "effect";


const getRepliesProfileFeedSkeletonBsky = (
    ctx: AppContext,
    agent: SessionAgent,
    did: string,
    cursor?: string
): Effect.Effect<{skeleton: FeedSkeletonWithDate, cursor?: string}, FetchFromBskyError, DataPlane> => Effect.gen(function* () {
    const res = yield* Effect.tryPromise({
        try: () => agent.bsky.app.bsky.feed.getAuthorFeed({actor: did, filter: "posts_with_replies", cursor, limit: 25}),
        catch: () => new FetchFromBskyError()
    })
    const feed = res.data.feed
    const data = yield* DataPlane
    data.storeFeedViewPosts(feed)

    return {
        skeleton: getSkeletonFromTimeline(ctx, feed),
        cursor: res.data.cursor
    }
})


export const getRepliesProfileFeedSkeleton = (did: string) : GetSkeletonProps => {
    return (ctx, agent, cursor) => Effect.gen(function* () {
        if(!agent.hasSession()) return {skeleton: [], cursor: undefined}

        let [bskySkeleton, CASkeleton] = yield* Effect.all([
            getRepliesProfileFeedSkeletonBsky(ctx, agent, did, cursor),
            getMainProfileFeedSkeletonCA(ctx, did, cursor)
        ], {concurrency: "unbounded"})

        if(bskySkeleton.cursor != undefined){
            const newCursorDate = new Date(bskySkeleton.cursor)
            CASkeleton = CASkeleton.filter(x => new Date(x.created_at) >= newCursorDate)
        }

        const skeleton = [
            ...bskySkeleton.skeleton,
            ...CASkeleton
        ]

        return {
            skeleton: skeleton,
            cursor: bskySkeleton.skeleton.length > 0 ? bskySkeleton.cursor : undefined
        }
    })
}
