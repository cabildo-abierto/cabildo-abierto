import { revalidateTag } from "next/cache"


export const revalidateEverythingTime = 5


export function revalidateReferences(references: {id: string}[]){
    references.forEach(({id}) => {
        revalidateTag("entity:"+id)
    })
}

export function processReactions(did: string, reactions: {record: {authorId: string, collection: string, uri: string}}[]){
    let likeCount = 0
    let repostCount = 0
    let like = undefined
    let repost = undefined
    reactions.forEach((r) => {
        likeCount += r.record.collection == "app.bsky.feed.like" ? 1 : 0
        repostCount += r.record.collection == "app.bsky.feed.repost" ? 1 : 0
        if(r.record.authorId == did){
            if(r.record.collection == "app.bsky.feed.like") like = r.record.uri
            else if(r.record.collection == "app.bsky.feed.repost") repost = r.record.uri
        }
    })
    return {like, repost, likeCount, repostCount}
}


export function addCounters(did: string, elem: any, reactions: {record: {authorId: string, collection: string, uri: string}}[]): any {
    const {like, repost, likeCount, repostCount} = processReactions(did, reactions)

    return {
        ...elem,
        viewer: {like, repost},
        likeCount,
        replyCount: elem._count.replies,
        repostCount
    }
}


export const recordQuery = {
    uri: true,
    cid: true,
    rkey: true,
    collection: true,
    createdAt: true,
    author: {
        select: {
            did: true,
            handle: true,
            displayName: true,
            avatar: true
        }
    }
}