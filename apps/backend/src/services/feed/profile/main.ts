import {GetSkeletonProps} from "#/services/feed/feed.js";
import {AppContext} from "#/setup.js";
import {Agent} from "#/utils/session-agent.js";
import {FeedSkeletonWithDate, getSkeletonFromTimeline} from "#/services/feed/inicio/following.js";
import {Dataplane} from "#/services/hydration/dataplane.js";
import {mergeSort, sortByKey} from "@cabildo-abierto/utils";


const getMainProfileFeedSkeletonBsky = async (ctx: AppContext, agent: Agent, data: Dataplane, did: string, cursor?: string): Promise<{skeleton: {post: string, created_at: Date}[], cursor?: string}> => {
    const res = await agent.bsky.app.bsky.feed.getAuthorFeed({actor: did, filter: "posts_and_author_threads", cursor})
    const feed = res.data.feed
    data.storeFeedViewPosts(feed)

    return {
        skeleton: getSkeletonFromTimeline(ctx, feed),
        cursor: res.data.cursor
    }
}


export const getMainProfileFeedSkeletonCA = async (ctx: AppContext, did: string, cursor?: string): Promise<FeedSkeletonWithDate> => {
    const sk = await ctx.kysely
        .selectFrom("Record")
        .select(["uri", "created_at_tz as created_at"])
        .where("authorId", "=", did)
        .where("collection", "=", "ar.cabildoabierto.feed.article")
        .$if(cursor != null, qb => qb.where("created_at", "<", new Date(cursor!)))
        .execute()

    return sk
        .map(({uri, created_at}) => {
            if(created_at) {
                return {post: uri, created_at}
            } else {
                return null
            }
        })
        .filter(x => x != null)
}


export const getMainProfileFeedSkeleton = (did: string) : GetSkeletonProps => {
    return async (ctx, agent, data, cursor) => {

        let [bskySkeleton, CASkeleton] = await Promise.all([
            getMainProfileFeedSkeletonBsky(ctx, agent, data, did, cursor),
            getMainProfileFeedSkeletonCA(ctx, did, cursor)
        ])

        if(bskySkeleton.cursor != undefined){
            const newCursorDate = new Date(bskySkeleton.cursor)
            CASkeleton = CASkeleton.filter(x => new Date(x.created_at) >= newCursorDate)
        }

        try {
            const skeleton = mergeSort(bskySkeleton.skeleton, CASkeleton, e => e.created_at.getTime(), (a, b) => b-a)

            return {
                skeleton,
                cursor: bskySkeleton.skeleton.length > 0 ? bskySkeleton.cursor : undefined
            }
        } catch (error) {
            ctx.logger.pino.error({error: error}, "error getting profile feed skeleton")
            throw error
        }
    }
}
