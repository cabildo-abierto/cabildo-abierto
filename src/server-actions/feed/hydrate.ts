"use server"
import {db} from "@/db";
import {ATProtoStrongRef, Collection, FastPostProps, FeedContentProps, PostCollection} from "@/lib/definitions";
import {reactionsQuery, recordQuery} from "../utils";
import {getCollectionFromUri, getRkeyFromUri, isPost} from "@/utils/uri";
import {FeedSkeleton, FeedSkeletonElement} from "@/server-actions/feed/profile/main";
import {getSessionAgent, getSessionDid} from "@/server-actions/auth";
import {PostView} from "@atproto/api/src/client/types/app/bsky/feed/defs";
import {addViewerEngagementToFeed} from "@/server-actions/feed/get-user-engagement";
import {AppBskyEmbedRecord} from "@atproto/api";
import {ViewRecord} from "@atproto/api/src/client/types/app/bsky/embed/record";


type FeedElementQueryResult = {
    uri: string
    cid: string
    rkey: string
    collection: Collection
    createdAt: Date
    author: {
        did: string
        handle: string
        displayName: string
        avatar: string
    }
    _count: {
        likes: number
        reposts: number
        replies: number
    }
    uniqueViewsCount: number
    content?: {
        text?: string
        textBlob?: {
            cid: string
        }
        format?: string
        post?: {
            quote?: string
            embed?: string
            facets?: string
            replyTo?: {
                uri: string
                cid: string
                author: {
                    did: string
                    handle?: string
                    displayName?: string
                }
            }
            root?: {
                uri: string
                cid: string
                author: {
                    did: string
                    handle?: string
                    displayName?: string
                }
            }
        }
        article?: {
            title: string
        }
    }
    enDiscusion?: {
        uri: string
    }

}


const hydrateFeedQuery = {
    ...recordQuery,
    ...reactionsQuery,
    enDiscusion: {
        select: {
            uri: true
        }
    },
    content: {
        select: {
            text: true,
            format: true,
            textBlob: true,
            article: {
                select: {
                    title: true
                }
            },
            post: {
                select: {
                    facets: true,
                    embed: true,
                    quote: true,
                    replyTo: {
                        select: {
                            uri: true,
                            cid: true,
                            author: {
                                select: {
                                    did: true,
                                    handle: true,
                                    displayName: true
                                }
                            }
                        }
                    },
                    root: {
                        select: {
                            uri: true,
                            cid: true,
                            author: {
                                select: {
                                    did: true,
                                    handle: true,
                                    displayName: true
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}


function joinPostViewAndCAData(uri: string, caMap: Map<string, FeedElementQueryResult>, bskyMap: Map<string, PostView>): FeedContentProps {
    if(!uri) return null
    const post = bskyMap.get(uri)
    const caData = caMap.get(uri)

    if(!post){
        if(!caData){
            console.log("couldn't find data for uri", uri)
            return null
        } else {
            return {
                ...caData,
                uniqueViewsCount: caData.uniqueViewsCount,
                likeCount: caData._count.likes,
                repostCount: caData._count.reposts,
                replyCount: caData._count.replies
            } as FeedContentProps
        }
    }

    const record = post.record as {text: string, createdAt: string, facets: any, embed: any, $type: PostCollection, reply?: {parent: ATProtoStrongRef, root?: ATProtoStrongRef}}

    if(record.embed && record.embed.$type == "app.bsky.embed.record"){
        record.embed = joinPostViewAndCAData(record.embed.record.uri, caMap, bskyMap)
    }

    return {
        uri: post.uri,
        cid: post.cid,
        rkey: getRkeyFromUri(post.uri),
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
        ...(caData ? {
            uniqueViewsCount: caData.uniqueViewsCount,
            likeCount: caData._count.likes,
            repostCount: caData._count.reposts,
        } : {
            uniqueViewsCount: 0,
            likeCount: 0,
            repostCount: 0
        }),
        likeCountBsky: post.likeCount,
        repostCountBsky: post.repostCount,
        quoteCountBsky: post.quoteCount,
        replyCount: post.replyCount
    }
}


function hydrateFeedElement(e: FeedSkeletonElement, caMap: Map<string, FeedElementQueryResult>, bskyMap: Map<string, PostView>): FeedContentProps | null {
    const reason = e.reason

    const root = joinPostViewAndCAData(e.uri, caMap, bskyMap)
    const last = joinPostViewAndCAData(e.lastInThreadId, caMap, bskyMap)
    const secondToLast = joinPostViewAndCAData(e.secondToLastInThreadId, caMap, bskyMap)

    if(!root){
        return null
    } else if(!last){
        return {...root, reason}
    } else if(!secondToLast) {
        if(last.collection == "app.bsky.feed.post" || last.collection == "ar.com.cabildoabierto.quotePost"){
            let r = {...last}
            r.content.post.replyTo = root
            return {...r, reason}
        } else {
            throw Error("Se intentó mostrar una respuesta que no es un post.")
        }
    } else {
        if(last.collection == "app.bsky.feed.post" || last.collection == "ar.com.cabildoabierto.quotePost"){
            let r = {...last}
            r.content.post.root = root
            r.content.post.replyTo = secondToLast
            return {...r, reason}
        } else {
            throw Error("Se intentó mostrar una respuesta que no es un post.")
        }
    }
}


export async function getBskyPosts(uris: string[]){
    const {agent} = await getSessionAgent()

    const postsList = uris.filter(uri => (getCollectionFromUri(uri) == "app.bsky.feed.post"))

    if(postsList.length == 0){
        return []
    } else {
        const batches: string[][] = []
        for(let i = 0; i < postsList.length; i+= 25){
            batches.push(postsList.slice(i, i + 25))
        }
        const results = await Promise.all(batches.map(b => agent.getPosts({uris: b})))
        return results.map(r => r.data.posts).reduce((acc, cur) => [...acc, ...cur])
    }
}


export async function getCAFeedContents(uris: string[]): Promise<FeedElementQueryResult[]> {
    const res = await db.record.findMany({
        select: {
            ...hydrateFeedQuery,
        },
        where: {
            uri: {
                in: uris
            }
        }
    })
    return res.map(x => ({
        ...x,
        collection: x.collection as Collection
    }))
}


function addEmbedsToPostsMap(m: Map<string, PostView>){
    const posts = Array.from(m.values())

    posts.forEach(post => {
        if(post.embed && post.embed.$type == "app.bsky.embed.record#view"){
            const embed = post.embed as AppBskyEmbedRecord.View
            if(embed.record.$type == "app.bsky.embed.record#viewRecord"){
                const record = embed.record as ViewRecord
                m.set(record.uri, {
                    ...record,
                    uri: record.uri,
                    cid: record.cid,
                    $type: "app.bsky.feed.defs#postView",
                    author: {
                        ...record.author
                    },
                    indexedAt: record.indexedAt,
                    record: record.value
                })
            }
        }
    })

    return m
}


export async function hydrateFeed(skeleton: FeedSkeleton){
    const urisList = skeleton.reduce((acc: string[], cur) => {
        return acc.concat([cur.uri, cur.lastInThreadId, cur.secondToLastInThreadId])
    }, []).filter(x => x != null)

    const [bskyPosts, caContents] = await Promise.all([getBskyPosts(urisList), getCAFeedContents(urisList)])

    let bskyPostsMap = new Map(bskyPosts.map(item => [item.uri, item]))
    bskyPostsMap = addEmbedsToPostsMap(bskyPostsMap)

    const caContentsMap = new Map(caContents.map(item => [item.uri, item]))

    const hydrated = skeleton.map((e) => (hydrateFeedElement(e, caContentsMap, bskyPostsMap))).filter(x => x != null)

    const did = await getSessionDid()
    return await addViewerEngagementToFeed(did, hydrated)
}