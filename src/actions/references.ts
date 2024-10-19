'use server'

import { revalidateTag, unstable_cache } from "next/cache";
import { db } from "../db";
import { getEntityById } from "./entities";
import { SearchkeysProps, SmallContentProps } from "../app/lib/definitions";
import { cleanText, findWeakReferences } from "../components/utils";
import { decompress } from "../components/compression";
import { getSearchableContents } from "./feed";
import { findReferences } from "./contents";


export async function updateAllReferences(){
    const contents = await db.content.findMany({
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
    for(let i = 0; i < contents.length; i++){
        const c = contents[i]
        const text = decompress(c.compressedText)
        const ref = await findReferences(text)
        await db.content.update({
            data: {
                entityReferences: {
                    connect: ref
                }
            },
            where: {
                id: c.id
            }
        })
    }
    revalidateTag("content")
}


export async function getReferencesSearchKeys(){
    return await unstable_cache(async () => {
        const entities = await db.entity.findMany({
            select: {
                id: true,
                name: true,
                currentVersion: {
                    select: {
                        searchkeys: true
                    }
                }
            }
        })
        let searchkeys: {id: string, keys: string[]}[] = []
        for(let i = 0; i < entities.length; i++){
            let keys = [...entities[i].currentVersion.searchkeys, entities[i].name].map(cleanText)
            searchkeys.push({id: entities[i].id, keys: keys})
        }
        return searchkeys
    }, ["searchkeys"], {tags: ["searchkeys"]})()
}


export async function updateWeakReferencesForContent(content: SmallContentProps, searchkeys: SearchkeysProps){
    const text = decompress(content.compressedPlainText)
    let currentReferences = content.weakReferences.map(({id}) => ({id: id}))

    const weakReferences = findWeakReferences(text+" "+content.title, searchkeys)

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

    const searchkeys = await getReferencesSearchKeys()

    for(let i = 0; i < contents.length; i++){
        await updateWeakReferencesForContent(contents[i], searchkeys)
    }
    revalidateTag("entities")
    revalidateTag("feed")
    return true
}


export async function updateEntityWeakReferences(entityId: string){
    await updateAllWeakReferences()
}