'use server'

import { getSessionAgent } from "./auth";
import { RichText } from '@atproto/api'
import {db} from "../db";
import {FastPostReplyProps, ThreadProps, VisualizationProps} from "../app/lib/definitions";
import {addCounters} from "./utils";
import {getVisualizationTitle} from "../components/utils";


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
                        quote: true,
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


export async function getThread({collection, did, rkey, cid}: {collection: string, did?: string, rkey?: string, cid?: string}): Promise<{thread?: ThreadProps, error?: string}> {
    const {did: viewerDid} = await getSessionAgent()
    const threadId = rkey != undefined ? {rkey, authorId: did} : {cid}
    try {
        const mainPostQ = db.record.findFirst({
            select: feedElemQuery(collection),
            where: threadId
        })
        const repliesQ = db.record.findMany({
            select: feedElemQuery(collection),
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
    {text, reply, quote, visualization, cabildo}: {
        text: string, reply?: FastPostReplyProps, quote?: string, visualization?: VisualizationProps, cabildo?: string
    }
): Promise<{error?: string}> {

    const {agent} = await getSessionAgent()

    const rt = new RichText({
      text: text
    })
    await rt.detectFacets(agent)

    const tags = cabildo != undefined ? ["cabildo/"+cabildo] : undefined

    if(visualization){
        const record = {
            "$type": "app.bsky.feed.post",
            text: rt.text,
            facets: rt.facets,
            createdAt: new Date().toISOString(),
            reply,
            tags,
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
            tags,
            createdAt: new Date().toISOString(),
            reply
        }

        await agent.post(record)
    } else {
        const record = {
            "$type": "ar.com.cabildoabierto.quotePost",
            text: rt.text,
            facets: rt.facets,
            tags,
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