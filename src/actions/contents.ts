'use server'

import { revalidateTag, unstable_cache } from "next/cache";
import { ContentType, NotificationType } from "@prisma/client";
import { db } from "../db";
import { revalidateEverythingTime } from "./utils";
import { getEntities } from "./entities";
import { ContentProps } from "../app/lib/definitions";
import { getUserId } from "./users";


export async function getContentById(id: string, userId?: string): Promise<ContentProps> {
    if(!userId) userId = await getUserId()
    return unstable_cache(async () => {
        let content: any = await db.content.findUnique({
            select: {
                id: true,
                type: true,
                text: true,
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
                childrenContents: {
                    select: {
                        id: true,
                        createdAt: true,
                        type: true,
                        currentVersionOf: {
                            select: {
                                id: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                },
                parentContents: {
                    select: {id: true}
                },
                entityReferences: {
                    select: {
                        id: true,
                        versions: {
                            select: {
                                id: true,
                                categories: true,
                                isUndo: true,
                                undoMessage: true
                            },
                            orderBy: {
                                createdAt: "asc"
                            }
                        }
                    }
                },
                parentEntityId: true,
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
            },
            where: {
                id: id,
            }
        })
        if(!content) return undefined
        if(!content.reactions) content.reactions = []
        if(!content.views) content.views = []

        return content
    }, ["content", id, userId], {
        tags: ["content", "content:"+id+":"+userId, "content:"+id],
        revalidate: revalidateEverythingTime,
    })()
}


export async function getContentStaticById(id: string): Promise<ContentProps> {
    return unstable_cache(async () => {
        let content: any = await db.content.findUnique({
            select: {
                id: true,
                text: true,
                parentEntityId: true,
                parentContents: {
                    select: {id: true}
                },
                accCharsAdded: true,
                contribution: true,
                charsAdded: true,
                charsDeleted: true,
                author: {select: {id: true, name: true}},
                rootContentId: true,
                ancestorContent: {select: {id: true}}
            },
            where: {
                id: id,
            }
        })

        return content ? content : undefined
    }, ["contentStatic", id], {
        tags: ["contentStatic", "contentStatic:"+id],
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


export async function createComment(text: string, parentContentId: string, userId: string) {
    let references = await findReferences(text)

    const parentContent = await getContentStaticById(parentContentId)
    const parentEntityId = parentContent.parentEntityId
    const comment = await db.content.create({
        data: {
            text: text,
            authorId: userId,
            type: "Comment",
            parentContents: {
                connect: [{id: parentContentId}]
            },
            entityReferences: {
                connect: references
            },
            rootContentId: parentContent.rootContentId ? parentContent.rootContentId : parentContent.id,
            ancestorContent: {
                connect: [...parentContent.ancestorContent, {id: parentContent.id}]
            },
            uniqueViewsCount: 0,
            fakeReportsCount: 0
        },
    })

    revalidateTag("repliesFeed:"+userId)
    revalidateTag("content:"+parentContentId)
    if(parentEntityId)
        revalidateTag("entity:"+parentEntityId)

    if(parentContent.author.id != userId){
        createNotification(userId, parentContent.author.id, "Comment", comment.id, undefined)
    }
    return comment
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

export async function findReferences(text: string){
    function findReferencesInNode(node: any): {id: string}[] {
        let references: {id: string}[] = []
        if(node.type === "link"){
            if(node.url.startsWith("/articulo/")){
                const id = node.url.split("/articulo/")[1]
                references.push({id: id})
            }
        }
        if(node.children){
            for(let i = 0; i < node.children.length; i++) {
                const childRefs = findReferencesInNode(node.children[i])
                childRefs.forEach((x) => {references.push(x)})
            }
        }
        return references
    }
    
    if(text.length == 0){
        return []
    }
    const json  = JSON.parse(text)

    let references: {id: string}[] = findReferencesInNode(json.root)
    
    const entities = await getEntities()

    references = references.filter(({id}) => (entities.some((e) => (e.id == id))))

    return references
}


export async function createPost(text: string, postType: ContentType, isDraft: boolean, userId: string, title?: string) {
    let references = await findReferences(text)

    const result = await db.content.create({
        data: {
            text: text,
            authorId: userId,
            type: postType,
            isDraft: isDraft,
            title: title,
            entityReferences: {
                connect: references
            },
            fakeReportsCount: 0,
            uniqueViewsCount: 0
        },
    })

    revalidateTag("feed")
    revalidateTag("followingFeed")
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


export async function updateContent(text: string, contentId: string, title?: string) {

    let references = await findReferences(text)
    const result = await db.content.update({
        where: {
            id: contentId
        },
        data: {
            text: text,
            title: title,
            entityReferences: {
                connect: references
            }
        }
    })

    revalidateTag("content:"+contentId)
    return result
}


export async function publishDraft(text: string, contentId: string, userId: string, title?: string) {

    let references = await findReferences(text)
    
    const result = await db.content.update({
        where: {
            id: contentId
        },
        data: {
            text: text,
            isDraft: false,
            createdAt: new Date(),
            title: title,
            entityReferences: {
                connect: references
            }
        }
    })
    revalidateTag("content:"+contentId)
    revalidateTag("feed")
    revalidateTag("followingFeed")
    revalidateTag("profileFeed:"+userId)
    revalidateTag("drafts:"+userId)
    return result
}


export async function createFakeNewsReport(text: string, parentContentId: string, userId: string) {
    let references = await findReferences(text)

    const report = await db.content.create({
        data: {
            text: text,
            authorId: userId,
            type: "FakeNewsReport",
            parentContents: {
                connect: [{id: parentContentId}]
            },
            entityReferences: {
                connect: references
            },
            uniqueViewsCount: 0,
            fakeReportsCount: 0
        },
    })
    revalidateTag("content:"+parentContentId)
    revalidateTag("comments:"+parentContentId)
    revalidateTag("repliesFeed:"+userId)
    return report
}


// TO DO: Esto debería ser atómico
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
        
        createNotification(userId, content.author.id, "Reaction", content.id, reaction.id)
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
    revalidateTag("content:"+id)
}


// TO DO: Esto debería ser atómico
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
    revalidateTag("content:"+id)
    revalidateTag("entity:"+entityId)
}


export async function getLastKNotifications(k: number){
    const userId = await getUserId()

    return await unstable_cache(async () => {
        const notifications = await db.notification.findMany({
            select: {
                id: true,
                viewed: true,
                contentId: true,
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
        let unseen = 0
        for(let i = 0; i < notifications.length; i++){
            if(!notifications[i].viewed) unseen ++
        }
        return notifications.slice(0, Math.max(unseen, k))
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