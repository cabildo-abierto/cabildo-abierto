import {ATProtoStrongRef, EngagementProps, FastPostProps, FeedContentProps} from "../../app/lib/definitions";
import {BlockedPost, FeedViewPost, NotFoundPost, PostView} from "@atproto/api/src/client/types/app/bsky/feed/defs";
import {getRkeyFromUri, newestFirst} from "../../components/utils";
import {addCounters} from "../utils";


function formatBskyFeedElement(e: FeedViewPost): FeedContentProps {
    const record = e.post.record as {text: string, createdAt: string, $type: string, embed?: string, facets?: any, reply?: {parent: ATProtoStrongRef, root?: ATProtoStrongRef}}
    const replyTo = e.reply && e.reply.parent ? formatBskyPostViewAsFeedElement(e.reply.parent) : (record.reply ? record.reply.parent : undefined)
    const root = e.reply && e.reply.root ? formatBskyPostViewAsFeedElement(e.reply.root) : (record.reply && record.reply.root ? record.reply.root : replyTo)
    const grandparentAuthor = e.reply ? e.reply.grandparentAuthor : undefined

    const recordProps = {
        uri: e.post.uri,
        cid: e.post.cid,
        collection: record.$type,
        createdAt: new Date(record.createdAt),
        rkey: getRkeyFromUri(e.post.uri),
        author: {
            did: e.post.author.did,
            handle: e.post.author.handle,
            displayName: e.post.author.displayName,
            avatar: e.post.author.avatar
        }
    }

    const content = {
        text: record.text,
        post: {
            replyTo: {...replyTo, uri: replyTo.uri},
            root: {...root, uri: root.uri},
            grandparentAuthor,
            facets: record.facets ? JSON.stringify(record.facets) : undefined,
            embed: record.embed ? JSON.stringify(record.embed) : undefined
        }
    }

    const engagementProps = {
        likeCount: e.post.likeCount,
        repostCount: e.post.repostCount,
        replyCount: e.post.replyCount,
        viewer: e.post.viewer
    }

    const post: FastPostProps = {
        ...recordProps,
        content: content,
        ...engagementProps
    }

    if(e.reason && e.reason.$type == "app.bsky.feed.defs#reasonRepost"){
        return {
            ...post,
            reason: {
                createdAt: new Date(e.reason.indexedAt as string),
                collection: "app.bsky.feed.repost",
                by: e.reason.by as {did: string, handle: string, displayName?: string}
            }
        }
    } else {
        return post
    }
}



function formatBskyPostViewAsFeedElement(e: PostView | NotFoundPost | BlockedPost | {[p: string]: unknown, $type: string}): {blocked?: boolean, notFound?: boolean} & FeedContentProps {
    if(e.notFound) return {notFound: true, collection: "", author: {did: "", handle: ""}}
    if(e.blocked) return {blocked: true, collection: "", author: {did: "", handle: ""}}

    let post = e as PostView
    const record = post.record as {text: string, createdAt: string, facets: any, embed: any, $type: string, reply?: {parent: ATProtoStrongRef, root?: ATProtoStrongRef}}
    const caPost: FastPostProps & EngagementProps = {
        uri: post.uri,
        cid: post.cid,
        author: {
            ...post.author,
        },
        collection: record.$type,
        createdAt: new Date(record.createdAt),
        content: {
            text: record.text,
            post: {
                facets: JSON.stringify(record.facets),
                embed: JSON.stringify(record.embed),
                replyTo: record.reply ? record.reply.parent : undefined,
                root: record.reply && record.reply.root ? record.reply.root : undefined
            }
        },
        ...post
    }
    return caPost
}


export function joinCAandATFeeds(feedCA: FeedContentProps[], feedAT: FeedViewPost[]){

    const feedATProcessed = feedAT.map((e) => (formatBskyFeedElement(e)))

    const feed = [...feedATProcessed]

    for(let i = 0; i < feedCA.length; i++){
        if(!feed.some((e) => (e.uri == feedCA[i].uri))){
            feed.push(feedCA[i])
        }
    }
    return feed.sort(newestFirst)
}


export function addReasonToRepost(r: FeedContentProps, following: string[]): FeedContentProps {
    for(let i = 0; i < r.reactions.length; i++){
        if(following.includes(r.reactions[i].record.author.did)){
            return {
                ...r,
                reason: {
                    collection: "app.bsky.feed.repost",
                    by: r.reactions[i].record.author,
                    createdAt: r.reactions[i].record.createdAt
                }
            }
        }
    }
    return r
}


export function addCountersToFeed(feed: any[], did: string): FeedContentProps[]{
    return feed.map((elem) => {
        return addCounters(did, elem)
    })
}