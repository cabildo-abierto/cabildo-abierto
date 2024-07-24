'use server'

import {db} from "@/db";


export type EntityProps = {
    id: string
    name: string
    contentId: string
    protection: string
    isPublic: boolean
}


export async function getEntityById(entityId: string) {
    let entity: EntityProps | null = await db.entity.findUnique(
        {select: {
            id: true,
            name: true,
            contentId: true,
            protection: true,
            isPublic: true
        },
            where: {
                id: entityId,
            }
        }
    )
    return entity
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
            orderBy: {
                name: "asc"
            }
        }
    )
    return entities
}