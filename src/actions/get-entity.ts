'use server'

import {db} from "@/db";
import { cache } from "./cache";


export type EntityProps = {
    id: string
    name: string
    versions: {id: string}[]
    protection: string
    isPublic: boolean
}


export async function getEntityById(entityId: string) {
    let entity: EntityProps | null = await db.entity.findUnique(
        {select: {
            id: true,
            name: true,
            protection: true,
            isPublic: true,
            versions: {
                select: {
                    id: true
                }
            }
        },
            where: {
                id: entityId,
            }
        }
    )
    return entity
}


export const getEntities = cache(async () => {
    let entities: EntityProps[] = await db.entity.findMany(
        {
            select: {
                id: true,
                name: true,
                protection: true,
                isPublic: true,
                versions: {
                    select: {
                        id: true
                    }
                }
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