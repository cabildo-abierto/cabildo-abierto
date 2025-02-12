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
import {getUserById, getUserId, getUsers} from "./users";
import {addCounters, feedQuery, feedQueryWithReposts} from "./utils";
import {popularityScore} from "../components/popularity-score";
import {getRkeyFromUri, listOrder} from "../components/utils";
import {
    BlockedPost,
    FeedViewPost,
    NotFoundPost,
    PostView,
    ReplyRef
} from "@atproto/api/src/client/types/app/bsky/feed/defs";


function addCountersToFeed(feed: any[], did: string): FeedContentProps[]{
    return feed.map((elem) => {
        if(elem.collection == "app.bsky.feed.repost"){
            return {...elem, reaction: {...elem.reaction, reactsTo: addCounters(did, elem.reaction.reactsTo, elem.reaction.reactsTo.reactions)}}
        }
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

        let feed = await db.record.findMany({
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

        feed = feed.filter((e) => {return validFeedElement(e, "main")})

        const readyForFeed = addCountersToFeed(feed, did)

        return {feed: readyForFeed}
    } catch (err) {
        console.log("Error getting feed", err)
        return {error: "Error al obtener el feed."}
    }
}


function formatBskyPostViewAsFeedElement(e: PostView | NotFoundPost | BlockedPost | {[p: string]: unknown, $type: string}): {blocked?: boolean, notFound?: boolean} & FeedContentPropsNoRepost {
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
            replyTo,
            root,
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
        content,
        ...engagementProps
    }

    if(e.reason && e.reason.$type == "app.bsky.feed.defs#reasonRepost"){
        const repostRecordProps = {
            author: e.reason.by as {did: string, handle: string, displayName?: string},
            collection: "app.bsky.feed.repost",
            createdAt: new Date(e.reason.indexedAt as string),
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


function validFeedElement(e, kind){
    if(e.collection == "ar.com.cabildoabierto.article"){
        return true
    }
    if(e.collection == "app.bsky.feed.repost"){
        if(e.reaction == null || e.reaction.reactsTo == null){
            return false
        }
        if(e.reaction.reactsTo.collection == "app.bsky.feed.post"){
            return e.reaction.reactsTo.content != undefined
        }
        return true
    }
    return kind != "main" || e.content.post.replyTo == null
}

export async function getProfileFeed(userId: string, kind: "main" | "replies" | "edits"): Promise<{error?: string, feed?: FeedContentProps[]}>{

    let feed: FeedContentProps[] = []
    const user = await getUserById(userId)

    const {agent, did} = await getSessionAgent()
    if(kind == "main" || kind == "replies"){
        const filter = kind == "main" ? "posts_no_replies" : "posts_with_replies"
        const {data} = await agent.getAuthorFeed({actor: userId, filter: filter})
        for(let i = 0; i < data.feed.length; i++){
            feed.push(formatBskyFeedElement(data.feed[i]))
        }
    }

    if(user.user && user.user.inCA){
        let collections = []
        if(kind == "main"){
            collections = ["ar.com.cabildoabierto.article", "app.bsky.feed.post", "app.bsky.feed.repost"]
        } else if(kind == "replies"){
            collections = ["ar.com.cabildoabierto.article", "app.bsky.feed.post", "ar.com.cabildoabierto.quotePost", "app.bsky.feed.repost"]
        } else if(kind == "edits"){
            collections = ["ar.com.cabildoabierto.topic", "app.bsky.feed.repost"]
        }

        try {
            let feedCA = await db.record.findMany({
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

            feedCA = feedCA.filter((e) => {return validFeedElement(e, kind)})

            const readyForFeed = addCountersToFeed(feedCA, did)

            for(let i = 0; i < readyForFeed.length; i++){
                if(!feed.some((f) => (f.uri == readyForFeed[i].uri))){
                    feed.push(readyForFeed[i])
                }
            }

            feed = feed.sort((a, b) => (b.createdAt.getTime() - a.createdAt.getTime()))
        } catch (error) {
            console.log("error", error)
            return {error: "No se pudo obtener el feed."}
        }

    }

    return {feed: feed}
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

        const readyForFeed = addCountersToFeed(feed, did)

        return {feed: readyForFeed}
    } catch (e) {
        console.log("Error getting topic feed for", id)
        console.log(e)
        return {error: "Ocurrió un error al obtener el feed del tema " + id}
    }
}