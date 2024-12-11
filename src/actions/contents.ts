'use server'

import { revalidateTag } from "next/cache";
import { db } from "../db";
import { getUserId } from "./users";
import { getPlainText } from "../components/utils";
import { compress } from "../components/compression";
import { getSessionAgent } from "./auth";
import { RichText } from '@atproto/api'
import { FeedContentProps } from "../app/lib/definitions";
import { ThreadViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";


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


export async function getFastPostThread(u: string, id: string, c: string){
    const {agent} = await getSessionAgent()

    const uri = "at://" + u + "/" + c + "/" + id

    try {
        if(c == "app.bsky.feed.post"){
            const {data} = await agent.getPostThread({uri: uri})
            return data.thread as ThreadViewPost
        } else {
            const {data} = await agent.com.atproto.repo.getRecord({
                repo: u,
                collection: c,
                rkey: id
            })


            let {data: author} = await agent.getProfile({actor: u})

            const {value: record, ...rest} = data
            return {
                ...rest,
                record: record as unknown,
                author,
                likeCount: 0,
                repostCount: 0,
                quoteCount: 0,
                replyCount: 0,
                viewer: {}
            } as unknown as FeedContentProps
        }
    } catch(err) {
        console.log("Error getting thread", uri)
        console.log(err)
        return null
    }
}


export async function createFastPost(
    text: string
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

    await agent.post(record)

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