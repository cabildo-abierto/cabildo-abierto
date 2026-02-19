import {GetSkeletonProps} from "#/services/feed/feed.js";
import {AppContext} from "#/setup.js";
import {Agent} from "#/utils/session-agent.js";
import {FeedSkeletonWithDate, getSkeletonFromTimeline} from "#/services/feed/inicio/following.js";
import {DataPlane, FetchFromBskyError} from "#/services/hydration/dataplane.js";
import {mergeSort} from "@cabildo-abierto/utils";
import {Effect} from "effect";
import {DBSelectError} from "#/utils/errors.js";


const getMainProfileFeedSkeletonBsky = (
    ctx: AppContext,
    agent: Agent,
    did: string,
    cursor?: string
): Effect.Effect<{skeleton: {post: string, created_at: Date}[], cursor?: string}, FetchFromBskyError, DataPlane> => Effect.gen(function* () {
    const res = yield* Effect.tryPromise({
        try: () => agent.bsky.app.bsky.feed.getAuthorFeed({actor: did, filter: "posts_and_author_threads", cursor, limit: 25}),
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


export const getMainProfileFeedSkeletonCA = (
    ctx: AppContext,
    did: string,
    cursor?: string
): Effect.Effect<FeedSkeletonWithDate, DBSelectError> => {
    return Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("Record")
            .select(["uri", "created_at_tz as created_at"])
            .where("authorId", "=", did)
            .where("collection", "=", "ar.cabildoabierto.feed.article")
            .$if(cursor != null, qb => qb.where("created_at", "<", new Date(cursor!)))
            .limit(25)
            .execute(),
        catch: () => new DBSelectError()
    }).pipe(Effect.map(sk => {
        return sk
            .map(({uri, created_at}) => {
                if(created_at) {
                    return {post: uri, created_at}
                } else {
                    return null
                }
            })
            .filter(x => x != null)
    }))
}


export const getMainProfileFeedSkeleton = (did: string) : GetSkeletonProps => {
    return (ctx, agent, cursor) => Effect.gen(function* () {

        let [bskySkeleton, CASkeleton] = yield* Effect.all([
            getMainProfileFeedSkeletonBsky(ctx, agent, did, cursor),
            getMainProfileFeedSkeletonCA(ctx, did, cursor)
        ], {concurrency: "unbounded"})

        if(bskySkeleton.cursor != undefined){
            const newCursorDate = new Date(bskySkeleton.cursor)
            CASkeleton = CASkeleton.filter(x => new Date(x.created_at) >= newCursorDate)
        }

        const skeleton = mergeSort(bskySkeleton.skeleton, CASkeleton, e => e.created_at.getTime(), (a, b) => b-a)

        return {
            skeleton,
            cursor: bskySkeleton.skeleton.length > 0 ? bskySkeleton.cursor : undefined
        }
    })
}
