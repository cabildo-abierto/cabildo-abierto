'use server'

import { revalidateTag, unstable_cache } from "next/cache";
import { ContentType, NotificationType } from "@prisma/client";
import { db } from "../db";
import { revalidateEverythingTime } from "./utils";
import { getEntities } from "./entities";
import { ContentProps } from "../app/lib/definitions";
import { getUser, getUserId, getUsers } from "./users";
import { findEntityReferencesFromEntities, findWeakEntityReferences, getPlainText } from "../components/utils";
import { compress, decompress } from "../components/compression";
import { getReferencesSearchKeys } from "./references";



export async function getContentByIdNoCache(id: string, userId?: string){
    if(!userId) userId = await getUserId()
    let content: ContentProps = await db.content.findUnique({
        select: {
            id: true,
            type: true,
            compressedText: true,
            title: true,
            author: {
                select: {
                    id: true,
                    name: true,
                }
            },
            createdAt: true,
            _count: {
                select: {
                    reactions: true,
                    childrenTree: true
                }
            },
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
            parentContents: {
                select: {id: true}
            },
            entityReferences: {
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
            },
            parentEntityId: true, // TO DO: Eliminar
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
            stallPaymentUntil: true,
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
            childrenContents: {
                select: {
                    id: true,
                    createdAt: true,
                    type: true,
                    _count: {
                        select: {
                            childrenTree: true
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc"
                }
            },
            isContentEdited: true,
            isDraft: true
        },
        where: {
            id: id,
        }
    })
    if(!content) return undefined
    if(!content.reactions) content.reactions = []
    if(!content.views) content.views = []
    return content
}

export async function getContentById(id: string, userId?: string, useCache: boolean = true): Promise<ContentProps> {
    if(!useCache) return await getContentByIdNoCache(id, userId)
    if(!userId) userId = await getUserId()
    if(!userId) userId = "not logged in"
    return unstable_cache(async () => {
        return await getContentByIdNoCache(id, userId)
    }, ["content", id, userId], {
        tags: ["content", "content:"+id+":"+userId, "content:"+id],
        revalidate: revalidateEverythingTime,
    })()
}


export const getContentFakeNewsCount = (contentId: string) => {
    return unstable_cache(async () => {
        let content = await db.content.findUnique({
            select: {
                _count: {
                    select: {
                        childrenContents: {
                            where: {
                                type: "FakeNewsReport"
                            }
                        }
                    }
                },
            },
            where: {
                id: contentId,
            }
        })
        return content?._count.childrenContents
    }, ["fake-news", contentId], {
        revalidate: revalidateEverythingTime,
        tags: ["fake-news", "views:"+contentId]})()    
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
    
    await db.notification.createMany({
        data: data
    })

    for(let i = 0; i < mentions.length; i++){
        revalidateTag("notifications:"+mentions[i].id)
        revalidateTag("user:"+mentions[i].id)
    }
}


export async function createComment(compressedText: string, parentContentId: string, userId: string) {
    const text = decompress(compressedText)
    let references = await findEntityReferences(text)
    const mentions = await findMentions(text)

    
    const parentContent = await getContentById(parentContentId)
    const parentEntityId = parentContent.parentEntityId

    const {numChars, numWords, numNodes, plainText} = getPlainText(text)
    const searchKeys = await getReferencesSearchKeys()
    const weakReferences = await findWeakEntityReferences(plainText, searchKeys)

    const comment = await db.content.create({
        data: {
            compressedText: compressedText,
            authorId: userId,
            type: "Comment",
            parentContents: {
                connect: [{id: parentContentId}]
            },
            entityReferences: {
                connect: references
            },
            weakReferences: {
                connect: weakReferences
            },
            usersMentioned: {
                connect: mentions
            },
            rootContentId: parentContent.rootContentId ? parentContent.rootContentId : parentContent.id,
            ancestorContent: {
                connect: [...parentContent.ancestorContent, {id: parentContent.id}]
            },
            numChars: numChars,
            numWords: numWords,
            numNodes: numNodes,
            compressedPlainText: compress(plainText)
        },
    })
    await notifyMentions(mentions, comment.id, userId)
    for(let i = 0; i < weakReferences.length; i++){
        revalidateTag("entity:"+weakReferences[i].id)
    }

    let ancestorAuthors = new Set<string>()

    for(let i = 0; i < parentContent.ancestorContent.length; i++){
        ancestorAuthors.add(parentContent.ancestorContent[i].authorId)
    }
    ancestorAuthors.delete(parentContent.author.id)
    ancestorAuthors.delete(userId)

    const ancestorAuthorsArray = Array.from(ancestorAuthors)

    for(let i = 0; i < ancestorAuthorsArray.length; i++){
        await createNotification(
            userId,
            ancestorAuthorsArray[i],
            "CommentToComment",
            comment.id,
            undefined
        )
    }
    if(parentContent.author.id != userId){
        await createNotification(
            userId,
            parentContent.author.id,
            "Comment",
            comment.id,
            undefined
        )
    }
    revalidateTag("repliesFeed:"+userId)
    revalidateTag("content:"+parentContentId)
    revalidateTag("contentComments:"+parentContentId)
    if(parentEntityId)
        revalidateTag("entity:"+parentEntityId)
    return {
        id: comment.id,
        type: comment.type,
        createdAt: comment.createdAt,
        _count: {childrenTree: 0}
    }
}

export async function createNotification(
    userById: string, userNotifiedId: string, notificationType: NotificationType,
    contentId?: string, reactionId?: string){
        
    await db.notification.create({
        data: {
            userById: userById,
            userNotifiedId: userNotifiedId,
            contentId: contentId,
            reactionId: reactionId,
            type: notificationType
        }
    })
    revalidateTag("notifications:"+userNotifiedId)
    revalidateTag("user:"+userNotifiedId)
}

export async function findEntityReferences(text: string){
    return await findEntityReferencesFromEntities(text, await getEntities())
}


export async function findMentions(text: string){
    function findMentionsInNode(node: any): {id: string}[] {
        let references: {id: string}[] = []
        if(node.type === "custom-beautifulMention"){
            references.push({id: node.data.id})
        }
        if(node.children){
            for(let i = 0; i < node.children.length; i++) {
                const childRefs = findMentionsInNode(node.children[i])
                childRefs.forEach((x) => {references.push(x)})
            }
        }
        return references
    }
    
    if(text.length == 0 || text == "Este artículo está vacío!"){
        return []
    }
    let json = null
    try {
        json = JSON.parse(text)
    } catch {
        console.log("failed parsing", text)
    }
    if(!json) return null

    let references: {id: string}[] = findMentionsInNode(json.root)
    
    const users = await getUsers()

    references = references.filter(({id}) => (users.some((e) => (e.id == id))))

    return references
}


export async function createPost(compressedText: string, postType: ContentType, isDraft: boolean, userId: string, title?: string) {
    //await new Promise((resolve) => setTimeout(resolve, 3000));
    //return null
    const text = decompress(compressedText)
    let references = await findEntityReferences(text)
    const mentions = await findMentions(text)

    const {numChars, numWords, numNodes, plainText} = getPlainText(text)
    const searchKeys = await getReferencesSearchKeys()
    const weakReferences = await findWeakEntityReferences(plainText+" "+title, searchKeys)

    const result = await db.content.create({
        data: {
            compressedText: compressedText,
            authorId: userId,
            type: postType,
            isDraft: isDraft,
            title: title,
            entityReferences: {
                connect: references
            },
            numChars: numChars,
            numWords: numWords,
            numNodes: numNodes,
            compressedPlainText: compress(plainText),
            usersMentioned: {
                connect: mentions
            },
            weakReferences: {
                connect: weakReferences
            }
        },
    })
    await notifyMentions(mentions, result.id, userId)

    revalidateTag("routeFeed")
    revalidateTag("routeFollowingFeed")
    revalidateTag("profileFeed:"+userId)
    if(postType == "Post")
        revalidateTag("userContents:"+userId)
    if(isDraft)
        revalidateTag("drafts:"+userId)
    references.forEach(({id}) => {
        revalidateTag("entity:"+id)
    })
    return result
}


export async function updateContent(compressedText: string, contentId: string, title?: string) {
    //await new Promise((resolve) => setTimeout(resolve, 3000));
    //return null
    const text = decompress(compressedText)
    let references = await findEntityReferences(text)
    const mentions = await findMentions(text)
    const userId = await getUserId()

    const currentContent = await getContentById(contentId)

    const {numChars, numWords, numNodes, plainText} = getPlainText(text)
    const searchKeys = await getReferencesSearchKeys()
    const weakReferences = await findWeakEntityReferences(plainText+" "+title, searchKeys)

    const result = await db.content.update({
        where: {
            id: contentId
        },
        data: {
            compressedText: compressedText,
            compressedPlainText: compress(plainText),
            title: title,
            numChars: numChars,
            numWords: numWords,
            numNodes: numNodes,
            entityReferences: {
                connect: references
            },
            usersMentioned: {
                connect: mentions
            },
            weakReferences: {
                connect: weakReferences
            },
            isContentEdited: currentContent && !currentContent.isDraft
        }
    })

    await notifyMentions(mentions, contentId, userId, true)
    
    revalidateTag("content:"+contentId)
    return true
}


export async function publishDraft(compressedText: string, contentId: string, userId: string, title?: string) {
    const text = decompress(compressedText)
    let references = await findEntityReferences(text)
    const mentions = await findMentions(text)
    
    const {numChars, numWords, numNodes, plainText} = getPlainText(text)
    const searchKeys = await getReferencesSearchKeys()
    const weakReferences = await findWeakEntityReferences(plainText+" "+title, searchKeys)
    const result = await db.content.update({
        where: {
            id: contentId
        },
        data: {
            compressedText: compressedText,
            compressedPlainText: compress(plainText),
            isDraft: false,
            createdAt: new Date(),
            title: title,
            entityReferences: {
                connect: references
            },
            usersMentioned: {
                connect: mentions
            },
            weakReferences: {
                connect: weakReferences
            },
            uniqueViewsCount: 0,
            fakeReportsCount: 0,
            numChars: numChars,
            numWords: numWords,
            numNodes: numNodes,
        }
    })
    await notifyMentions(mentions, contentId, userId)
    revalidateTag("content:"+contentId)
    revalidateTag("routeFeed")
    revalidateTag("routeFollowingFeed")
    revalidateTag("profileFeed:"+userId)
    revalidateTag("drafts:"+userId)
    return result
}


export async function createFakeNewsReport(compressedText: string, parentContentId: string, userId: string) {
    const text = decompress(compressedText)
    let references = await findEntityReferences(text)
    const mentions = await findMentions(text)

    const {numChars, numWords, numNodes, plainText} = getPlainText(text)
    const searchKeys = await getReferencesSearchKeys()
    const weakReferences = await findWeakEntityReferences(plainText, searchKeys)

    const report = await db.content.create({
        data: {
            compressedText: compressedText,
            compressedPlainText: compress(plainText),
            authorId: userId,
            type: "FakeNewsReport",
            parentContents: {
                connect: [{id: parentContentId}]
            },
            entityReferences: {
                connect: references
            },
            usersMentioned: {
                connect: mentions
            },
            weakReferences: {
                connect: weakReferences
            },
            uniqueViewsCount: 0,
            fakeReportsCount: 0,
            numChars: numChars,
            numWords: numWords,
            numNodes: numNodes,
        },
    })
    revalidateTag("content:"+parentContentId)
    revalidateTag("comments:"+parentContentId)
    revalidateTag("repliesFeed:"+userId)
    return report
}


// TO DO: Atómico
export const addLike = async (id: string, userId: string, entityId?: string) => {
    const exists = await db.reaction.findFirst({
        where: {
            userById: userId,
            contentId: id
        }
    })
    if(!exists){
        let reaction = null
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

        revalidateTag("content:"+id)
        if(entityId)
            revalidateTag("entity:"+entityId)
        const content = await getContentById(id)
        
        await createNotification(
            userId,
            content.author.id,
            "Reaction",
            content.id,
            reaction.id
        )

        return {liked: true, likeCount: content._count.reactions}
    }
    const content = await getContentById(id)
    return {liked: true, likeCount: content._count.reactions}
}


export const removeLike = async (id: string, userId: string, entityId?: string) => {
    await db.reaction.deleteMany({
        where: { 
            AND: [
                {contentId: id},
                {userById: userId}
            ]
        }
    })
    revalidateTag("content:"+id)
    if(entityId)
        revalidateTag("entity:"+entityId)
    const content = await getContentById(id)
    return {liked: false, likeCount: content._count.reactions}
}


export const addView = async (id: string, userId: string) => {
    const content = await getContentById(id)

    const exists = await db.view.findMany({
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

    function olderThan(seconds: number){
        const dateLast = new Date(exists[exists.length-1].createdAt).getTime()
        const currentDate = new Date().getTime()
        const difference = (currentDate - dateLast) / 1000
        return difference > seconds
    }

    if(exists.length == 0 || olderThan(3600)){
        await db.view.create({
            data: {
                userById: userId,
                contentId: id
            },
        })
    }

    if(exists.length == 0){
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
    }
    
    if(content.parentEntityId == "Cabildo_Abierto"){ // && !exists
        revalidateTag("user:"+userId)
    }

    revalidateTag("content:"+id)
}


// TO DO: Atómico
export const addViewToEntityContent = async (id: string, userId: string, entityId: string) => {
    const exists = await db.view.findMany({
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

    const existsInEntity = await db.view.findMany({
        select: {
            createdAt: true
        },
        where: {
            AND: [{
                userById: userId
            },{
                entityId: entityId
            }]
        },
        orderBy: {
            createdAt: "asc"
        }
    })

    function olderThan(seconds: number){
        const dateLast = new Date(exists[exists.length-1].createdAt).getTime()
        const currentDate = new Date().getTime()
        const difference = (currentDate - dateLast) / 1000
        return difference > seconds
    }

    if(exists.length == 0 || olderThan(3600)){
        await db.view.create({
            data: {
                userById: userId,
                contentId: id,
                entityId: entityId
            },
        })
    }

    if(exists.length == 0){
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
    }
    if(existsInEntity.length == 0){
        await db.entity.update({
            data: {
                uniqueViewsCount: {
                    increment: 1
                }
            },
            where: {
                id: entityId
            }
        })
    }
    if(entityId == "Cabildo_Abierto"){
        revalidateTag("user:"+userId)
    }
    revalidateTag("content:"+id)
    revalidateTag("entity:"+entityId)
}


export async function recordBatchViews(views){
    for(let i = 0; i < views.length; i++){
        if(views[i].contentType == "FastPost"){
            await addView(views[i].contentId, views[i].userId)
        } else {
            await addViewToEntityContent(views[i].contentId, views[i].userId, views[i].parentEntityId)
        }
    }
}


export async function getLastKNotifications(k: number){
    const userId = await getUserId()
    if(!userId) return null

    return await unstable_cache(async () => {
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
    }, ["notifications", userId], {
        tags: ["notifications", "notifications:"+userId],
        revalidate: revalidateEverythingTime,
    })()
}


export async function markNotificationViewed(id: string){
    const {userNotifiedId} = await db.notification.update({
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
    revalidateTag("notifications:"+userNotifiedId)
    revalidateTag("user:"+userNotifiedId)
}


export async function compressContents(){
    const contents = await db.content.findMany({
        select: {
            id: true,
            text: true,
            plainText: true
        }
    })
    console.log("got the contents")
    for(let i = 0; i < contents.length; i++){
        console.log("updating content", i)
        const c = contents[i]
        try {
            const compressedText = compress(c.text)
            const compressedPlainText = compress(c.plainText)
            await db.content.update({
                data: {
                    compressedText: compressedText,
                    compressedPlainText: compressedPlainText
                },
                where: {
                    id: c.id
                }
            })
        } catch {
            console.log("couldn't compress", c.id)
        }
    }
}


export async function compressContent(id: string){
    const c = await db.content.findUnique({
        select: {
            id: true,
            text: true,
            plainText: true
        },
        where: {
            id: id
        }
    })
    const t1 = Date.now()
    const compressedText = compress(c.text)
    const t2 = Date.now()

    console.log("compression time", t2-t1)
    //const compressedPlainText = compress(compress(c.plainText))

    const t3 = Date.now()
    const decompressedText = decompress(compressedText)
    const t4 = Date.now()

    console.log("decompression time", t4-t3)

    console.log("equal", decompressedText == c.text)
    console.log("lengths", decompressedText.length, c.text.length)
    console.log("compressed length", compressedText.length)

    console.log("plain text length", c.plainText.length)
    /*await db.content.update({
        data: {
            compressedText: compressedText,
            compressedPlainText: compressedPlainText
        },
        where: {
            id: c.id
        }
    })*/
}


export async function decompressContents(){
    const contents = await db.content.findMany({
        select: {
            id: true,
            text: true,
            plainText: true,
            compressedText: true,
            compressedPlainText: true
        },
        where: {
            numWords: {
                lte: 30
            }
        }
    })
    console.log("got the contents")
    for(let i = 0; i < contents.length; i++){
        console.log("updating content", i)
        const c = contents[i]
        console.log("plain text", c.plainText)
        if(c.plainText != null && c.plainText.length > 0) continue
        try {
            const decompressedText = decompress(c.compressedText)
            const decompressedPlainText = decompress(c.compressedPlainText)
            await db.content.update({
                data: {
                    text: decompressedText,
                    plainText: decompressedPlainText
                },
                where: {
                    id: c.id
                }
            })
        } catch {
            console.log("couldn't decompress", c.id)
        }
    }
}


export async function decompressContent(contentId: string){
    const c = await db.content.findUnique({
        select: {
            id: true,
            text: true,
            plainText: true,
            compressedText: true,
            compressedPlainText: true
        },
        where: {
            id: contentId
        }
    })
    try {
        const decompressedText = decompress(c.compressedText)
        const decompressedPlainText = decompress(c.compressedPlainText)
        await db.content.update({
            data: {
                text: decompressedText,
                plainText: decompressedPlainText
            },
            where: {
                id: c.id
            }
        })
    } catch {
        console.log("couldn't decompress", c.id)
    }
}


export async function takeAuthorship(contentId: string) {
    const content = await getContentById(contentId)
    const user = await getUser()
    if(!user || user.editorStatus != "Administrator" || user.id == content.author.id){
        return null
    }
    await db.content.update({
        data: {
            authorId: user.id
        },
        where: {
            id: contentId
        }
    })
    revalidateTag("content:"+contentId)
    revalidateTag("repliesFeed:"+user.id)
    revalidateTag("repliesFeed:"+content.author.id)
    revalidateTag("profileFeed:"+user.id)
    revalidateTag("profileFeed:"+content.author.id)
    revalidateTag("editsFeed:"+user.id)
    revalidateTag("editsFeed:"+content.author.id)
    if(content.parentEntityId){
        revalidateTag("entity:"+content.parentEntityId)
    }
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
        const mentions = await findMentions(decompress(contents[i].compressedText))
        if(!mentions){
            return null
        }
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