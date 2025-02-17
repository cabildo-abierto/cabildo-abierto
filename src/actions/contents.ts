'use server'

import { getSessionAgent } from "./auth";
import {RichText} from '@atproto/api'
import {db} from "../db";
import {FastPostProps, FastPostReplyProps, VisualizationProps} from "../app/lib/definitions";
import {getDidFromUri, getRkeyFromUri, getVisualizationTitle, splitUri} from "../components/utils";
import {revalidateTag} from "next/cache";


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

    if(reply){
        revalidateTag("thread:"+getDidFromUri(reply.parent.uri)+":"+getRkeyFromUri(reply.parent.uri))
        revalidateTag("thread:"+getDidFromUri(reply.root.uri)+":"+getRkeyFromUri(reply.root.uri))
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