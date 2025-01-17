'use server'

import { db } from "../db";
import {FeedContentProps} from "../app/lib/definitions";
import { getSessionAgent } from "./auth";
import { Agent } from "@atproto/api";
import { getUsers } from "./users";
import {addCounters} from "./utils";
import {popularityScore} from "../components/popularity-score";
import {listOrder} from "../components/utils";


const feedQuery = {
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
                    replyToId: true
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
    }
}


function addCountersToFeed(feed: any[], did: string): FeedContentProps[]{
    return feed.map((elem) => {
        return addCounters(did, elem, elem.reactions)
    })
}


export async function getFollowingFeed(): Promise<{feed?: FeedContentProps[], error?: string}>{
    try {
        const {agent, did} = await getSessionAgent()
        const {data: following} = await agent.getFollows({actor: did})
        const feed = await db.record.findMany({
            select: feedQuery,
            where: {
                authorId: {
                    in: [...following.follows.map(({did}) => (did)), did]
                },
                content: {
                    OR: [
                        {
                            post: {
                                replyToId: null
                            }
                        },
                        {
                            record: {
                                collection: "ar.com.cabildoabierto.article"
                            }
                        }
                    ]
                },
                collection: {
                    in: ["ar.com.cabildoabierto.article", "app.bsky.feed.post"]
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        })
        const readyForFeed = addCountersToFeed(feed, did)
        return {feed: readyForFeed}
    } catch (err) {
        console.log("Error getting feed", err)
        return {error: "Error al obtener el feed."}
    }
}


export async function getSearchableContents(){
    return getFollowingFeed() // también debería incluir las respuestas
}


export async function getPostWithAuthorFromStrongRef(ref: {uri: string, cid: string}, agent: Agent){
    const {data} = await agent.getPosts({uris: [ref.uri]})

    const post = data.posts[0]

    return post
}


export async function expandPost(post: any, agent: Agent): Promise<FeedContentProps> {
    if(post.record.reply){
        const parent = await getPostWithAuthorFromStrongRef(post.record.reply.parent, agent)
        post.record.reply.parent = parent
        if(post.record.reply.root){
            const root = await getPostWithAuthorFromStrongRef(post.record.reply.root, agent)
            post.record.reply.root = root
        }
    }

    return post
}


export async function getExpandedUserFeed(user: string, includeReplies: boolean, agent: Agent){
    const filter = includeReplies ? "posts_with_replies" : "posts_no_replies"

    let data
    try {
        const res = await agent.getAuthorFeed({actor: user, filter: filter})
        data = res.data
    } catch(err) {
        console.log("error getting author feed", user)
        console.log(err)
        return []
    }

    const posts = []
    for(let j = 0; j < data.feed.length; j++){
        const p = await expandPost(data.feed[j].post, agent)
        posts.push({post: p, reason: data.feed[j].reason})
    }
    return posts
}


export async function getArticlesFeedForUser(user: string, agent: Agent){
    let articles
    try {
        const res = await agent.com.atproto.repo.listRecords({
            repo: user,
            collection: 'ar.com.cabildoabierto.article',
        })
        articles = (res.data.records as any[]).filter((a) => (a.value.format != undefined))
    } catch(err) {
        console.log("error", err)
        return []
    }

    let author
    try {
        let res = await agent.getProfile({actor: user})
        author = res.data
    } catch(err) {
        return []
    }

    let posts = []
    for(let j = 0; j < articles.length; j++){
        const {value, ...record} = articles[j]
        posts.push({post: {
            ...record,
            record: value,
            author,
            likeCount: 0,
            repostCount: 0,
            replyCount: 0,
            quoteCount: 0
        }})
    }
    return posts
}


export async function getProfileFeed(userId: string, kind: string){
    let feed
    try {
        feed = await db.record.findMany({
            select: feedQuery,
            where: {
                authorId: userId,
                collection: {
                    in: ["ar.com.cabildoabierto.article", "app.bsky.feed.post", "ar.com.cabildoabierto.quotePost"]
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
        feed = feed.filter((e) => (e.collection == "ar.com.cabildoabierto.article" || e.content.post.replyToId == null))
    }

    const readyForFeed = addCountersToFeed(feed, userId)
    return {feed: readyForFeed}
}


export async function getEnDiscusion(): Promise<{feed?: FeedContentProps[], error?: string}> {

    const feed = await getFollowingFeed()

    if(feed.error){
        return {error: feed.error}
    }

    const sortedFeed = feed.feed.map((e) => ({
        element: e,
        score: popularityScore(e)
    })).sort(listOrder).map(({element}) => (element))

    console.log("sorted feed", sortedFeed)

    return {feed: sortedFeed}
}