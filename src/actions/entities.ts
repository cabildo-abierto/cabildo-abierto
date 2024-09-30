'use server'

import { revalidateTag, unstable_cache } from "next/cache";
import { db } from "../db";
import { findReferences, getContentById, getContentStaticById } from "./contents";
import { revalidateEverythingTime } from "./utils";
import { charDiffFromJSONString, getAllText } from "../components/diff";
import { EntityProps, SmallEntityProps } from "../app/lib/definitions";
import { arraySum, currentVersion, entityInRoute, hasEditPermission, isDemonetized, isUndo, updateEntityContributions } from "../components/utils";
import { EditorStatus } from "@prisma/client";
import { getUserById } from "./users";



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
const recomputeEntityContributions = async (entityId: string) => {
    const entity = await getEntityById(entityId)
    
    // no actualizamos la primera versión porque no suele cambiar
    let prevMonetizedVersion = 0
    for(let i = 1; i < entity.versions.length; i++){
        const versionContent = await getContentStaticById(entity.versions[i].id)
        
        let newData = null
        if(isDemonetized(entity.versions[i]) || entity.versions[i].categories !== entity.versions[prevMonetizedVersion].categories){
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
                versionContent.text,
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
    console.log("after version", afterVersion)
    const lastVersionId = entity.versions[afterVersion].id
    const lastVersion = await getContentStaticById(lastVersionId)
    console.log("last version text", lastVersion.text)
    const {charsAdded, charsDeleted, matches, common, perfectMatches} = charDiffFromJSONString(lastVersion.text, text)
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
  
  
export const updateEntity = async (text: string, categories: string, entityId: string, userId: string, claimsAuthorship: boolean) => {
    let references = await findReferences(text)

    const entity = await getEntityById(entityId)

    const permission = hasEditPermission(await getUserById(userId), entity.protection)

    await db.content.create({
        data: {
            text: text,
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
            uniqueViewsCount: 0,
            fakeReportsCount: 0,
            editPermission: permission,
            claimsAuthorship: claimsAuthorship,
            currentVersionOf: permission ? {
                connect: {
                    id: entityId
                }
            } : undefined
        }
    })

    revalidateTag("entity:"+entityId)
    await recomputeEntityContributions(entityId)

    revalidateTag("entities")
    revalidateTag("userContents:"+userId)
    revalidateTag("entityContributions:"+entityId)
    revalidateTag("editsFeed:"+userId)
    revalidateTag("entityTextLength:"+entityId)
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
    revalidateTag("contentStatic:"+contentId)
}


export const deleteEntityHistory = async (entityId: string) => {
    const entity = await getEntityById(entityId)

    for(let i = 1; i < entity.versions.length-1; i++){
        await deleteContent(entity.versions[i].id)
    }

    revalidateTag("entity:"+entityId)
    await recomputeEntityContributions(entityId)
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
            uniqueViewsCount: true
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


export async function getEntityById(id: string) {
    return unstable_cache(async () => {
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
                        undos: {
                            select: {
                                id: true,
                                reportsOportunism: true,
                                reportsVandalism: true,
                                authorId: true,
                                createdAt: true,
                                text: true
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
                        text: true,
                        authorId: true,
                        editPermission: true,
                        childrenContents: {
                            select: {
                                id: true,
                                type: true,
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
    }, ["entity", id], {
        revalidate: revalidateEverythingTime,
        tags: ["entity", "entity:"+id]})()
}


export async function getEntityTextLength(id: string) {
    return unstable_cache(async () => {
        const entity = await getEntityById(id)
        if(!entity) return null
        if(entity.versions.length < 1) return 0
        const content = await getContentStaticById(entity.versions[entity.versions.length-1].id)
        let text = null
        try {
            text = JSON.parse(content.text)
        } catch {
            ;
        }
        if(!text) return 0
        const length = getAllText(text.root).split(" ").length
        return length
    }, ["entityTextLength", id], {
        revalidate: revalidateEverythingTime,
        tags: ["entityTextLength", "entityTextLength:"+id]})()
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
        console.log("recomputing contributions for", entities[i].name)
        await recomputeEntityContributions(entities[i].id)
    }
}