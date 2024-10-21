'use server'

import { revalidateTag } from "next/cache";
import { db } from "../db";
import { getEntities } from "./entities";
import { SearchkeysProps, SmallContentProps } from "../app/lib/definitions";
import { findWeakEntityReferences, getSearchkeysFromEntities } from "../components/utils";
import { decompress } from "../components/compression";
import { getSearchableContents } from "./feed";
import { findEntityReferences } from "./contents";


export async function updateAllReferences(){
    let contents
    try {
        contents = await db.content.findMany({
            select: {
                id: true,
                compressedText: true,
                entityReferences: {
                    select: {
                        id: true
                    }
                }
            },
            where: {
                type: {
                    not: "UndoEntityContent"
                }
            }
        })
    } catch {
        return {error: "error on get contents"}
    }
    for(let i = 0; i < contents.length; i++){
        const c = contents[i]
        const text = decompress(c.compressedText)
        const {entityReferences, error} = await findEntityReferences(text)
        if(error) return {error}

        try {
            await db.content.update({
                data: {
                    entityReferences: {
                        connect: entityReferences
                    }
                },
                where: {
                    id: c.id
                }
            })
        } catch {
            return {error: "error on update entity references"}
        }
    }
    revalidateTag("content")
}


export async function getReferencesSearchKeys(){
    const {entities, error} = await getEntities()
    if(error) return {error}
    return {searchkeys: getSearchkeysFromEntities(entities)}
}


export async function updateWeakReferencesForContent(content: SmallContentProps, searchkeys: SearchkeysProps){
    const text = decompress(content.compressedPlainText)
    let currentReferences = content.weakReferences.map(({id}) => ({id: id}))

    const weakReferences = findWeakEntityReferences(text+" "+content.title, searchkeys)

    let correctIds = new Set(weakReferences.map(({id}) => (id)))
    let currentIds = new Set(currentReferences.map(({id}) => (id)))
    
    let toRemoveIds: {id: string}[] = []
    currentIds.forEach((id) => {
        if(!correctIds.has(id)) toRemoveIds.push({id: id})
    })

    let toAddIds: {id: string}[] = []
    correctIds.forEach((id) => {
        if(!currentIds.has(id)) toAddIds.push({id: id})
    })

    if(toRemoveIds.length > 0 || toAddIds.length > 0){
        await db.content.update({
            data: {
                weakReferences: {
                    connect: toAddIds,
                    disconnect: toRemoveIds
                }
            },
            where: {
                id: content.id
            }
        })
        for(let i = 0; i < toAddIds.length; i++) revalidateTag(toAddIds[i].id)
        for(let i = 0; i < toRemoveIds.length; i++) revalidateTag(toRemoveIds[i].id)
    }
}


export async function updateAllWeakReferences(){
    const contents = await getSearchableContents([])

    const {searchkeys, error} = await getReferencesSearchKeys()
    if(error) return {error}

    for(let i = 0; i < contents.length; i++){
        await updateWeakReferencesForContent(contents[i], searchkeys)
    }
    revalidateTag("entities")
    revalidateTag("feed")
    return {}
}


export async function updateEntityWeakReferences(entityId: string){
    await updateAllWeakReferences()
}