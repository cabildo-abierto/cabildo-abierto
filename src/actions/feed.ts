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


export async function getFeedForUsers(users: {id: string}[], includeReplies: boolean){
    const {agent, did} = await getSessionAgent()

    let posts = []

    const filter = includeReplies ? "posts_with_replies" : "posts_no_replies"

    for(let i = 0; i < users.length; i++){
        let data
        try {
            const res = await agent.getAuthorFeed({actor: users[i].id, filter: filter})
            data = res.data
        } catch(err) {
            console.log("error getting author feed", users[i].id)
            console.log(err)
            continue
        }
        for(let j = 0; j < data.feed.length; j++){
            
            const p = await expandPost(data.feed[j].post, agent)
            posts.push(p)
            
            /*if(p.record.reply){
                const parent = await agent.getPost(p.record.reply.parent)
                const root = await agent.getPost(p.record.reply.root)
                otherPosts.push(post2feedcontent(parent))
                otherPosts.push(post2feedcontent(root))
            }*/
        }

        let articles
        try {
            const res = await agent.com.atproto.repo.listRecords({
                repo: users[i].id,
                collection: 'ar.com.cabildoabierto.article',
            })
            articles = res.data
        } catch(err) {
            continue
        }

        let author
        try {
            let res = await agent.getProfile({actor: users[i].id})
            author = res.data
        } catch(err) {
            continue
        }

        for(let j = 0; j < articles.records.length; j++){
            const {value, ...record} = articles.records[j]
            posts.push({
                ...record,
                record: value,
                author,
                likeCount: 0,
                repostCount: 0,
                replyCount: 0,
                quoteCount: 0
            })
        }
    }

    function cmp(a, b){
        return new Date(b.record.createdAt).getTime() - new Date(a.record.createdAt).getTime()
    }

    return posts.sort(cmp)
}


export async function getATProtoFeed(): Promise<FeedContentProps[]>{
    /*const users = await db.user.findMany({
        select: {
            id: true,
            handle: true
        }
    })*/

    const {agent} = await getSessionAgent()

    const { data } = await agent.getTimeline({})

    // @ts-ignore
    const timeline = data.feed.filter(({post}) => (!post.record.reply))

    // @ts-ignore
    return timeline
}


export async function getProfileFeed(userId: string, includeReplies: boolean){
    return await getFeedForUsers([{id: userId}], includeReplies)
}