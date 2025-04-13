import {
    FeedContentProps,
    FeedEngagementProps, ReasonProps
} from "@/lib/definitions";
import {
    FeedViewPost,
    PostView,
    ReasonRepost
} from "@atproto/api/src/client/types/app/bsky/feed/defs";
import {addCounters} from "../utils";
import {FeedSkeleton, FeedSkeletonElement} from "@/server-actions/feed/profile/main";


export function addCountersToFeed(feed: any[], engagement: FeedEngagementProps): FeedContentProps[]{
    return feed.map((elem) => {
        return addCounters(elem, engagement)
    })
}


function getRootCreationDate(p: FeedContentProps){
    if(p.reason){
        return p.reason.createdAt
    } else if("content" in p && "post" in p.content && p.content.post != null){
        if(p.content.post.root && "createdAt" in p.content.post.root){
            return new Date(p.content.post.root.createdAt)
        } else if(p.content.post.replyTo && "createdAt" in p.content.post.replyTo){
            return new Date(p.content.post.replyTo.createdAt)
        }
    }
    return new Date(p.createdAt)
}


export const rootCreationDateSortKey = (a: FeedContentProps) => {
    return [getRootCreationDate(a).getTime()]
}


export function skeletonElementFromFeedViewPost(p: FeedViewPost): FeedSkeletonElement {
    let reason: ReasonProps
    if(p.reason && p.reason.$type == "app.bsky.feed.defs#reasonRepost"){
        const r = p.reason as ReasonRepost
        reason = {
            by: r.by,
            createdAt: new Date(r.indexedAt),
            collection: "app.bsky.feed.repost"
        }
    }

    if(p.reply && p.reply.root && p.reply.root.$type == "app.bsky.feed.defs#postView"){
        return {
            uri: (p.reply.root as PostView).uri,
            lastInThreadId: (p.post.uri),
            secondToLastInThreadId: (p.reply.parent as PostView).uri,
            reason
        }
    } else if(p.reply && p.reply.parent && p.reply.parent.$type == "app.bsky.feed.defs#postView"){
        return {
            uri: (p.reply.parent as PostView).uri,
            lastInThreadId: (p.post.uri),
            reason
        }
    } else {
        return {
            uri: p.post.uri,
            reason
        }
    }
}


export function removeRepeatedInSkeleton(s: FeedSkeleton): FeedSkeleton {
    const m = new Map<string, FeedSkeletonElement>()
    s.forEach(x => {
        if(!m.has(x.uri)){
            m.set(x.uri, x)
        } else {
            const y = m.get(x.uri)
            if(x.secondToLastInThreadId && !y.secondToLastInThreadId){
                m.set(x.uri, x)
            } else if(x.lastInThreadId && !y.lastInThreadId){
                m.set(x.uri, x)
            }
        }
    })
    return Array.from(m.entries()).map(([uri, x]) => x)
}


export function filterTimeline(e: FeedViewPost){
    if(e.reply && e.reply.parent){
        if(e.reply.parent.$type == "app.bsky.feed.defs#notFoundPost"){
            return false
        }
    }
    if(e.reply && e.reply.root){
        if(e.reply.root.$type == "app.bsky.feed.defs#notFoundPost"){
            return false
        }
    }
    return true
}
