'use server'

import { getSessionAgent } from "./auth";
import { RichText } from '@atproto/api'
import {db} from "../db";
import {FastPostProps, FastPostReplyProps, ThreadProps, VisualizationProps} from "../app/lib/definitions";
import {addCounters, feedQuery, feedQueryWithReposts} from "./utils";
import {getDidFromUri, getUri, getVisualizationTitle, splitUri} from "../components/utils";
import {getUsers} from "./users";
import {ThreadViewPost} from "@atproto/api/src/client/types/app/bsky/feed/defs";


export const addLike = async (uri: string, cid: string) => {
    const {agent} = await getSessionAgent()

    try {
        const res = await agent.like(uri, cid)
        return {uri: res.uri}
    } catch(err) {
        console.log("Error giving like", err)
        return {error: "No se pudo agregar el like."}
    }
}


export const removeLike = async (uri: string) => {
    const {agent} = await getSessionAgent()
    try {
        await agent.deleteLike(uri)
    } catch(err) {
        console.log("Error removing like", err)
        return {error: "No se pudo eliminar el like."}
    }
}


export const repost = async (uri: string, cid: string) => {
    const {agent} = await getSessionAgent()

    try {
        const res = await agent.repost(uri, cid)
        return {uri: res.uri}
    } catch(err) {
        console.log("Error reposting", err)
        console.log("uri", uri)
        return {error: "No se pudo agregar el like."}
    }
}


export const removeRepost = async (uri: string) => {
    const {agent} = await getSessionAgent()

    try {
        await agent.deleteRepost(uri)
        return {}
    } catch(err) {
        console.log("Error eliminando el repost", err)
        return {error: "No se pudo eliminar la republicación."}
    }
}


export const addView = async (uri: string, did: string) => {
    console.log("adding view")
    let exists
    try {
        exists = await db.view.findMany({
            select: {
                createdAt: true
            },
            where: {
                AND: [{
                    userById: did
                },{
                    recordId: uri
                }]
            },
            orderBy: {
                createdAt: "asc"
            }
        })
    } catch {
        return {error: "Ocurrió un error."}
    }

    function olderThan(seconds: number){
        const dateLast = new Date(exists[exists.length-1].createdAt).getTime()
        const currentDate = new Date().getTime()
        const difference = (currentDate - dateLast) / 1000
        return difference > seconds
    }

    if(exists.length == 0 || olderThan(3600)){

        try {
            await db.view.create({
                data: {
                    userById: did,
                    recordId: uri
                },
            })
        } catch {
            return {error: "Ocurrió un error"}
        }
    }

    return {}
}


const authorQuery = {
    select: {
        did: true,
        handle: true,
        displayName: true,
        avatar: true,
    }
}


function threadViewPostToThread(thread: ThreadViewPost) {
    const record = thread.post.record as {createdAt: string, text: string, facets?: any, embed?: any}

    const post: FastPostProps = {
        uri: thread.post.uri,
        cid: thread.post.cid,
        author: thread.post.author,
        collection: "app.bsky.feed.post",
        createdAt: new Date(record.createdAt),
        content: {
            text: record.text,
            post: {
                facets: record.facets ? JSON.stringify(record.facets) : undefined,
                embed: record.embed ? JSON.stringify(record.embed) : undefined
            }
        },
        replyCount: thread.post.replyCount,
        repostCount: thread.post.repostCount,
        likeCount: thread.post.likeCount
    }

    const replies: FastPostProps[] = thread.replies ? thread.replies.map((r) => {
        if(r.notFound || r.blocked) return null
        const replyThread = r as ThreadViewPost
        if(replyThread.$type == "app.bsky.feed.defs#threadViewPost"){
            return threadViewPostToThread(replyThread).thread.post
        } else {
            return null
        }
    }).filter((r) => (r != null)) : []

    return {thread: {post, replies}}
}


export async function getThreadFromATProto({did, rkey}: {did: string, rkey: string}) {

    const {agent, did: viewerDid} = await getSessionAgent()

    const {data} = await agent.getPostThread({
        uri: getUri(did, "app.bsky.feed.post", rkey)
    })

    if(!data.notFound && !data.blocked){
        const thread = data.thread as ThreadViewPost

        return threadViewPostToThread(thread)
    } else {
        return {error: "No se encontró el post."}
    }
}


export async function getThread({did, rkey}: {did: string, rkey: string}): Promise<{thread?: ThreadProps, error?: string}> {

    const {users, error} = await getUsers()
    if(error) return {error}
    if(!users.some((u) => (u.did == did))){
        return await getThreadFromATProto({did, rkey})
    }

    const {did: viewerDid} = await getSessionAgent()
    const threadId = {rkey, authorId: did}


    try {
        const mainPostQ = db.record.findFirst({
            select: feedQuery,
            where: threadId
        })
        const repliesQ = db.record.findMany({
            select: feedQuery,
            where: {
                content: {
                    post: {
                        replyTo: threadId
                    }
                }
            }
        })
        const [mainPost, replies] = await db.$transaction([mainPostQ, repliesQ])

        const threadForFeed: ThreadProps = {
            post: addCounters(viewerDid, mainPost, mainPost.reactions),
            replies: replies.map((r) => {
                return addCounters(viewerDid, r, r.reactions)
            })
        }
        return {thread: threadForFeed}
    } catch(err) {
        console.log(err)
        return {error: "No se pudo obtener el thread."}
    }
}


export async function createFastPost(
    {text, reply, quote, visualization}: {
        text: string, reply?: FastPostReplyProps, quote?: string, visualization?: VisualizationProps
    }
): Promise<{error?: string}> {

    const {agent} = await getSessionAgent()

    const rt = new RichText({
      text: text
    })
    await rt.detectFacets(agent)

    if(visualization){
        const record = {
            "$type": "app.bsky.feed.post",
            text: rt.text,
            facets: rt.facets,
            createdAt: new Date().toISOString(),
            reply,
            embed: {
                $type: "app.bsky.embed.external",
                external: {
                    uri: "https://www.cabildoabierto.com.ar/visual/"+visualization.author.did+"/"+visualization.rkey,
                    title: getVisualizationTitle(visualization),
                    description: "Mirá la visualización interactiva en Cabildo Abierto."
                }
            }
        }
        console.log("posting record", record)

        const res = await agent.post(record)
        console.log("created record", res.uri, res.cid)
    } else if(!quote){
        const record = {
            "$type": "app.bsky.feed.post",
            text: rt.text,
            facets: rt.facets,
            createdAt: new Date().toISOString(),
            reply
        }

        await agent.post(record)
    } else {
        const record = {
            "$type": "ar.com.cabildoabierto.quotePost",
            text: rt.text,
            facets: rt.facets,
            createdAt: new Date().toISOString(),
            reply,
            quote
        }

        await agent.com.atproto.repo.createRecord({
            repo: agent.did,
            collection: record.$type,
            record
        })
    }

    return {}
}


export async function createArticle(compressedText: string, userId: string, title: string){

    const {agent, did} = await getSessionAgent()
    if(!agent) return {error: "Iniciá sesión para publicar un artículo."}

    const record = {
        "$type": "ar.com.cabildoabierto.article",
        text: compressedText,
        format: "lexical-compressed",
        title: title,
        createdAt: new Date().toISOString()
    }

    try {
        const res = await agent.com.atproto.repo.createRecord({
            repo: did,
            collection: 'ar.com.cabildoabierto.article',
            record: record,
        })
    } catch (err){
        console.log("Error", err)
        return {error: "Ocurrió un error al publicar el artículo."}
    }

    return {}
}


export async function getBskyFastPost(uri: string): Promise<{post?: FastPostProps, error?: string}>{
    const {agent} = await getSessionAgent()
    const {did, rkey} = splitUri(uri)

    try {
        const {value, uri: postUri} = await agent.getPost({repo: did, rkey})
        const postDid = getDidFromUri(postUri)
        const {data: authorData} = await agent.app.bsky.actor.getProfile({actor: postDid})

        const formattedPost: FastPostProps = {
            uri: uri,
            createdAt: new Date(value.createdAt),
            collection: value.$type as string,
            author: authorData,
            content: {
                text: value.text,
                post: {
                    embed: JSON.stringify(value.embed)
                }
            }
        }
        return {post: formattedPost}
    } catch (e) {
        return {error: "Post not found"}
    }

}