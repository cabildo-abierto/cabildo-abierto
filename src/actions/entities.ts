'use server'

import { revalidateTag, unstable_cache } from "next/cache";
import { db } from "../db";
import { findReferences, getContentById } from "./contents";
import { revalidateEverythingTime } from "./utils";
import { charDiffFromJSONString } from "../components/diff";
import { EntityProps, SmallEntityProps } from "../app/lib/definitions";
import { currentVersionContent, entityInRoute, getPlainText, hasEditPermission, isDemonetized, isUndo } from "../components/utils";
import { EditorStatus } from "@prisma/client";
import { getUserById } from "./users";
import { compress, decompress } from "../components/compression";



export async function createEntity(name: string, userId: string){
    const entityId = encodeURIComponent(name.replaceAll(" ", "_"))
    const exists = await db.entity.findFirst({
      where: {id: entityId}
    })
    if(exists) return {error: "Ya existe un artículo con ese nombre"}
  
  
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
  
    revalidateTag("entities")
    revalidateTag("editsFeed:"+userId)
    revalidateTag("entity:"+entityId)
    return {id: entityId}
}


// las contribuciones se calculan excluyendo todo lo que no esté monetizado o 
export const recomputeEntityContributions = async (entityId: string, useCacheEntity: boolean = true) => {
    const entity = await getEntityById(entityId, useCacheEntity)

    // no actualizamos la primera versión porque no suele cambiar
    let prevMonetizedVersion = 0
    for(let i = 1; i < entity.versions.length; i++){
        const versionContent = await getContentById(entity.versions[i].id)
        let newData = null
        if(isDemonetized(entity.versions[i]) || entity.versions[i].categories !== entity.versions[i-1].categories){
            newData = {
                accCharsAdded: entity.versions[prevMonetizedVersion].accCharsAdded, 
                charsAdded: 0, 
                charsDeleted: 0, 
                contribution: entity.versions[prevMonetizedVersion].contribution,
                diff: JSON.stringify({matches: [], common: [], bestMatches: []})
            }
        } else {
            newData = await getNewVersionContribution(
                entityId,
                decompress(versionContent.compressedText),
                versionContent.author.id,
                prevMonetizedVersion)
            prevMonetizedVersion = i
        }

        await db.content.update({
            data: newData,
            where: {
                id: versionContent.id
            }
        })
        revalidateTag("content:"+versionContent.id)
        revalidateTag("contentStatic:"+versionContent.id)
    }
    revalidateTag("entity:"+entityId)
}


const getNewVersionContribution = async (entityId: string, text: string, userId: string, afterVersion?: number) => {
    const entity = await getEntityById(entityId)
    if(afterVersion == undefined) afterVersion = entity.versions.length-1

    const lastVersionId = entity.versions[afterVersion].id
    const lastVersion = await getContentById(lastVersionId)
    const {charsAdded, charsDeleted, matches, common, perfectMatches} = charDiffFromJSONString(decompress(lastVersion.compressedText), text)
    const accCharsAdded = lastVersion.accCharsAdded + charsAdded
    const contribution: [string, number][] = JSON.parse(lastVersion.contribution)
    
    let wasAuthor = false
    for(let i = 0; i < contribution.length; i++){
        if(contribution[i][0] == userId){
            wasAuthor = true
            contribution[i][1] += charsAdded
        }
    }
    if(!wasAuthor){
        contribution.push([userId, charsAdded])
    }

    return {
        accCharsAdded: accCharsAdded, 
        charsAdded: charsAdded, 
        charsDeleted: charsDeleted, 
        contribution: JSON.stringify(contribution),
        diff: JSON.stringify({matches: matches, common: common, perfectMatches: perfectMatches})
    }
}
  
  
export const updateEntity = async (entityId: string, userId: string, claimsAuthorship: boolean, editMsg: string, compressedText?: string, categories?: string) => {
    const entity = await getEntityById(entityId)
    const current = currentVersionContent(entity)

    let references = null
    let text = null
    if(compressedText != undefined){
        text = decompress(compressedText)
        references = await findReferences(text)
        categories = current.categories
    } else {
        const currentContent = await getContentById(current.id)
        compressedText = currentContent.compressedText
        references = currentContent.entityReferences
        text = decompress(compressedText)
    }

    const permission = hasEditPermission(await getUserById(userId), entity.protection)

    const {numChars, numWords, numNodes, plainText} = getPlainText(text)

    await db.content.create({
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
            entityReferences: {
                connect: references
            },
            editPermission: permission,
            claimsAuthorship: claimsAuthorship,
            currentVersionOf: permission ? {
                connect: {
                    id: entityId
                }
            } : undefined,
            editMsg: editMsg
        }
    })

    await recomputeEntityContributions(entityId, false)

    revalidateTag("entity:" + entityId)
    revalidateTag("entities")
    revalidateTag("userContents:"+userId)
    revalidateTag("editsFeed:"+userId)
}


export const updateEntityCurrentVersion = async (entityId: string) => {
    const entity = await getEntityById(entityId)

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
    if(entity){
        await db.content.create({
            data: {
                type: "UndoEntityContent",
                text: message,
                authorId: userId,
                reportsVandalism: isVandalism,
                reportsOportunism: isOportunism,
                contentUndoneId: contentId
            }
        })
        await extendContentStallPaymentDate(contentId)
        revalidateTag("entity:"+entityId)
        revalidateTag("content:"+contentId)
        await updateEntityCurrentVersion(entityId)
        await recomputeEntityContributions(entityId)
    }
    
    revalidateTag("entities")
    revalidateTag("entity:"+entityId)
}
  
  
export const deleteEntity = async (entityId: string, userId: string) => {
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
    await recomputeEntityContributions(entityId, false)
    
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
            versions: {
                select: {
                    id: true,
                    categories: true,
                    createdAt: true,
                    authorId: true,
                    _count: {
                        select: {
                            childrenTree: true,
                            reactions: true
                        }
                    },
                    numWords: true
                },
                orderBy: {
                    createdAt: "asc"
                }
            },
            _count: {
                select: {
                    referencedBy: true,
                    reactions: true
                }
            },
            uniqueViewsCount: true,
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
    tags: ["entities"]})


export async function getEntityByIdNoCache(id: string){
    const entity: EntityProps | null = await db.entity.findUnique(
        {select: {
            id: true,
            name: true,
            protection: true,
            isPublic: true,
            deleted: true,
            versions: {
                select: {
                    id: true,
                    categories: true,
                    confirmedById: true,
                    rejectedById: true,
                    accCharsAdded: true,
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
                    authorId: true,
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
                    diff: true
                },
                orderBy: {
                    createdAt: "asc"
                }
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
                    }
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

export async function revalidateUsers(){
    revalidateTag("user")
    revalidateTag("users")
    revalidateTag("userStats")
    revalidateTag("usersWithStats")
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
        if(entities[i].name != "Decreto 1558/2001: Protección de los datos personales") continue
        console.log("recomputing contributions for", entities[i].name)
        await recomputeEntityContributions(entities[i].id)
    }
}