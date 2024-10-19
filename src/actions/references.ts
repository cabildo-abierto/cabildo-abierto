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
        const ref = await findEntityReferences(text)
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
    return getSearchkeysFromEntities(await getEntities())
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