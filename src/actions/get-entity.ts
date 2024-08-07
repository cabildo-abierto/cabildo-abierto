'use server'

import {db} from "@/db";
import { cache } from "./cache";


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


export const getEntities = cache(async () => {
    console.log("getting entities")
    let entities: any[] = await db.entity.findMany(
        {
            select: {
                id: true,
                name: true,
                contentId: true,
                protection: true,
                isPublic: true
            },
            orderBy: {
                name: "asc"
            }
        }
    )
    return entities
},
["entities"],
    {
        tags: ["entities"]
    }
)