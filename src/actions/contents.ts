'use server'

import { getSessionAgent } from "./auth";
import {RichText} from '@atproto/api'
import {db} from "../db";
import {FastPostProps, FastPostReplyProps, VisualizationProps} from "../app/lib/definitions";
import {getDidFromUri, getRkeyFromUri, getUri, getVisualizationTitle, splitUri} from "../components/utils/utils";
import {revalidateTag, unstable_cache} from "next/cache";
import { QuotedContent } from "../components/feed/content-quote";
import {revalidateEverythingTime} from "./utils";
import {getTextFromBlob} from "./topics";


export const addLike = async (uri: string, cid: string) => {
    const {agent} = await getSessionAgent()

    try {
        const res = await agent.like(uri, cid)
        return {uri: res.uri}
    } catch(err) {
        console.error("Error giving like", err)
        return {error: "No se pudo agregar el like."}
    }
}


export const removeLike = async (uri: string) => {
    const {agent} = await getSessionAgent()
    try {
        await agent.deleteLike(uri)
    } catch(err) {
        console.error("Error removing like", err)
        return {error: "No se pudo eliminar el like."}
    }
}


export const repost = async (uri: string, cid: string) => {
    const {agent} = await getSessionAgent()

    try {
        const res = await agent.repost(uri, cid)
        return {uri: res.uri}
    } catch(err) {
        console.error("Error reposting", err)
        console.error("uri", uri)
        return {error: "No se pudo agregar el like."}
    }
}


export const removeRepost = async (uri: string) => {
    const {agent} = await getSessionAgent()

    try {
        await agent.deleteRepost(uri)
        return {}
    } catch(err) {
        console.error("Error eliminando el repost", err)
        return {error: "No se pudo eliminar la republicación."}
    }
}


export const addView = async (uri: string, did: string) => {
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
        await agent.com.atproto.repo.createRecord({
            repo: did,
            collection: 'ar.com.cabildoabierto.article',
            record: record,
        })
    } catch (err){
        console.error("Error", err)
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


export async function getQuotedContentNoCache({did, rkey}: {did: string, rkey: string}): Promise<QuotedContent> {
    try {
        const q = await db.record.findMany({
            select: {
                uri: true,
                author: {
                    select: {
                        handle: true,
                        displayName: true
                    }
                },
                content: {
                    select: {
                        text: true,
                        textBlob: {
                            select: {
                                cid: true,
                                authorId: true
                            }
                        },
                        format: true,
                        article: {
                            select: {
                                title: true
                            }
                        },
                        topicVersion: {
                            select: {
                                topic: {
                                    select: {
                                        id: true,
                                        versions: {
                                            select: {
                                                title: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            where: {
                uri: {
                    in: [getUri(did, "ar.com.cabildoabierto.article", rkey), getUri(did, "ar.com.cabildoabierto.topic",  rkey)]
                }
            }
        })

        if(q[0].content.textBlob != undefined){
            q[0].content.text = await getTextFromBlob(q[0].content.textBlob)
        }

        return q[0]
    } catch (e) {
        console.error("Error getting quoted content", did, rkey)
        console.error(e)
        return null
    }
}


export async function getQuotedContent({did, rkey}: {did: string, rkey: string}): Promise<QuotedContent> {
    return unstable_cache(async () => {
        return await getQuotedContentNoCache({did, rkey})
    }, ["quotedContent:"+did+":"+rkey],
    {
        tags: ["record:"+did+":"+rkey],
        revalidate: revalidateEverythingTime
    })()
}