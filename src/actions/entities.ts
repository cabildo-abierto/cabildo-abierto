'use server'

import { revalidateTag, unstable_cache } from "next/cache";
import { db } from "../db";
import { getContentById, notifyMentions, processNewTextFast } from "./contents";
import { revalidateEverythingTime, revalidateReferences } from "./utils";
import { charDiffFromJSONString } from "../components/diff";
import { EntityProps, SmallEntityProps } from "../app/lib/definitions";
import { currentVersionContent, entityExists, entityInRoute, getPlainText, hasEditPermission, isEntityContentDemonetized, isPartOfContent, isUndo } from "../components/utils";
import { getUserById } from "./users";
import { compress, decompress } from "../components/compression";
//import { extendContentStallPaymentDate } from "./payments";



export async function createEntity(name: string, userId: string){
    const entityId = encodeURIComponent(name.replaceAll(" ", "_"))
    
    const {entities, error} = await getEntities()
    if(error) return {error}

    if(entityExists(name, entities)){
        return {error: "exists"}
    }

    try {
        await db.entity.create({
            data: {
                name: name,
                id: entityId,
            }
        })
    } catch {
        return {error: "error on create"}
    }
    
    try {
        const content = await db.content.create({
            data: {
                text: "",
                authorId: userId,
                type: "EntityContent",
                parentEntityId: entityId,
                uniqueViewsCount: 0,
                fakeReportsCount: 0,
                contribution: JSON.stringify({monetized: [], all: []}),
                charsAdded: 0,
                charsDeleted: 0,
                accCharsAdded: 0,
                diff: JSON.stringify([{matches: [], common: [], perfectMatches: []}]),
                currentVersionOf: {
                    connect: {
                        id: entityId
                    }
                }
            }
        })
    } catch {
        return {error: "Ocurrió un error al crear el contenido"}
    }

    revalidateTag("entities")
    revalidateTag("editsFeed:"+userId)
    revalidateTag("entity:"+entityId)
    
    return {id: entityId}
}


function addToContributionList(l: [string, number][] | undefined, author: string, value: number){
    let wasAuthor = false

    if(!l) l = []    

    for(let i = 0; i < l.length; i++){
        if(l[i][0] == author){
            wasAuthor = true
            l[i][1] += value
        }
    }
    
    if(!wasAuthor){
        l.push([author, value])
    }
    return l
}


function updateContribution(contribution: BothContributionsProps, charsAdded: number, newAuthor: string, monetized: boolean){
    return {
        all: addToContributionList(contribution.all, newAuthor, charsAdded),
        monetized: monetized ? addToContributionList(contribution.monetized, newAuthor, charsAdded) : contribution.monetized
    }
}


export type BothContributionsProps = {
    monetized: [string, number][]
    all: [string, number][]
}


export const recomputeEntityContributions = async (entityId: string): Promise<{error?: string}> => {
    let entity
    try {
        entity = await db.entity.findUnique({
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
                    },
                    where: {
                        type: {
                            not: "Comment"
                        }
                    }
                }
            },
            where: {
                id: entityId
            }
        })
    } catch {
        return {error: "Error al actualizar las contribuciones"}
    }

    const texts = entity.versions.map((t) => (decompress(t.compressedText)))

    let lastContribution: BothContributionsProps = {monetized: [], all: []}
    let lastAccCharsAdded = 0

    for(let i = 0; i < entity.versions.length; i++){
        let newData = null
        if(i == 0 || entity.versions[i].compressedText == entity.versions[i-1].compressedText || !isPartOfContent(entity.versions[i])){
            newData = {
                accCharsAdded: lastAccCharsAdded, 
                charsAdded: 0, 
                charsDeleted: 0, 
                contribution: JSON.stringify(lastContribution),
                diff: JSON.stringify({matches: [], common: [], bestMatches: []})
            }
        } else {
            const diff = charDiffFromJSONString(texts[i-1], texts[i])
            if(diff == null){
                return {error: "Error al analizar diferencias entre las versiones " + (i-1) + " y " + i}
            }
            const {charsAdded, charsDeleted, matches, common, perfectMatches} = diff

            const accCharsAdded = lastAccCharsAdded + charsAdded

            const contribution: BothContributionsProps = lastContribution
            
            const newContribution = updateContribution(contribution, charsAdded, entity.versions[i].authorId, !isEntityContentDemonetized(entity.versions[i]))
        
            newData = {
                accCharsAdded: accCharsAdded, 
                charsAdded: charsAdded, 
                charsDeleted: charsDeleted, 
                contribution: JSON.stringify(newContribution),
                diff: JSON.stringify({matches: matches, common: common, perfectMatches: perfectMatches})
            }
        }

        // TO DO: Update many
        try {
            await db.content.update({
                data: newData,
                where: {
                    id: entity.versions[i].id
                }
            })
        } catch {
            return {error: "Error al actualizar las contribuciones."}
        }
        lastContribution = JSON.parse(newData.contribution)
        lastAccCharsAdded = newData.accCharsAdded
    }

    for(let i = 0; i < entity.versions.length; i++){
        revalidateTag("content:"+entity.versions[i].id)
    }
    revalidateTag("entity:"+entityId)
    return {}
}


export const updateEntityContent = async (
    entityId: string,
    userId: string,
    claimsAuthorship: boolean,
    editMsg: string,
    compressedText: string,
    weakReferences: {id: string}[],
    entityReferences: {id: string}[],
    mentions: {id: string}[],
) => {
    const {entity, error} = await getEntityById(entityId)
    if(error) return {error}

    const {user, error: userError} = await getUserById(userId)
    if(userError) return {error: userError}

    const permission = hasEditPermission(user, entity.protection)

    const {content: currentContent, error: contentError} = await getContentById(entity.currentVersionId)
    if(contentError) return {error: contentError}

    const text = decompress(compressedText)
    const {error: processError, numNodes, numChars, numWords, compressedPlainText, ...processed} = await processNewTextFast(text, entity.name)
    if(processError) return {error: processError}

    const prevText = decompress(entity.currentVersion.compressedText)

    let {charsAdded, charsDeleted, matches, common, perfectMatches} = charDiffFromJSONString(prevText, text)

    let contribution
    try {
        if(!permission){
            contribution = currentContent.contribution
        } else {
            contribution = JSON.stringify(updateContribution(JSON.parse(currentContent.contribution), charsAdded, userId, permission && claimsAuthorship))
        }
    } catch {
        return {error: "Ocurrió un error al guardar los cambios. e01."}
    }

    let newContent
    try {
        newContent = await db.content.create({
            data: {
                compressedText: compressedText,
                compressedPlainText: compressedPlainText,
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
                categories: currentContent.categories,
                searchkeys: entity.currentVersion.searchkeys,
                entityReferences: {
                    connect: entityReferences
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
                contribution: contribution,
                diff: JSON.stringify({matches: matches, common: common, perfectMatches: perfectMatches}),
                charsAdded: charsAdded,
                charsDeleted: charsDeleted
            }
        })
    } catch {
        return {error: "Error al crear el contenido."}
    }

    const {error: notifyError} = await notifyMentions(mentions, newContent.id, userId, true)
    if(notifyError) return {error: notifyError}

    revalidateReferences(entityReferences, weakReferences)

    revalidateTag("entity:" + entityId)
    revalidateTag("entities")
    revalidateTag("userContents:"+userId)
    revalidateTag("editsFeed:"+userId)

    return {}
}

  
export const updateEntityCategoriesOrSearchkeys = async (entityId: string, userId: string, claimsAuthorship: boolean, editMsg: string, categories?: string, searchkeys?: string[]) => {
    const {entity, error} = await getEntityById(entityId)
    if(error) return {error: error}
    
    const {user, error: userError} = await getUserById(userId)
    if(userError) return {error: userError}

    const permission = hasEditPermission(user, entity.protection)

    const current = currentVersionContent(entity)
    const {content: currentContent, error: getContentError} = await getContentById(current.id)
    if(getContentError) return {error: getContentError}

    const compressedText = currentContent.compressedText
    const references = currentContent.entityReferences.map(({id}) => ({id: id}))
    const weakReferences = current.weakReferences
    const mentions = currentContent.usersMentioned
    const text = decompress(currentContent.compressedText)

    const prevText = text
    const {numChars, numWords, numNodes, plainText} = getPlainText(text)

    let {charsAdded, charsDeleted, matches, common, perfectMatches} = charDiffFromJSONString(prevText, text)

    let contribution = null
    if(!permission){
        contribution = currentContent.contribution
    } else {
        try {
            contribution = JSON.stringify(updateContribution(JSON.parse(currentContent.contribution), charsAdded, userId, false))
        } catch (err) {
            console.log("Error", err)
            return {error: "Error al actualizar el tema. e01."}
        }
    }

    let newContent
    try {
        newContent = await db.content.create({
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
                contribution: contribution,
                diff: JSON.stringify({matches: matches, common: common, perfectMatches: perfectMatches}),
                charsAdded: charsAdded,
                charsDeleted: charsDeleted
            }
        })
    } catch {
        return {error: "Error al actualizar el tema. e02."}
    }

    const {error: notifyError} = await notifyMentions(mentions, newContent.id, userId, true)
    if(notifyError) return {error: notifyError}

    revalidateReferences(references, weakReferences)

    revalidateTag("entity:" + entityId)
    revalidateTag("entities")
    revalidateTag("userContents:"+userId)
    revalidateTag("editsFeed:"+userId)

    return {}
}


export const updateEntityCurrentVersion = async (entityId: string): Promise<{error?: string, entity?: EntityProps}> => {
    const {entity, error} = await getEntityByIdNoCache(entityId)
    if(error) return {error: error}

    let index = 0
    for(let i = 0; i < entity.versions.length; i++){
        if(!isUndo(entity.versions[i]) && (entity.versions[i].editPermission || entity.versions[i].confirmedById != null)){
            index = i
        }
    }

    try {
        await db.entity.update({
            data: {
                currentVersionId: entity.versions[index].id
            },
            where: {
                id: entityId
            }
        })
    } catch {
        return {error: "Error al actualizar el tema."}
    }
    
    revalidateTag("entity:"+entityId)
    return {}
}
  
  
export const undoChange = async (entityId: string, contentId: string, versionNumber: number, message: string, userId: string, isVandalism: boolean, isOportunism: boolean) => {
    const compressedText = compress(message)
    
    try {
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
    } catch {
        return {error: "Error al deshacer el tema."}
    }

    //const {error: stallError} = await extendContentStallPaymentDate(contentId)
    //if(stallError) return {error: stallError}

    const {error: updateVersion} = await updateEntityCurrentVersion(entityId)
    if(updateVersion) return {error: updateVersion}

    const {error: updateContributions} = await recomputeEntityContributions(entityId)
    if(updateContributions) return {error: updateContributions}
    
    revalidateTag("entity:"+entityId)
    revalidateTag("content:"+contentId)
    revalidateTag("entities")
    return {}
}


export const getEntitiesNoCache = async () => {
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
                            authorId: true,
                            createdAt: true
                        }
                    },
                    reactions: {
                        select: {
                            userById: true,
                            createdAt: true
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
                    createdAt: true,
                    authorId: true,
                    childrenTree: {
                        select: {
                            authorId: true,
                            createdAt: true,
                            reactions: {
                                select: {
                                    userById: true,
                                    createdAt: true
                                }
                            }
                        }
                    },
                    reactions: {
                        select: {
                            createdAt: true,
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
                select: {
                    userById: true,
                    createdAt: true
                }
            },
            weakReferences: {
                select: {
                    authorId: true,
                    createdAt: true,
                    childrenTree: {
                        select: {
                            authorId: true,
                            createdAt: true,
                            reactions: {
                                select: {
                                    userById: true,
                                    createdAt: true
                                }
                            }
                        }
                    },
                    reactions: {
                        select: {
                            userById: true,
                            createdAt: true
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
            currentVersionId: true,
            currentVersion: {
                select: {
                    searchkeys: true
                }
            }
        },
        where: {
            deleted: false
        },
        orderBy: {
            name: "asc"
        }
    })
    return {entities: entities}
}



export const getEntities = async (): Promise<{entities?: SmallEntityProps[], error?: string}> => {
    try {
        const entities = await unstable_cache(
            async () => {return await getEntitiesNoCache()},
            ["entities"], {
                revalidate: revalidateEverythingTime,
                tags: ["entities"]
            }
        )()
        return entities
    } catch {
        return {error: "Error al leer los temas."}
    }
}


export async function getEntityByIdNoCache(id: string): Promise<{entity?: EntityProps, error?: string}>{
    let entity: EntityProps | null
    entity = await db.entity.findUnique(
        {select: {
            id: true,
            name: true,
            protection: true,
            isPublic: true,
            deleted: true,
            currentVersion: {
                select: {
                    categories: true,
                    searchkeys: true,
                    compressedText: true
                }
            },
            versions: {
                select: {
                    id: true,
                    type: true,
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
                                    childrenTree: true,
                                    reactions: true,
                                }
                            },
                            currentVersionOf: {
                                select: {
                                    id: true
                                }
                            },
                            editPermission: true,
                            childrenTree: {
                                select: {
                                    authorId: true
                                }
                            },
                            author: {
                                select: {
                                    id: true
                                }
                            },
                            uniqueViewsCount: true
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
                where: {
                    type: "EntityContent"
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
                    },
                    parentEntityId: true,
                    childrenTree: {
                        select: {
                            authorId: true
                        }
                    },
                    uniqueViewsCount: true
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
                    parentEntityId: true,
                    childrenTree: {
                        select: {
                            authorId: true
                        }
                    },
                    uniqueViewsCount: true
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
    if(entity){
        return {entity: entity}
    } else {
        return {error: "Error al obtener el tema."}
    }
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


export const getRouteEntities = (route: string[]): Promise<{routeEntities?: SmallEntityProps[], error?: string}> => {
    return unstable_cache(async () => {
        const {entities, error} = await getEntities()
        if(error) return {error: error}

        if(route.length == 0) return {routeEntities: entities}

        let routeEntities = entities.filter((entity) => {
            return entityInRoute(entity, route)
        })

        return {routeEntities}
    }, ["routeEntities", route.join("/")], {
        revalidate: revalidateEverythingTime,
        tags: ["entities", "routeEntities", "routeEntities:"+route.join("/"), "entities"]})() 
}


export async function removeEntityAuthorship(contentId: string, entityId: string): Promise<{error?: string}>{
    try {
        await db.content.update({
            data: {
                claimsAuthorship: false,
                removedAuthorshipAt: new Date()
            },
            where: {
                id: contentId
            }
        })
    } catch {
        return {error: "Error al obtener la autoría."}
    }
    revalidateTag("entity:"+entityId)
    revalidateTag("content:"+contentId)
    const {error} = await recomputeEntityContributions(entityId)
    if(error) return {error}

    return {}
}


export async function confirmChanges(entityId: string, contentId: string, userId: string){
    try {
        await db.content.update({
            data: {
                confirmedById: userId,
                confirmedAt: new Date()
            },
            where: {
                id: contentId
            }
        })
    } catch {
        return {error: "Error al confirmar cambio."}
    }

    const {error} = await updateEntityCurrentVersionAndContribution(entityId)
    if(error) return {error}

    revalidateTag("content:" + contentId)
    return {}
}


export async function updateEntityCurrentVersionAndContribution(entityId: string){

    const res1 = await updateEntityCurrentVersion(entityId)
    if(res1.error) return {error: res1.error}

    const res2 = await recomputeEntityContributions(entityId)
    if(res2.error) return {error: res2.error}

    return {}
}


export async function rejectChanges(entityId: string, contentId: string, userId: string){
    try {
        await db.content.update({
            data: {
                rejectedById: userId,
                rejectedAt: new Date()
            },
            where: {
                id: contentId
            }
        })
    } catch {
        return {error: "Error al rechazar cambio."}
    }

    const {error} = await updateEntityCurrentVersionAndContribution(entityId)
    if(error) return {error}

    revalidateTag("content:" + contentId)
    return {}
}


export async function changeEntityName(entityId: string, newName: string, userId: string){
    
    const {entity, error} = await getEntityById(entityId)
    if(error) return {error: error}
    
    const current = currentVersionContent(entity)
    const {content: currentContent, error: getContentError} = await getContentById(current.id)
    if(getContentError) return {error: getContentError}

    const compressedText = currentContent.compressedText
    const references = currentContent.entityReferences.map(({id}) => ({id: id}))
    const weakReferences = current.weakReferences
    const mentions = currentContent.usersMentioned
    const text = decompress(currentContent.compressedText)

    const prevText = text
    const {numChars, numWords, numNodes, plainText} = getPlainText(text)

    let {charsAdded, charsDeleted, matches, common, perfectMatches} = charDiffFromJSONString(prevText, text)

    let contribution = null
    try {
        contribution = JSON.stringify(updateContribution(JSON.parse(currentContent.contribution), charsAdded, userId, false))
    } catch {
        return {error: "Error al actualizar el tema."}
    }

    try {
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
                categories: current.categories,
                searchkeys: entity.currentVersion.searchkeys,
                entityReferences: {
                    connect: references
                },
                weakReferences: {
                    connect: weakReferences
                },
                usersMentioned: {
                    connect: mentions
                },
                editPermission: true,
                claimsAuthorship: true,
                currentVersionOf: {
                    connect: {
                        id: entityId
                    }
                },
                editMsg: "nuevo nombre: " + newName,
                accCharsAdded: currentContent.accCharsAdded + charsAdded,
                contribution: contribution,
                diff: JSON.stringify({matches: matches, common: common, perfectMatches: perfectMatches}),
                charsAdded: charsAdded,
                charsDeleted: charsDeleted
            }
        })
    } catch {
        return {error: "Error al actualizar el tema."}
    }

    try {
        await db.entity.update({
            data: {
                name: newName
            },
            where: {
                id: entityId
            }
        })
    } catch {
        return {error: "Error al cambiar el nombre."}
    }

    revalidateTag("entity:" + entityId)
    revalidateTag("entities")
    revalidateTag("userContents:"+userId)
    revalidateTag("editsFeed:"+userId)
    return {}
}