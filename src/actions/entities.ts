'use server'

import { revalidateTag, unstable_cache } from "next/cache";
import { ProtectionLevel } from "@prisma/client";
import { db } from "../db";
import { findReferences, getChildrenCount, getContentComments, getContentStaticById } from "./contents";
import { revalidateEverythingTime } from "./utils";
import { charDiffFromJSONString, getAllText } from "../components/diff";
import { EntityProps, SmallEntityProps } from "../app/lib/definitions";
import { arraySum, entityInRoute } from "../components/utils";



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
  
    await db.content.create({
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
        accCharsAdded: 0
      }
    })
  
    revalidateTag("entities")
    revalidateTag("editsFeed:"+userId)
    return {id: entityId}
}


const recomputeEntityContributions = async (entityId: string) => {
    const entity = await getEntityById(entityId)
    
    for(let i = 0; i < entity.versions.length; i++){
        const versionContent = await getContentStaticById(entity.versions[i].id)
        const newData = await getNewVersionContribution(entityId, versionContent.text, versionContent.author.id)
        
        await db.content.update({
            data: newData,
            where: {
                id: versionContent.id
            }
        })
    }
}


const getNewVersionContribution = async (entityId: string, text: string, userId: string, afterVersion?: number) => {
    const entity = await getEntityById(entityId)
    if(!afterVersion) afterVersion = entity.versions.length-1
    const lastVersionId = entity.versions[afterVersion].id
    const lastVersion = await getContentStaticById(lastVersionId)

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

    return {accCharsAdded: accCharsAdded, 
        charsAdded: charsAdded, 
        charsDeleted: charsDeleted, 
        contribution: JSON.stringify(contribution),
        diff: JSON.stringify({matches: matches, common: common, perfectMatches: perfectMatches})
    }
}
  
  
export const updateEntity = async (text: string, categories: string, entityId: string, userId: string, changingContent: boolean) => {
    let references = await findReferences(text)

    const {accCharsAdded, charsAdded, charsDeleted, contribution, diff} = await getNewVersionContribution(entityId, text, userId)
    await db.content.create({
        data: {
            text: text,
            authorId: userId,
            type: "EntityContent",
            parentEntityId: entityId,
            categories: categories,
            entityReferences: {
                connect: references
            },
            accCharsAdded: accCharsAdded,
            charsAdded: charsAdded,
            charsDeleted: charsDeleted,
            contribution: contribution,
            diff: diff,
            uniqueViewsCount: 0,
            fakeReportsCount: 0
        }
    })

    revalidateTag("entity:"+entityId)
    revalidateTag("entities")
    revalidateTag("userContents:"+userId)
    revalidateTag("entityContributions:"+entityId)
    revalidateTag("editsFeed:"+userId)
    revalidateTag("entityTextLength:"+entityId)
}
  
  
export const undoChange = async (entityId: string, contentId: string, versionNumber: number, message: string) => {
    const entity = await getEntityById(entityId)
    if(entity){
      await db.content.update({
          data: {
              isUndo: true,
              undoMessage: message
          },
          where: {
            id: contentId
          }
      })
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

    await db.reaction.deleteMany({
        where: {
            contentId: contentId
        }
    })

    const comments = await getContentComments(contentId)

    for(let i = 0; i < comments.length; i++){
        await deleteContent(comments[i].id)
    }

    await db.content.delete({
        where: {
            id: contentId
        }
    })
    revalidateTag("content:"+contentId)
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
                    isUndo: true,
                    undoMessage: true,
                    createdAt: true,
                    authorId: true,
                    _count: {
                        select: {
                            childrenTree: true,
                            reactions: true
                        }
                    }
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
    entities = entities.map((entity) => {
        entity.childrenCount = 0
        entity.textLength = 0
        return entity
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
                        isUndo: true,
                        undoMessage: true,
                        createdAt: true,
                        text: true,
                        authorId: true,
                        childrenContents: {
                            select: {
                                id: true,
                                type: true,
                                _count: {
                                    select: {
                                        childrenTree: true
                                    }
                                }
                            },
                        },
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
                        }
                    }
                },
                _count: {
                    select: {reactions: true},
                },
                uniqueViewsCount: true,
                
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


export async function setProtection(entityId: string, level: ProtectionLevel) {
    const result = await db.entity.update({
      where: { id: entityId },
      data: { protection: level },
    });
    revalidateTag("entities")
    revalidateTag("entity")
    return result
}