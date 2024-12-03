'use server'

import { revalidateTag, unstable_cache } from "next/cache";
import { NotificationType } from "@prisma/client";
import { db } from "../db";
import { revalidateEverythingTime } from "./utils";
import { getUserId } from "./users";
import { getPlainText } from "../components/utils";
import { compress, decompress } from "../components/compression";
import { getSessionAgent } from "./auth";
import { RichText } from '@atproto/api'
import { FeedContentProps } from "../app/lib/definitions";
import { ThreadViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";


export async function notifyMentions(mentions: {id: string}[], contentId: string, userById: string, isEdit: boolean = false){
    let data = []

    for(let i = 0; i < mentions.length; i++){
        if(userById != mentions[i].id){
            data.push({
                userById: userById,
                userNotifiedId: mentions[i].id,
                contentId: contentId,
                reactionId: null,
                type: (isEdit ? "EditMention" : "Mention")
            })
        }
    }
    
    try {
        await db.notification.createMany({
            data: data
        })
    } catch {
        return {error: "Error al notificar las menciones."}
    }

    for(let i = 0; i < mentions.length; i++){
        revalidateTag("notifications:"+mentions[i].id)
        revalidateTag("user:"+mentions[i].id)
    }

    return {}
}


export async function processNewTextFast(text: string, title?: string) {

    //let entityReferences = await findEntityReferences(text)
    //if(entityReferences.error) return {error: entityReferences.error}

    //const {mentions, error: mentionsError} = await findMentions(text)
    //if(mentionsError) return {error: mentionsError}

    //const searchkeys = await getReferencesSearchKeys()
    //if(searchkeys.error) return {error: searchkeys.error}

    const {numChars, numWords, numNodes, plainText, error} = getPlainText(text)
    if(error) return {error}

    //const weakReferences = findWeakEntityReferences(
    //    plainText+" "+title,
    //    searchkeys.searchkeys
    //)

    return {
        numChars,
        numWords,
        numNodes,
        //weakReferences,
        //mentions,
        //entityReferences: entityReferences.entityReferences,
        compressedPlainText: compress(plainText)
    }
}


export async function createNotification(
    userById: string, userNotifiedId: string, notificationType: NotificationType,
    contentId?: string, reactionId?: string){
    
    try {
        await db.notification.create({
            data: {
                userById: userById,
                userNotifiedId: userNotifiedId,
                contentId: contentId,
                reactionId: reactionId,
                type: notificationType
            }
        })
    } catch {
        return {error: "Error al notificar."}
    }

    revalidateTag("notifications:"+userNotifiedId)
    revalidateTag("user:"+userNotifiedId)
    return {}
}

export const addLike = async (uri: string, cid: string) => {
    const {agent} = await getSessionAgent()

    try {
        await agent.like(uri, cid)
        return {}
    } catch(err) {
        console.log("Error giving like", err)
        return {error: "No se pudo agregar el like."}
    }
}


export const removeLike = async (uri: string) => {
    const {agent} = await getSessionAgent()

    /*const likes = await agent.getLikes()

    try {
        await agent.deleteLike(likeUri)
        return {}
    } catch(err) {
        console.log("Error giving like", err)
        return {error: "No se pudo agregar el like."}
    }*/
}



export const addView = async (id: string, userId: string) => {
    let exists
    try {
        exists = await db.view.findMany({
            select: {
                createdAt: true
            },
            where: {
                AND: [{
                    userById: userId
                },{
                    contentId: id
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
                    userById: userId,
                    contentId: id
                },
            })
        } catch {
            return {error: "Ocurrió un error"}
        }
    }

    if(exists.length == 0){
        try {
            await db.content.update({
                data: {
                    uniqueViewsCount: {
                        increment: 1
                    }
                },
                where: {
                    id: id
                }
            })
        } catch {
            return {error: "Ocurrió un error."}
        }
    }

    revalidateTag("content:"+id)
    return {}
}


export async function getLastKNotificationsNoCache(k: number, userId: string){
    const notifications = await db.notification.findMany({
        select: {
            id: true,
            viewed: true,
            content: {
                select: {
                    id: true,
                    parentContents: {
                        select: {
                            id: true,
                            authorId: true,
                            type: true,
                            contribution: true,
                            parentEntityId: true
                        }
                    },
                    authorId: true,
                    type: true,
                    contribution: true,
                    parentEntityId: true
                }
            },
            reactionId: true,
            userById: true,
            userNotifiedId: true,
            type: true,
            createdAt: true
        },
        where: {
            userNotifiedId: userId
        },
        orderBy: {
            createdAt: "desc"
        }
    })
    let lastUnseen = 0
    for(let i = 0; i < notifications.length; i++){
        if(!notifications[i].viewed) lastUnseen = i
    }
    return notifications.slice(0, Math.max(lastUnseen+1, k))
}


export async function getLastKNotifications(k: number){
    const userId = await getUserId()
    if(!userId) return {error: "No se encontró un usuario."}

    return await unstable_cache(async () => {
        return await getLastKNotificationsNoCache(k, userId)
    }, ["notifications", userId], {
        tags: ["notifications", "notifications:"+userId],
        revalidate: revalidateEverythingTime,
    })()
}


export async function markNotificationViewed(id: string){
    let notification
    try {
        notification = await db.notification.update({
            data: {
                viewed: true
            },
            select: {
                userNotifiedId: true
            },
            where: {
                id: id
            }
        })
    } catch {
        return {error: "Ocurrió un error."}
    }
    revalidateTag("notifications:"+notification.userNotifiedId)
    revalidateTag("user:"+notification.userNotifiedId)
    return {}
}


/*function updateLinksFromNode(node: any){

}


function getUpdatedLinksText(text: string){
    let json = null
    try {
        json = JSON.parse(text)
    } catch {
        return text
    }

    const newRoot = updateLinksFromNode(json.root)

    json.root = newRoot

    return JSON.stringify(json)
}*/


export async function updateContentLinks(){
    /*const contents = await db.content.findMany({
        select: {
            id: true,
            compressedText: true
        }
    })

    for(let i = 0; i < contents.length; i++){
        const newText = getUpdatedLinksText(decompress(contents[i].compressedText))

        await db.content.update({
            data: {
                compressedText : compress(newText)
            },
            where: {
                id: contents[i].id
            }
        })
    }*/
}


export async function updateAllUniqueCommentators() {
    const contents = await db.content.findMany({
        select: {
            id: true,
            childrenTree: {
                select: {
                    authorId: true
                },
                where: {
                    type: {
                        in: ["Comment", "FakeNewsReport"]
                    }
                }
            }
        }
    })

    for(let i = 0; i < contents.length; i++){
        const n = new Set(contents[i].childrenTree.map((c) => (c.authorId))).size
        console.log("unique comentators of", contents[i].id, n)
        await db.content.update({
            data: {
                uniqueCommentators: n
            },
            where: {
                id: contents[i].id
            }
        })
    }
}


export async function deleteDraft(contentId: string){
    const userId = await getUserId()
    try {
        await db.content.delete({
            where: {
                id: contentId
            }
        })
    } catch {
        return {error: "Error al borrar el borrador."}
    }
    revalidateTag("drafts:"+userId)
    return {}
}


export async function getATProtoThread(u: string, id: string, c: string){
    const {agent} = await getSessionAgent()

    /** The handle or DID of the repo. 
     repo: string
    The NSID of the record collection. 
    collection: string
    The Record Key. 
    rkey: string
    The CID of the version of the record. If not specified, then return the most recent version. 
    cid?: string
    */

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
            
            console.log("author", author)

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
            } as FeedContentProps
        }
    } catch(err) {
        console.log("Error getting thread", uri)
        console.log(err)
        return null
    }
}


export async function getBskyThread(u: string, id: string){
    const {agent} = await getSessionAgent()

    /** The handle or DID of the repo. 
     repo: string
    The NSID of the record collection. 
    collection: string
    The Record Key. 
    rkey: string
    The CID of the version of the record. If not specified, then return the most recent version. 
    cid?: string
    */
    const uri = "at://" + u + "/app.bsky.feed.post/" + id

    const {data} = await agent.getPostThread({uri: uri})
    
    return data.thread
}


export async function createFastPost(
    text: string
): Promise<{error?: string}> {

    const {agent} = await getSessionAgent()

    const rt = new RichText({
      text: text
    })
    await rt.detectFacets(agent) // automatically detects mentions and links
    
    /*const segments = rt.segments()
    // rendering as markdown
    let markdown = ''
    segments.forEach((segment) => {
      if (segment.isLink()) {
        markdown += `[${segment.text}](${segment.link?.uri})`
      } else if (segment.isMention()) {
        markdown += `[${segment.text}](https://my-bsky-app.com/profile/${segment.mention?.did})`
      } else {
        markdown += segment.text
      }
    })*/

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

    const text = decompress(compressedText)

    const record = {
        "$type": "ar.com.cabildoabierto.article",
        text: text,
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