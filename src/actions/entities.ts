'use server'

import { revalidateTag, unstable_cache } from "next/cache";
import { db } from "../db";
import { findMentions, findReferences, getContentById, notifyMentions } from "./contents";
import { revalidateEverythingTime } from "./utils";
import { charDiffFromJSONString } from "../components/diff";
import { EntityProps, SmallEntityProps } from "../app/lib/definitions";
import { currentVersionContent, entityInRoute, findWeakReferences, getPlainText, hasEditPermission, isPartOfContent, isUndo } from "../components/utils";
import { EditorStatus } from "@prisma/client";
import { getUserById } from "./users";
import { compress, decompress } from "../components/compression";
import { getReferencesSearchKeys, updateAllWeakReferences, updateEntityWeakReferences } from "./references";



export async function createEntity(name: string, userId: string){
    const entityId = encodeURIComponent(name.replaceAll(" ", "_"))
    const exists = await db.entity.findFirst({
      where: {id: entityId}
    })
    if(exists) return {error: "Ya existe ese tema"}
  
    await db.entity.create({
      data: {
        name: name,
        id: entityId,
      }
    })
  
    const content = await db.content.create({
      data: {
        text: "",
        authorId: userId,
        type: "EntityContent",
        parentEntityId: entityId,
        uniqueViewsCount: 0,
        fakeReportsCount: 0,
        contribution: JSON.stringify([]),
        charsAdded: 0,
        charsDeleted: 0,
        accCharsAdded: 0,
        diff: JSON.stringify([{matches: [], common: [], perfectMatches: []}])
      }
    })

    await db.entity.update({
        data: {
            currentVersionId: content.id,
        }, where: {
            id: entityId
        }
    })

    await updateEntityWeakReferences(entityId)

    revalidateTag("entities")
    revalidateTag("editsFeed:"+userId)
    revalidateTag("entity:"+entityId)
    revalidateTag("searchkeys")
    
    return {id: entityId}
}


function updateContribution(contribution: [string, number][], charsAdded: number, newAuthor: string){
    let wasAuthor = false
    for(let i = 0; i < contribution.length; i++){
        if(contribution[i][0] == newAuthor){
            wasAuthor = true
            contribution[i][1] += charsAdded
        }
    }
    
    if(!wasAuthor){
        contribution.push([newAuthor, charsAdded])
    }
    return contribution
}


export const recomputeEntityContributions = async (entityId: string) => {

    const entity = await db.entity.findUnique({
        select: {
            versions: {
                select: {
                    compressedText: true,
                    authorId: true,
                    id: true,
                    undos: {
                        select: {
                            id: true
                        }
                    },
                    rejectedById: true,
                    confirmedById: true,
                    claimsAuthorship: true,
                    editPermission: true
                },
                orderBy: {
                    createdAt: "asc"
                }
            }
        },
        where: {
            id: entityId
        }
    })

    const texts = entity.versions.map((t) => (decompress(t.compressedText)))

    let lastContribution = JSON.stringify([[entity.versions[0].authorId, 0]])
    let lastAccCharsAdded = 0

    for(let i = 0; i < entity.versions.length; i++){
        let newData = null
        if(i == 0 || entity.versions[i].compressedText == entity.versions[i-1].compressedText || !isPartOfContent(entity.versions[i])){
            newData = {
                accCharsAdded: lastAccCharsAdded, 
                charsAdded: 0, 
                charsDeleted: 0, 
                contribution: lastContribution,
                diff: JSON.stringify({matches: [], common: [], bestMatches: []})
            }
        } else {
            const {charsAdded, charsDeleted, matches, common, perfectMatches} = charDiffFromJSONString(texts[i-1], texts[i])

            const accCharsAdded = lastAccCharsAdded + charsAdded

            const contribution: [string, number][] = JSON.parse(lastContribution)
            
            const newContribution = updateContribution(contribution, charsAdded, entity.versions[i].authorId)
        
            newData = {
                accCharsAdded: accCharsAdded, 
                charsAdded: charsAdded, 
                charsDeleted: charsDeleted, 
                contribution: JSON.stringify(newContribution),
                diff: JSON.stringify({matches: matches, common: common, perfectMatches: perfectMatches})
            }
        }

        await db.content.update({
            data: newData,
            where: {
                id: entity.versions[i].id
            }
        })
        lastContribution = newData.contribution
        lastAccCharsAdded = newData.accCharsAdded
        revalidateTag("content:"+entity.versions[i].id)
    }
    revalidateTag("entity:"+entityId)
}

  
export const updateEntity = async (entityId: string, userId: string, claimsAuthorship: boolean, editMsg: string, compressedText?: string, categories?: string, searchkeys?: string[]) => {
    const entity = await getEntityById(entityId)
    const current = currentVersionContent(entity)

    let references = []
    let text = null
    let prevText = null
    let mentions = []
    let weakReferences = []
    const contentChange = compressedText != undefined
    const categoriesChange = categories != undefined
    const searchkeysChange = searchkeys != undefined
    const currentContent = await getContentById(current.id)
    if(contentChange){
        text = decompress(compressedText)
        references = await findReferences(text)
        mentions = await findMentions(text)
        categories = current.categories
        prevText = decompress(currentContent.compressedText)
    } else {
        compressedText = currentContent.compressedText
        references = currentContent.entityReferences.map(({id}) => ({id: id}))
        weakReferences = current.weakReferences
        text = decompress(compressedText)
        prevText = text
    }

    const permission = hasEditPermission(await getUserById(userId), entity.protection)

    const {numChars, numWords, numNodes, plainText} = getPlainText(text)

    if(contentChange){
        const searchKeys = await getReferencesSearchKeys()
        weakReferences = await findWeakReferences(plainText+entity.name, searchKeys)
    }

    let {charsAdded, charsDeleted, matches, common, perfectMatches} = charDiffFromJSONString(prevText, text)

    let contribution = null
    if(!permission){
        contribution = JSON.parse(currentContent.contribution)
    } else {
        contribution = updateContribution(JSON.parse(currentContent.contribution), charsAdded, userId)
    }

    const newContent = await db.content.create({
        data: {
            compressedText: compressedText,
            compressedPlainText: compress(plainText),
            numChars: numChars,
            numWords: numWords,
            numNodes: numNodes,
            author: {
                connect: {id: userId}
            },
            type: "EntityContent",
            parentEntity: {
                connect: {id: entityId}
            },
            categories: categories,
            searchkeys: searchkeys,
            entityReferences: {
                connect: references
            },
            weakReferences: {
                connect: weakReferences
            },
            usersMentioned: {
                connect: mentions
            },
            editPermission: permission,
            claimsAuthorship: claimsAuthorship,
            currentVersionOf: permission ? {
                connect: {
                    id: entityId
                }
            } : undefined,
            editMsg: editMsg,
            accCharsAdded: currentContent.accCharsAdded + charsAdded,
            contribution: JSON.stringify(contribution),
            diff: JSON.stringify({matches: matches, common: common, perfectMatches: perfectMatches}),
            charsAdded: charsAdded,
            charsDeleted: charsDeleted
        }
    })

    if(searchkeysChange){
        await updateEntityWeakReferences(entityId)
    }

    await notifyMentions(mentions, newContent.id, userId, true)

    for(let i = 0; i < weakReferences.length; i++){
        revalidateTag("entity:"+weakReferences[i].id)
    }
    for(let i = 0; i < references.length; i++){
        revalidateTag("entity:"+references[i].id)
    }
    if(searchkeysChange){
        revalidateTag("searchkeys")
    }

    revalidateTag("entity:" + entityId)
    revalidateTag("entities")
    revalidateTag("userContents:"+userId)
    revalidateTag("editsFeed:"+userId)

    return true
}


export const updateEntityCurrentVersion = async (entityId: string) => {
    const entity = await getEntityByIdNoCache(entityId)

    let index = 0
    for(let i = 0; i < entity.versions.length; i++){
        if(!isUndo(entity.versions[i]) && (entity.versions[i].editPermission || entity.versions[i].confirmedById != null)){
            index = i
        }
    }
    await db.entity.update({
        data: {
            currentVersionId: entity.versions[index].id
        },
        where: {
            id: entityId
        }
    })
    revalidateTag("entity:"+entityId)
}


export async function extendContentStallPaymentDate(contentId: string){
    const content = await getContentById(contentId)
    await db.content.update({
        data: {
            stallPaymentUntil: content.stallPaymentDate
        },
        where: {
            id: contentId
        }
    })
    revalidateTag("content:"+contentId)
}
  
  
export const undoChange = async (entityId: string, contentId: string, versionNumber: number, message: string, userId: string, isVandalism: boolean, isOportunism: boolean) => {
    const entity = await getEntityById(entityId)
    const compressedText = compress(message)
    if(entity){
        await db.content.create({
            data: {
                type: "UndoEntityContent",
                compressedText: compressedText,
                compressedPlainText: compressedText,
                authorId: userId,
                reportsVandalism: isVandalism,
                reportsOportunism: isOportunism,
                contentUndoneId: contentId
            }
        })
        await extendContentStallPaymentDate(contentId)
        await updateEntityCurrentVersion(entityId)
        await recomputeEntityContributions(entityId)
        revalidateTag("entity:"+entityId)
        revalidateTag("content:"+contentId)
    }
    
    revalidateTag("entities")
    revalidateTag("entity:"+entityId)
}
  
  
export const deleteEntity = async (entityId: string, userId: string) => {
    console.log("deleting", entityId, "by", userId)
    await db.entity.update({
        data: {
            deleted: true,
            deletedById: userId
        },
        where: {
            id: entityId
        }
    })
  
    revalidateTag("entities")
    revalidateTag("entity:"+entityId)
}


export const deleteContent = async (contentId: string) => {
    await db.view.deleteMany({
        where: {
            contentId: contentId
        }
    })

    await db.notification.deleteMany({
        where: {
            contentId: contentId
        }
    })

    await db.noAccountVisit.deleteMany({
        where: {
            contentId: contentId
        }
    })

    await db.reaction.deleteMany({
        where: {
            contentId: contentId
        }
    })

    const content = await getContentById(contentId)

    for(let i = 0; i < content.childrenContents.length; i++){
        await deleteContent(content.childrenContents[i].id)
    }

    await db.content.delete({
        where: {
            id: contentId
        }
    })

    // habría que revalidar más tags en realidad
    revalidateTag("content:"+contentId)
}


export const deleteEntityHistory = async (entityId: string, includeLast: boolean) => {
    const entity = await getEntityById(entityId)

    for(let i = 1; i < entity.versions.length-(includeLast ? 0 : 1); i++){
        await deleteContent(entity.versions[i].id)
    }

    await updateEntityCurrentVersion(entityId)
    await recomputeEntityContributions(entityId)
    
    revalidateTag("entity:"+entityId)
    revalidateTag("entities")
}


// TO DO: Terminar de implementar
export const renameEntity = async (entityId: string, userId: string, newName: string) => {
    const newEntityId = encodeURIComponent(newName.replaceAll(" ", "_"))
    await db.entity.update({
        data: {
            name: newName,
            id: newEntityId
        },
        where: {
            id: entityId
        }
    })
  
    revalidateTag("entities")
    revalidateTag("entity:"+entityId)
}



export const makeEntityPublic = async (entityId: string, value: boolean) => {
    await db.entity.update({
        data: {
            isPublic: value,
        },
        where: {
            id: entityId
        }
    })
  
    revalidateTag("entity:"+entityId)
}



export const getEntities = unstable_cache(async () => {
    let entities: SmallEntityProps[] = await db.entity.findMany({
        select: {
            id: true,
            name: true,
            protection: true,
            isPublic: true,
            uniqueViewsCount: true,
            versions: {
                select: {
                    id: true,
                    categories: true,
                    createdAt: true,
                    authorId: true,
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
                    numWords: true
                },
                orderBy: {
                    createdAt: "asc"
                }
            },
            referencedBy: {
                select: {
                    authorId: true,
                    childrenTree: {
                        select: {
                            authorId: true,
                            reactions: {
                                select: {
                                    userById: true
                                }
                            }
                        }
                    },
                    reactions: {
                        select: {
                            userById: true
                        }
                    },
                    parentEntityId: true
                },
                where: {
                    OR: [{
                        AND: [
                            {
                                type: {
                                    in: ["Post", "FastPost"]
                                }
                            },
                            {
                                isDraft: false
                            }
                        ]
                    },
                    {
                        type: {
                            notIn: ["Post", "FastPost", "EntityContent"]
                        }
                    },
                    {
                        AND: [
                            {
                                type: "EntityContent"
                            },
                            {
                                parentEntity: {
                                    deleted: false
                                }
                            }
                        ]
                    }
                    ]
                }
            },
            reactions: {
                select: {userById: true}
            },
            weakReferences: {
                select: {
                    authorId: true,
                    childrenTree: {
                        select: {
                            authorId: true,
                            reactions: {
                                select: {
                                    userById: true
                                }
                            }
                        }
                    },
                    reactions: {
                        select: {
                            userById: true
                        }
                    },
                    parentEntityId: true
                },
                where: {
                    OR: [{
                        AND: [
                            {
                                type: {
                                    in: ["Post", "FastPost"]
                                }
                            },
                            {
                                isDraft: false
                            }
                        ]
                    },
                    {
                        type: {
                            notIn: ["Post", "FastPost", "EntityContent"]
                        }
                    },
                    {
                        AND: [
                            {
                                type: "EntityContent"
                            },
                            {
                                parentEntity: {
                                    deleted: false
                                }
                            }
                        ]
                    }
                    ]
                }
            },
            currentVersionId: true
        },
        where: {
            deleted: false
        },
        orderBy: {
            name: "asc"
        }
    })
    return entities
}, ["entities"], {
    revalidate: revalidateEverythingTime,
    tags: ["entities"]
})


export async function getEntityByIdNoCache(id: string){
    const entity: EntityProps | null = await db.entity.findUnique(
        {select: {
            id: true,
            name: true,
            protection: true,
            isPublic: true,
            deleted: true,
            currentVersion: {
                select: {
                    categories: true,
                    searchkeys: true
                }
            },
            versions: {
                select: {
                    id: true,
                    categories: true,
                    confirmedById: true,
                    rejectedById: true,
                    accCharsAdded: true,
                    charsAdded: true,
                    charsDeleted: true,
                    contribution: true,
                    editMsg: true,
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
                    uniqueViewsCount: true,
                    _count: {
                        select: {
                            reactions: true
                        }
                    },
                    createdAt: true,
                    compressedText: true,
                    author: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    editPermission: true,
                    childrenContents: {
                        select: {
                            id: true,
                            type: true,
                            createdAt: true,
                            _count: {
                                select: {
                                    childrenTree: true
                                }
                            },
                            currentVersionOf: {
                                select: {
                                    id: true
                                }
                            },
                            editPermission: true
                        },
                    },
                    claimsAuthorship: true,
                    diff: true,
                    entityReferences: {
                        select: {
                            id: true
                        },
                        where: {
                            deleted: false
                        }
                    },
                    weakReferences: {
                        select: {
                            id: true
                        },
                        where: {
                            deleted: false
                        }
                    },
                },
                orderBy: {
                    createdAt: "asc"
                },
            },
            referencedBy: {
                select: {
                    id: true,
                    createdAt: true,
                    type: true,
                    author: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    _count: {
                        select: {
                            reactions: true,
                            childrenTree: true
                        }
                    },
                    currentVersionOf: {
                        select: {
                            id: true
                        }
                    },
                    parentEntityId: true
                },
                where: {
                    OR: [{
                        AND: [
                            {
                                type: {
                                    in: ["Post", "FastPost"]
                                }
                            },
                            {
                                isDraft: false
                            }
                        ]
                    },
                    {
                        type: {
                            notIn: ["Post", "FastPost", "EntityContent"]
                        }
                    },
                    {
                        AND: [
                            {
                                type: "EntityContent"
                            },
                            {
                                parentEntity: {
                                    deleted: false
                                }
                            }
                        ]
                    }
                    ]
                }
            },
            weakReferences: {
                select: {
                    id: true,
                    createdAt: true,
                    type: true,
                    author: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    _count: {
                        select: {
                            reactions: true,
                            childrenTree: true
                        }
                    },
                    currentVersionOf: {
                        select: {
                            id: true
                        }
                    },
                    parentEntityId: true
                },
                where: {
                    OR: [{
                        AND: [
                            {
                                type: {
                                    in: ["Post", "FastPost"]
                                }
                            },
                            {
                                isDraft: false
                            }
                        ]
                    },
                    {
                        type: {
                            notIn: ["Post", "FastPost", "EntityContent"]
                        }
                    },
                    {
                        AND: [
                            {
                                type: "EntityContent"
                            },
                            {
                                parentEntity: {
                                    deleted: false
                                }
                            }
                        ]
                    }
                    ]
                }
            },
            _count: {
                select: {reactions: true},
            },
            uniqueViewsCount: true,
            currentVersionId: true
        },
            where: {
                id: id,
            }
        }
    )
    return entity
}


export async function getEntityById(id: string, useCache: boolean = true) {
    if(!useCache){
        return await getEntityByIdNoCache(id)
    } else {
        return unstable_cache(
            async () => {return await getEntityByIdNoCache(id)},
            ["entity", id], 
            {
                revalidate: revalidateEverythingTime,
                tags: ["entity", "entity:"+id]
            }
        )()
    }
}


export const getRouteEntities = (route: string[]) => {
    return unstable_cache(async () => {
        const entities = await getEntities()

        if(route.length == 0) return entities

        let routeEntities = entities.filter((entity) => {
            return entityInRoute(entity, route)
        })

        return routeEntities
    }, ["routeEntities", route.join("/")], {
        revalidate: revalidateEverythingTime,
        tags: ["entities", "routeEntities", "routeEntities:"+route.join("/"), "entities"]})() 
}


export async function setProtection(entityId: string, level: EditorStatus) {
    const result = await db.entity.update({
      where: { id: entityId },
      data: { protection: level },
    });
    revalidateTag("entities")
    revalidateTag("entity")
    return result
}


export async function revalidateEntities(){
    revalidateTag("entity")
    revalidateTag("entities")
}

export async function revalidateContents(){
    revalidateTag("content")
}

export async function revalidateNotifications(){
    revalidateTag("notifications")
}

export async function revalidateUsers(){
    revalidateTag("user")
    revalidateTag("users")
    revalidateTag("userStats")
    revalidateTag("usersWithStats")
}

export async function revalidateFeed(){
    revalidateTag("routeFeed")
    revalidateTag("routeFollowingFeed")
    revalidateTag("repliesFeed")
    revalidateTag("editsFeed")
    revalidateTag("profileFeed")
}


export async function revalidateDrafts(){
    revalidateTag("drafts")
}


export async function revalidateSearchkeys(){
    revalidateTag("searchkeys")
}


export async function removeEntityAuthorship(contentId: string, entityId: string){
    await db.content.update({
        data: {
            claimsAuthorship: false,
            removedAuthorshipAt: new Date()
        },
        where: {
            id: contentId
        }
    })
    revalidateTag("entity:"+entityId)
    revalidateTag("content:"+contentId)
    await recomputeEntityContributions(entityId)
}


export async function confirmChanges(entityId: string, contentId: string, userId: string){
    await db.content.update({
        data: {
            confirmedById: userId,
            confirmedAt: new Date()
        },
        where: {
            id: contentId
        }
    })
    await updateEntityCurrentVersion(entityId)
    await recomputeEntityContributions(entityId)
    revalidateTag("content:" + contentId)
}


export async function rejectChanges(entityId: string, contentId: string, userId: string){
    await db.content.update({
        data: {
            rejectedById: userId,
            rejectedAt: new Date()
        },
        where: {
            id: contentId
        }
    })
    await updateEntityCurrentVersion(entityId)
    await recomputeEntityContributions(entityId)
    revalidateTag("content:" + contentId)
}


export async function recomputeAllContributions(){
    const entities = await getEntities()

    for(let i = 0; i < entities.length; i++){
        console.log("recomputing contributions for", entities[i].name)
        const t1 = Date.now()
        await recomputeEntityContributions(entities[i].id)
        console.log("Done in ", Date.now()-t1)
    }
}


export async function updateUniqueViewsCount(){
    const entities = await db.entity.findMany({
        select: {
            id: true,
            views: true
        },
        where: {
            uniqueViewsCount: null
        }
    })
    for(let i = 0; i < entities.length; i++){
        const s = new Set(entities[i].views.map((v) => (v.userById))).size
        await db.entity.update({
            data: {
                uniqueViewsCount: s
            },
            where: {
                id: entities[i].id
            }
        })
    }
}


export async function updateIsDraft(){
    const contents = await db.content.findMany({
        select: {
            id: true,
            isDraft: true
        }
    })
    for(let i = 0; i < contents.length; i++){
        if(contents[i].isDraft == null){
            console.log("updating", i)
            await db.content.update({
                data: {
                    isDraft: false
                },
                where: {
                    id: contents[i].id
                }
            })
        }
    }
}