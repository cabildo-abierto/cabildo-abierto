'use server'

import {db} from "@/db";


export type EntityProps = {
    id: string
    name: string
    versions: {id: string, categories: string}[]
    protection: string
    isPublic: boolean,
}


export const getEntities = async () => {
    let entities: EntityProps[] = await db.entity.findMany(
        {
            select: {
                id: true,
                name: true,
                protection: true,
                isPublic: true,
                versions: {
                    select: {
                        id: true,
                        categories: true
                    },
                    orderBy: {
                        createdAt: "asc"
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