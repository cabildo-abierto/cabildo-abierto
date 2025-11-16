import {GetSkeletonProps} from "#/services/feed/feed.js";
import {sortByKey} from "@cabildo-abierto/utils";
import {SessionAgent} from "#/utils/session-agent.js";
import {FeedSkeletonWithDate, getSkeletonFromTimeline} from "#/services/feed/inicio/following.js";
import {Dataplane} from "#/services/hydration/dataplane.js";
import {getMainProfileFeedSkeletonCA} from "#/services/feed/profile/main.js";
import {AppContext} from "#/setup.js";


const getRepliesProfileFeedSkeletonBsky = async (ctx: AppContext, agent: SessionAgent, data: Dataplane, did: string, cursor?: string): Promise<{skeleton: FeedSkeletonWithDate, cursor?: string}> => {
    const res = await agent.bsky.app.bsky.feed.getAuthorFeed({actor: did, filter: "posts_with_replies", cursor})
    const feed = res.data.feed
    data.storeFeedViewPosts(feed)

    return {
        skeleton: getSkeletonFromTimeline(ctx, feed),
        cursor: res.data.cursor
    }
}


export const getRepliesProfileFeedSkeleton = (did: string) : GetSkeletonProps => {
    return async (ctx, agent, data, cursor) => {
        if(!agent.hasSession()) return {skeleton: [], cursor: undefined}

        let [bskySkeleton, CASkeleton] = await Promise.all([
            getRepliesProfileFeedSkeletonBsky(ctx, agent, data, did, cursor),
            getMainProfileFeedSkeletonCA(ctx, did, cursor)
        ])

        if(bskySkeleton.cursor != undefined){
            const newCursorDate = new Date(bskySkeleton.cursor)
            CASkeleton = CASkeleton.filter(x => new Date(x.created_at) >= newCursorDate)
        }

        const skeleton = sortByKey([
            ...bskySkeleton.skeleton,
            ...CASkeleton
        ], e => e.created_at.getTime(), (a, b) => b-a)

        return {
            skeleton: skeleton,
            cursor: bskySkeleton.skeleton.length > 0 ? bskySkeleton.cursor : undefined
        }
    }
}
