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
    let participants = new Set<string>()
    let viewers = new Set<string>()
    reactions.forEach((r) => {
        likeCount += r.record.collection == "app.bsky.feed.like" ? 1 : 0
        repostCount += r.record.collection == "app.bsky.feed.repost" ? 1 : 0
        if(r.record.authorId == did){
            if(r.record.collection == "app.bsky.feed.like") like = r.record.uri
            else if(r.record.collection == "app.bsky.feed.repost") repost = r.record.uri
        }
    })
    return {like, repost, likeCount, repostCount, uniqueViewsCount: viewers.size, participantsCount: participants.size}
}


export function addCounters(did: string, elem: any, reactions: {record: {authorId: string, collection: string, uri: string}}[]): any {
    const {like, repost, likeCount, repostCount} = processReactions(did, reactions)

    let participants = new Set<string>()
    let viewers = new Set<string>()
    for(let i = 0; i < elem.views.length; i++){
        const v = elem.views[i]
        viewers.add(v.userById)
    }
    for(let i = 0; i < elem.replies.length; i++){
        const r = elem.replies[i]
        participants.add(r.content.record.userById)
    }
    participants.delete(elem.author.did)
    viewers.delete(elem.author.did)

    return {
        ...elem,
        viewer: {like, repost},
        likeCount,
        replyCount: elem._count.replies,
        repostCount,
        participantsCount: participants.size,
        uniqueViewsCount: viewers.size,
    }
}


export const feedQuery = {
    cid: true,
    uri: true,
    collection: true,
    createdAt: true,
    author: {
        select: {
            did: true,
            handle: true,
            displayName: true,
            avatar: true
        }
    },
    content: {
        select: {
            text: true,
            article: {
                select: {
                    title: true,
                    format: true
                }
            },
            post: {
                select: {
                    facets: true,
                    embed: true,
                    replyTo: {
                        select: {
                            uri: true,
                            cid: true
                        }
                    },
                    root: {
                        select: {
                            uri: true,
                            cid: true
                        }
                    },
                    quote: true
                }
            }
        },
    },
    reactions: {
        select: {
            record: {
                select: {
                    uri: true,
                    collection: true,
                    authorId: true
                }
            }
        }
    },
    _count: {
        select: {
            replies: true,
        }
    },
    views: {
        select: {
            createdAt: true,
            userById: true
        }
    },
    replies: {
        select: {
            content: {
                select: {
                    record: {
                        select: {
                            createdAt: true,
                            authorId: true
                        }
                    }
                }
            }
        }
    }
}


export const feedQueryWithReposts = {
    ...feedQuery,
    reaction: {
        select: {
            reactsTo: {
                select: feedQuery
            }
        }
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