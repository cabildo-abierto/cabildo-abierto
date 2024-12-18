'use server'

import { getSessionAgent } from "./auth";
import { RichText } from '@atproto/api'
import {db} from "../db";
import {FastPostReplyProps, ThreadProps} from "../app/lib/definitions";
import {addCounters, processReactions} from "./utils";


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
    console.log("Remove like", uri)
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


const authorQuery = {
    select: {
        did: true,
        handle: true,
        displayName: true,
        avatar: true,
    }
}


const feedElemQuery = (collection: string) => {
    return {
        cid: true,
        uri: true,
        createdAt: true,
        author: authorQuery,
        collection: true,
        _count: {
            select: {
                replies: true
            }
        },
        reactions: {
            select: {
                record: {
                    select: {
                        collection: true,
                        authorId: true,
                        uri: true
                    }
                }
            }
        },
        content: {
            select: {
                text: true,
                numWords: true,
                article: {
                    select: {
                        title: true,
                        format: true,
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
                        }
                    }
                }
            }
        }
    }

}


export async function getThread(did: string, rkey: string, collection: string): Promise<{thread?: ThreadProps, error?: string}> {
    const uri = "at://" + did + "/" + collection + "/" + rkey

    try {
        const mainPostQ = db.record.findFirst({
            select: feedElemQuery(collection),
            where: {
                authorId: did,
                rkey: rkey
            }
        })
        const repliesQ = db.record.findMany({
            select: feedElemQuery(collection),
            where: {
                content: {
                    post: {
                        replyTo: {
                            authorId: did,
                            rkey: rkey
                        }
                    }
                }
            }
        })
        const [mainPost, replies] = await db.$transaction([mainPostQ, repliesQ])
        const threadForFeed: ThreadProps = {
            post: addCounters(did, mainPost, mainPost.reactions),
            replies: replies.map((r) => {
                return addCounters(did, r, r.reactions)
            })
        }
        return {thread: threadForFeed}
    } catch(err) {
        console.log("Error getting thread", uri)
        console.log(err)
        return {error: "No se pudo obtener el thread."}
    }
}


export async function createFastPost(
    {text, reply}: {text: string, reply?: FastPostReplyProps}
): Promise<{error?: string}> {

    const {agent} = await getSessionAgent()

    const rt = new RichText({
      text: text
    })
    await rt.detectFacets(agent)

    const record = {
        "$type": "app.bsky.feed.post",
        text: rt.text,
        facets: rt.facets,
        "createdAt": new Date().toISOString()
    }

    console.log("creating fast post with reply", reply)
    if(reply){
        await agent.post({
            ...record,
            reply: reply
        })
    } else {
        await agent.post(record)
    }

    return {}
}


export async function createATProtoArticle(compressedText: string, userId: string, title: string){

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


export async function createPastPost(){
    const {agent} = await getSessionAgent()
    const record = {
        "$type": "app.bsky.feed.post",
        text: "Este post fue escrito el 7 de diciembre.",
        "createdAt": new Date("12/01/2024").toISOString()
    }

    await agent.post(record)
}