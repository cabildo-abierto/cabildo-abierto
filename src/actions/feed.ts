'use server'

import { db } from "../db";
import {
    ATProtoStrongRef,
    EngagementProps,
    FastPostProps,
    FeedContentProps,
    FeedContentPropsNoRepost,
    RecordProps, RepostProps
} from "../app/lib/definitions";
import { getSessionAgent } from "./auth";
import { Agent } from "@atproto/api";
import {getUserId, getUsers} from "./users";
import {addCounters, feedQuery, feedQueryWithReposts} from "./utils";
import {popularityScore} from "../components/popularity-score";
import {getRkeyFromUri, listOrder} from "../components/utils";
import {FeedViewPost} from "@atproto/api/src/client/types/app/bsky/feed/defs";


function addCountersToFeed(feed: any[], did: string): FeedContentProps[]{
    return feed.map((elem) => {
        return addCounters(did, elem, elem.reactions)
    })
}


export async function getFeed({onlyFollowing, reposts=true}: {onlyFollowing: boolean, reposts?: boolean}): Promise<{feed?: FeedContentProps[], error?: string}>{
    try {
        const {agent, did} = await getSessionAgent()

        let authors = undefined
        if(onlyFollowing) {
            const {data: following} = await agent.getFollows({actor: did})
            authors = {
                in: [...following.follows.map(({did}) => (did)), did]
            }
        }

        const feed = await db.record.findMany({
            select: feedQueryWithReposts,
            where: {
                authorId: authors,
                OR: [
                    {
                        AND: [
                            {
                                content: {
                                    post: {
                                        replyToId: null
                                    }
                                }
                            },
                            {
                                collection: "app.bsky.feed.post"
                            }
                        ]
                    },
                    {
                        collection: {
                            in: ["ar.com.cabildoabierto.article", ...(reposts ? ["app.bsky.feed.repost"] : [])]
                        }
                    }
                ],
            },
            orderBy: {
                createdAt: "desc"
            }
        })


        const readyForFeed = addCountersToFeed(feed, did)

        // console.log("feed", feed.map((e) => (e.collection)))

        return {feed: readyForFeed}
    } catch (err) {
        console.log("Error getting feed", err)
        return {error: "Error al obtener el feed."}
    }
}


function formatBskyFeedElement(e: FeedViewPost): FeedContentProps {
    const record = e.post.record as {text: string, createdAt: string, $type: string, embed?: string}
    const replyTo = e.reply ? e.reply.parent as ATProtoStrongRef : undefined
    const root = e.reply && e.reply.root ? e.reply.root as ATProtoStrongRef : replyTo

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
            replyTo,
            root,
            embed: record.embed ? JSON.stringify(record.embed) : undefined
        }
    }

    const engagementProps = {
        likeCount: e.post.likeCount,
        repostCount: e.post.repostCount,
        replyCount: e.post.replyCount,
        viewer: e.post.viewer
    }

    const post = {
        ...recordProps,
        content,
        ...engagementProps
    }

    if(e.reason && e.reason.$type == "app.bsky.feed.defs#reasonRepost"){
        const repostRecordProps = {
            author: e.reason.by as {did: string, handle: string, displayName?: string},
            collection: "app.bsky.feed.repost",
        }

        return {
            ...repostRecordProps,
            reaction: {
                reactsTo: post
            }
        }
    } else {
        return post
    }

}


export async function getFollowingFeed(){
    const feedCA = await getFeed({onlyFollowing: true, reposts: true})
    if(feedCA.error) return feedCA
    const {agent, did} = await getSessionAgent()
    if(!did){
        return feedCA
    }

    const {data} = await agent.getTimeline()

    const feedBsky = data.feed

    const usersCA = await getUsers()
    if(usersCA.error) return {error: usersCA.error}

    const didsCA = new Set(usersCA.users.map((u) => (u.did)))

    const feedBskyOnly = []
    for(let i = 0; i < feedBsky.length; i++){
        const did = feedBsky[i].post.author.did
        if(!didsCA.has(did)){
            if(!feedBsky[i].reply){
                feedBskyOnly.push(feedBsky[i])
            }
        }
    }

    const feedBskyWithCAFormat: FeedContentProps[] = feedBskyOnly.map(formatBskyFeedElement)

    const fullFeed = [...feedBskyWithCAFormat, ...feedCA.feed]

    function cmp(a: FeedContentProps, b: FeedContentProps) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }

    return {feed: fullFeed.sort(cmp)}
}


export async function getSearchableContents(){
    return getFeed({onlyFollowing: false, reposts: false}) // también debería incluir las respuestas
}


export async function getProfileFeed(userId: string, kind: string){
    let collections = []
    if(kind == "main"){
        collections = ["ar.com.cabildoabierto.article", "app.bsky.feed.post"]
    } else if(kind == "replies"){
        collections = ["ar.com.cabildoabierto.article", "app.bsky.feed.post", "ar.com.cabildoabierto.quotePost"]
    } else if(kind == "edits"){
        collections = ["ar.com.cabildoabierto.topic"]
    }

    let feed
    try {
        feed = await db.record.findMany({
            select: feedQueryWithReposts,
            where: {
                authorId: userId,
                collection: {
                    in: collections
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        })
    } catch {
        return {error: "No se pudo obtener el feed."}
    }

    if(kind == "main"){
        feed = feed.filter((e) => (e.collection == "ar.com.cabildoabierto.article" || e.content.post.replyTo == null))
    }

    console.log("feed", feed)

    const readyForFeed = addCountersToFeed(feed, userId)
    return {feed: readyForFeed}
}


export async function getEnDiscusion(): Promise<{feed?: FeedContentPropsNoRepost[], error?: string}> {

    const feed = await getFeed({onlyFollowing: false, reposts: false})

    if(feed.error){
        return {error: feed.error}
    }

    const sortedFeed = feed.feed.map((e) => ({
        element: e as FeedContentPropsNoRepost,
        score: popularityScore(e as FeedContentPropsNoRepost)
    })).sort(listOrder).map(({element}) => (element))

    return {feed: sortedFeed}
}


export async function getTopicFeed(id: string): Promise<{feed?: FeedContentProps[], error?: string}> {
    const did = await getUserId()

    id = decodeURIComponent(id)
    console.log("getting topic feed for", id)

    try {

        const feed = await db.record.findMany({
            select: feedQuery,
            where: {
                collection: {
                    in: ["app.bsky.feed.post", "ar.com.cabildoabierto.quotePost"]
                },
                content: {
                    post: {
                        replyTo: {
                            collection: "ar.com.cabildoabierto.topic",
                            content: {
                                topicVersion: {
                                    topicId: id
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        console.log("feed length", feed.length)

        const readyForFeed = addCountersToFeed(feed, did)

        return {feed: readyForFeed}
    } catch (e) {
        console.log("Error getting topic feed for", id)
        console.log(e)
        return {error: "Ocurrió un error al obtener el feed del tema " + id}
    }
}