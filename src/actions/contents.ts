'use server'

import { revalidateTag, unstable_cache } from "next/cache";
import { ContentType, NotificationType, Prisma } from "@prisma/client";
import { db } from "../db";
import { revalidateEverythingTime, revalidateReferences } from "./utils";
import { getEntities } from "./entities";
import { CommentProps, ContentProps } from "../app/lib/definitions";
import { getUserId, getUsers } from "./users";
import { findEntityReferencesFromEntities, findMentionsFromUsers, findWeakEntityReferences, getPlainText } from "../components/utils";
import { compress, decompress } from "../components/compression";
import { getReferencesSearchKeys } from "./references";


const childrenContentsQuery = {
    select: {
        id: true,
        createdAt: true,
        type: true,
        childrenTree: {
            select: {
                authorId: true
            }
        },
        reactions: {
            select: {
                userById: true
            }
        },
        author: {
            select: {
                id: true
            }
        },
        uniqueViewsCount: true
    },
    orderBy: {
        createdAt: "desc" as Prisma.SortOrder
    }
}


export async function getContentByIdNoCache(id: string, userId?: string){
    let content: ContentProps = await db.content.findUnique({
        select: {
            id: true,
            type: true,
            compressedText: true,
            compressedPlainText: true,
            childrenTree: {
                select: {
                    authorId: true
                }
            },
            title: true,
            author: {
                select: {
                    id: true,
                    handle: true,
                    displayName: true,
                }
            },
            createdAt: true,
            _count: {
                select: {
                    reactions: true,
                    childrenTree: true
                }
            },
            claimsAuthorship: true,
            rootContentId: true,
            fakeReportsCount: true,
            uniqueViewsCount: true,
            reactions: userId ? {
                select: {
                    id: true
                },
                where: {
                    userById: userId
                }
            } : false,
            views: userId ? {
                select: {
                    id: true
                },
                where: {
                    userById: userId
                }
            } : false,
            references: {
                select: {
                    entityReferenced: {
                        select: {
                            id: true,
                            versions: {
                                select: {
                                    id: true,
                                    categories: true
                                },
                                orderBy: {
                                    createdAt: "asc"
                                }
                            }
                        }
                    }
                }
            },
            parentEntity: {
                select: {
                    id: true,
                    isPublic: true,
                    currentVersion: {
                        select: {
                            searchkeys: true
                        }
                    }
                }
            },
            accCharsAdded: true,
            contribution: true,
            charsAdded: true,
            charsDeleted: true,
            diff: true,
            currentVersionOf: {
                select: {
                    id: true
                }
            },
            categories: true,
            undos: {
                select: {
                    id: true,
                    reportsOportunism: true,
                    reportsVandalism: true,
                    authorId: true,
                    createdAt: true,
                    compressedText: true
                },
                orderBy: {
                    createdAt: "desc"
                }
            },
            contentUndoneId: true,
            reportsOportunism: true,
            reportsVandalism: true,
            ancestorContent: {
                select: {
                    id: true,
                    authorId: true
                }
            },
            childrenContents: childrenContentsQuery,
            isContentEdited: true,
            isDraft: true,
            usersMentioned: {
                select: {
                    id: true
                }
            },
            parentContents: {
                select: {
                    id: true,
                    author: {
                        select: {
                            id: true,
                        }
                    },
                    parentEntityId: true,
                    type: true,
                    title: true
                }
            },
            rootContent: {
                select: {
                    id: true,
                    author: {
                        select: {
                            id: true,
                        }
                    },
                    parentEntityId: true,
                    type: true,
                    title: true
                }
            },
        },
        where: {
            id: id,
        }
    })
    if(!content) {
        return {error: "No se encontró el contenido."}
    }
    return {content}
}

export async function getContentById(id: string, userId?: string, useCache: boolean = true): Promise<{content?: ContentProps, error?: string}> {
    if(!userId) userId = "not logged in"

    if(!useCache) return await getContentByIdNoCache(id, userId)
    
    return unstable_cache(async () => {
        return await getContentByIdNoCache(id, userId)
    }, ["content", id, userId], {
        tags: ["content", "content:"+id+":"+userId, "content:"+id],
        revalidate: revalidateEverythingTime,
    })()
}


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


export async function processNewText(text: string, title?: string) {

    let entityReferences = await findEntityReferences(text)
    if(entityReferences.error) return {error: entityReferences.error}

    const {mentions, error: mentionsError} = await findMentions(text)
    if(mentionsError) return {error: mentionsError}

    const searchkeys = await getReferencesSearchKeys()
    if(searchkeys.error) return {error: searchkeys.error}

    const {numChars, numWords, numNodes, plainText, error} = getPlainText(text)
    if(error) return {error}

    const weakReferences = findWeakEntityReferences(
        plainText+" "+title,
        searchkeys.searchkeys
    )

    return {
        numChars,
        numWords,
        numNodes,
        weakReferences,
        mentions,
        entityReferences: entityReferences.entityReferences,
        compressedPlainText: compress(plainText)
    }
}



type CommentAncestorsDataProps = {
    rootContentId?: string
    ancestorContent?: {connect: {id: string}[]}
    parentContent?: ContentProps
    error?: string
}


async function getCommentAncestorsData(parentContentId?: string) : Promise<CommentAncestorsDataProps> {
    let commentData = {}
    if(parentContentId){
        const {content, error} = await getContentById(parentContentId)
        if(error) return {error}

        commentData = {
            rootContentId: content.rootContent != undefined ? content.rootContent.id : content.id,
            ancestorContent: {
                connect: [...content.ancestorContent, {id: content.id}]
            },
            parentContents: {
                connect: [{id: parentContentId}]
            },
            parentContent: content
        }
    }
    return commentData
}


export async function notifyAncestors(commentId: string, commentAncestorsData: CommentAncestorsDataProps, userId: string){
    let ancestorAuthors = new Set<string>()

    const parentContent = commentAncestorsData.parentContent

    for(let i = 0; i < parentContent.ancestorContent.length; i++){
        ancestorAuthors.add(parentContent.ancestorContent[i].authorId)
    }
    ancestorAuthors.delete(parentContent.author.id)
    ancestorAuthors.delete(userId)

    const ancestorAuthorsArray = Array.from(ancestorAuthors)

    for(let i = 0; i < ancestorAuthorsArray.length; i++){
        try {
            await createNotification(
                userId,
                ancestorAuthorsArray[i],
                "CommentToComment",
                commentId,
                undefined
            )
        } catch {
            return {error: "Error al notificar a otros usuarios."}
        }
    }
    if(parentContent.author.id != userId){
        try {
        await createNotification(
            userId,
            parentContent.author.id,
            "Comment",
            commentId,
            undefined
        )
        } catch {
            return {error: "Error al notificar al autor del contenido comentado."}
        }
    }

    return {}
}


export async function notifyNewPost(
    newContentId: string, 
    commentAncestorsData: CommentAncestorsDataProps,
    userId: string,
    mentions: {id: string}[],
    type: ContentType
){
    const res1 = await notifyMentions(mentions, newContentId, userId)
    if(res1.error) return {error: res1.error}
    
    if(type == "Comment" || type == "FakeNewsReport"){
        const res2 = await notifyAncestors(newContentId, commentAncestorsData, userId)
        if(res2.error) return {error: res2.error}
    }

    return {}
}


export async function createComment(compressedText: string, userId: string, parentContentId?: string, parentEntityId?: string){
    return await createPost(compressedText, "Comment", false, userId, undefined, parentContentId, parentEntityId)
}

export async function createFakeNewsReport(compressedText: string, userId: string, parentContentId?: string, parentEntityId?: string){
    return await createPost(compressedText, "FakeNewsReport", false, userId, undefined, parentContentId, parentEntityId)
}


export async function incrementFakeNewsCounter(contentId: string){
    try {
        await db.content.update({
            data: {
                fakeReportsCount: {
                    increment: 1
                }
            },
            where: {
                id: contentId
            }
        })
    } catch {
        return {error: "Error al agregar el reporte."}
    }
    revalidateTag("content:"+contentId)
    return {}
}


type NewPostProps = {
    id?: string,
    type?: ContentType,
    createdAt?: Date | string,
    _count?: {childrenTree: number}
    error?: string
}


export async function createPost(
    compressedText: string, type: ContentType, isDraft: boolean, userId: string, title?: string, parentContentId?: string, parentEntityId?: string
): Promise<{result?: CommentProps, error?: string}> {
    const text = decompress(compressedText)
    const processed = await processNewText(text)
    if(processed.error) return {error: processed.error}

    const {error, parentContent, ...commentData} = await getCommentAncestorsData(parentContentId)
    if(error) return {error}

    const references = [] // to do: implement

    let result
    try {
        result = await db.content.create({
            data: {
                compressedText: compressedText,
                compressedPlainText: processed.compressedPlainText,
                authorId: userId,
                type: type,
                isDraft: isDraft,
                title: title,
                ...commentData,
                numNodes: processed.numNodes,
                numWords: processed.numWords,
                numChars: processed.numChars,
                references: {
                    create: references
                },
                usersMentioned: {
                    connect: processed.mentions
                },
                parentEntityId: parentEntityId
            },
        })
    } catch (error) {
        console.log("Error:", error)
        console.log("userId", userId)
        return {error: "Error al crear el contenido."}
    }
    
    if(!isDraft){
        const res = await notifyNewPost(
            result.id, {parentContent, ...commentData}, userId, processed.mentions, type
        )
        if(res.error) return {error: res.error}

        if(type == "FakeNewsReport"){
            const {error} = await incrementFakeNewsCounter(parentContentId)   
            if(error) return {error}
        }
        if(parentEntityId)
            revalidateTag("entity:"+parentEntityId)
    
        revalidateTag("repliesFeed:"+userId)
        revalidateTag("content:"+parentContentId)
        revalidateTag("feed")
        revalidateTag("routeFollowingFeed")
        revalidateTag("profileFeed:"+userId)
        if(type == "Post")
            revalidateTag("userContents:"+userId)
        revalidateReferences(processed.entityReferences)

    } else {
        revalidateTag("drafts:"+userId)
    }

    return {
        result: {
            id: result.id,
            type: result.type,
            createdAt: result.createdAt,
            reactions: [],
            uniqueViewsCount: 0,
            author: {id: userId},
            childrenTree: []
        }
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

export async function findEntityReferences(text: string): Promise<{error?: string, entityReferences?: {id: string}[]}>{
    const {entities, error} = await getEntities()
    if(error) return {error: error}

    return {entityReferences: await findEntityReferencesFromEntities(text, entities)}
}


export async function findMentions(text: string){
    const {users, error} = await getUsers()
    if(error) return {error}

    return {mentions: findMentionsFromUsers(text, users)}
}


export async function updateContent(compressedText: string, contentId: string, userId: string, title?: string) {
    const text = decompress(compressedText)
    const {error: processError, entityReferences, weakReferences, mentions, ...processed} = await processNewText(text)
    if(processError) return {error: processError}

    const {content, error: getContentError} = await getContentById(contentId)
    if(getContentError) return {error: getContentError}

    try {
        await db.content.update({
            where: {
                id: contentId
            },
            data: {
                compressedText: compressedText,
                ...processed,
                title: title,
                references: {
                    create: []
                },
                usersMentioned: {
                    connect: mentions
                },
                isContentEdited: content && !content.isDraft
            }
        })
    } catch {
        return {error: "Error al actualizar el contenido."}
    }

    if(!content.isDraft){
        const {error} = await notifyMentions(mentions, contentId, userId, true)
        if(error) return {error: error}

        revalidateReferences(entityReferences)
    }

    revalidateTag("content:"+contentId)
    return {}
}


export async function publishDraft(compressedText: string, contentId: string, userId: string, isPublished: boolean, title?: string) {
    const {error} = await updateContent(compressedText, contentId, userId, title)
    if(error) return {error}

    try {
        await db.content.update({
            where: {
                id: contentId
            },
            data: {
                isDraft: false,
                createdAt: isPublished ? undefined : new Date(),
                isContentEdited: isPublished
            }
        })
    } catch {
        return {error: "Error al publicar el borrador."}
    }

    revalidateTag("content:"+contentId)
    revalidateTag("feed")
    revalidateTag("routeFollowingFeed")
    revalidateTag("profileFeed:"+userId)
    return {}
}


// TO DO: Atómico
export const addLike = async (id: string, userId: string, entityId?: string) => {
    const {content, error} = await getContentById(id, userId)
    if(error) return {error}

    if(!content.reactions || content.reactions.length == 0){
        let reaction = null
        try {
            if(entityId){
                reaction = await db.reaction.create({
                    data: {
                        userById: userId,
                        contentId: id,
                        entityId: entityId
                    },
                })
            } else {
                reaction = await db.reaction.create({
                    data: {
                        userById: userId,
                        contentId: id
                    },
                })
            }
        } catch {
            return {error: "Error al agregar el voto hacia arriba."}
        }

        revalidateTag("content:"+id)
        if(entityId)
            revalidateTag("entity:"+entityId)

        if(content.type == "FastPost" || content.type == "Post"){
            revalidateTag("feed")
        }
        
        const {error} = await createNotification(
            userId,
            content.author.id,
            "Reaction",
            content.id,
            reaction.id
        )
        if(error) return {error}
    }
    return {}
}


export const removeLike = async (id: string, userId: string, entityId?: string) => {
    try {
        await db.reaction.deleteMany({
            where: { 
                AND: [
                    {contentId: id},
                    {userById: userId}
                ]
            }
        })
    } catch {
        return {error: "Error al remover el voto hacia arriba."}
    }

    revalidateTag("content:"+id)
    if(entityId)
        revalidateTag("entity:"+entityId)
    
    return {}
}



export const addView = async (id: string, userId: string) => {
    const {content, error} = await getContentById(id)
    if(error) return {error}

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
    
    if(content.parentEntity.id == "Cabildo_Abierto"){ // && !exists
        revalidateTag("user:"+userId)
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


export async function notifyAllMentions(){
    const notifications = await db.notification.findMany({
        where: {
            type: "Mention"
        }
    })

    const contents = await db.content.findMany({
        select: {
            id: true,
            authorId: true,
            usersMentioned: {
                select: {
                    id: true
                }
            },
            compressedText: true
        },
        where: {
            isDraft: false,
            visible: true,
            type: {
                notIn: ["UndoEntityContent"]
            }
        }
    })

    for(let i = 0; i < contents.length; i++){
        const {mentions, error} = await findMentions(decompress(contents[i].compressedText))
        if(error) return {error}

        if(mentions.length != contents[i].usersMentioned.length){
            console.log("actualizando menciones de", contents[i].id, "escrito por", contents[i].authorId)
            console.log("nuevas menciones", mentions)
            await db.content.update({
                data: {
                    usersMentioned: {
                        connect: mentions
                    }
                },
                where: {
                    id: contents[i].id
                }
            })
        }
        if(mentions.length > 0){
            
            console.log("actualizando notificaciones de", contents[i].id, "escrito por", contents[i].authorId)
            console.log("nuevas menciones", mentions)
            for(let j = 0; j < mentions.length; j++){
                if(!notifications.some((n) => (n.contentId == contents[i].id && n.userNotifiedId == mentions[j].id))){
                    await createNotification(
                        contents[i].authorId,
                        mentions[j].id,
                        "Mention",
                        contents[i].id
                    )
                }
            }
        }
    }
}


export async function deleteUser(userId: string){
    await db.reaction.deleteMany({
        where: {
            userById: userId
        }
    })
    await db.notification.deleteMany({
        where: {
            userById: userId
        }
    })
    await db.notification.deleteMany({
        where: {
            userNotifiedId: userId
        }
    })
    await db.view.deleteMany({
        where: {
            userById: userId
        }
    })
    await db.user.delete({
        where: {
            id: userId
        }
    })
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