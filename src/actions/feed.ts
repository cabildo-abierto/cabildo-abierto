'use server'

import { db } from "../db";
import { FeedContentProps } from "../app/lib/definitions";
import { getSessionAgent } from "./auth";
import { Agent } from "@atproto/api";


function getHandleFromURI(uri: string) {
    return uri.split("/")[2]
}


function getRkeyFromURI(uri: string) {
    return uri.split("/")[4]
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
        articles = res.data
    } catch(err) {
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
    for(let j = 0; j < articles.records.length; j++){
        const {value, ...record} = articles.records[j]
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


export async function getFeedForUsers(users: {did: string}[], includeReplies: boolean, onlyArticles: boolean = false){
    const {agent, did} = await getSessionAgent()

    let posts: FeedContentProps[] = []

    for(let i = 0; i < users.length; i++){

        if(!onlyArticles){
            const expandedPosts = await getExpandedUserFeed(users[i].did, includeReplies, agent)
            posts = [...posts, ...expandedPosts]
        }

        const articles = await getArticlesFeedForUser(users[i].did, agent)

        posts = [...posts, ...articles]
    }

    function cmp(a, b){
        return new Date(b.post.record.createdAt).getTime() - new Date(a.post.record.createdAt).getTime()
    }

    return posts.sort(cmp)
}


export async function getArticlesTimeline(agent: Agent){

    const {data} = await agent.getFollows({actor: agent.did})

    const follows = [...data.follows.map(({did}) => ({did})), {did: data.subject.did}]

    const feed = await getFeedForUsers(follows, false, true)

    return feed
}


export async function getATProtoFeed(): Promise<FeedContentProps[]>{

    const {agent} = await getSessionAgent()

    const { data } = await agent.getTimeline({})

    const articles = await getArticlesTimeline(agent)

    // @ts-ignore
    let timeline: FeedContentProps[] = data.feed.filter(({post}) => (!post.record.reply))

    timeline = [...timeline, ...articles]

    function cmp(a: {post: {record: {createdAt: string}}}, b: {post: {record: {createdAt: string}}}) {
        return new Date(b.post.record.createdAt).getTime() - new Date(a.post.record.createdAt).getTime()
    }

    // @ts-ignore
    return timeline.sort(cmp)
}


export async function getProfileFeed(userId: string, includeReplies: boolean){
    return await getFeedForUsers([{did: userId}], includeReplies)
}


export async function getEnDiscusion(){
    const users = await db.user.findMany({
        select: {
            did: true,
            handle: true
        }
    })

    const feed = await getFeedForUsers(users, false, false)

    return feed
}