'use server'

import {db} from "@/db";
import { getContentById } from "./get-content";


export async function getEntityById(entityId: string, userId: string | null) {
    let entity = await db.entity.findUnique(
        {select: {
            id: true,
            name: true,
            content: true,
            protection: true,
            isPublic: true
        },
            where: {
                id: entityId,
            }
        }
    )
    if(!entity){
        return null
    }
    const content = await getContentById(entity.content.id, userId)
    if(!content){
        return null
    }
    return {entity: entity, content: content.content, children: content.children}
}


export async function getEntities(): Promise<any[]> {
    let entities: any[] = await db.entity.findMany(
        {
            select: {
                id: true,
                name: true,
                content: {
                    select: {
                        text: true
                    }
                }
            },
        }
    )
    return entities
}