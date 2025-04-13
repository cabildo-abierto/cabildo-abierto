'use server'

import { getSessionAgent } from "./auth";
import {db} from "@/db";
import {createRecord} from "./write/utils";
import {revalidateUri} from "./revalidate";
import {newDirtyRecord} from "@/server-actions/sync/record-processing";



export async function createLikeDB({uri, cid, likedUri}: {uri: string, cid: string, likedUri: string}): Promise<void> {
    const updates= [
        ...newDirtyRecord({uri: likedUri}),
        ...createRecord({uri, cid, createdAt: new Date(), collection: "app.bsky.feed.like"}),
        db.like.create({
            data: {
                uri: uri,
                likedRecordId: likedUri
            }
        })
    ]

    await db.$transaction(updates)

    await revalidateUri(likedUri)
}


export async function deleteLikeDB(uri: string, likedUri: string){
    const updates = [
        db.like.deleteMany({
            where: {
                uri: uri
            }
        }),
        db.record.deleteMany({
            where: {
                uri: uri
            }
        })
    ]

    await db.$transaction(updates)

    await revalidateUri(likedUri)
}


export const addLike = async (uri: string, cid: string) => {
    const {agent} = await getSessionAgent()

    try {
        const res = await agent.like(uri, cid)

        await createLikeDB({...res, likedUri: uri})

        return {uri: res.uri}
    } catch(err) {
        console.error("Error giving like", err)
        return {error: "No se pudo agregar el like."}
    }
}


export const removeLike = async (uri: string, likedUri: string) => {
    const {agent} = await getSessionAgent()
    try {
        await agent.deleteLike(uri)

        await deleteLikeDB(uri, likedUri)

    } catch(err) {
        console.error("Error removing like", err)
        return {error: "No se pudo eliminar el like."}
    }
}


export async function createRepostDB({uri, cid, repostedUri}: {uri: string, cid: string, repostedUri: string}): Promise<void> {
    const updates= [
        ...createRecord({uri, cid, createdAt: new Date(), collection: "app.bsky.feed.repost"}),
        db.repost.create({
            data: {
                uri: uri,
                repostedRecordId: repostedUri
            }
        })
    ]

    await db.$transaction(updates)

    await revalidateUri(repostedUri)
}


export async function deleteRepostDB(uri: string, repostedUri: string){
    const updates = [
        db.repost.delete({
            where: {
                uri: uri
            }
        }),
        db.record.delete({
            where: {
                uri: uri
            }
        })
    ]

    await db.$transaction(updates)

    await revalidateUri(repostedUri)
}


export const repost = async (uri: string, cid: string) => {
    const {agent} = await getSessionAgent()

    try {
        const res = await agent.repost(uri, cid)

        await createRepostDB({...res, repostedUri: uri})

        return {uri: res.uri}
    } catch(err) {
        console.error("Error reposting", err)
        console.error("uri", uri)
        return {error: "No se pudo agregar el like."}
    }
}


export const removeRepost = async (uri: string, repostedUri: string) => {
    const {agent} = await getSessionAgent()

    try {
        await agent.deleteRepost(uri)

        await deleteRepostDB(uri, repostedUri)

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





