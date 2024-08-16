'use server'

import {db} from "@/db";
import { cache } from "./cache";
import { UserProps } from "./get-user";
import { revalidateTag } from "next/cache";


export type EntityProps = {
    id: string
    name: string
    contentId: string
    protection: string
    isPublic: boolean,
    categories: string
}


export async function getEntityById(entityId: string) {
    let entity: EntityProps | null = await db.entity.findUnique(
        {select: {
            id: true,
            name: true,
            contentId: true,
            protection: true,
            isPublic: true,
            categories: true
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
    let entities: EntityProps[] = await db.entity.findMany(
        {
            select: {
                id: true,
                name: true,
                contentId: true,
                protection: true,
                isPublic: true,
                categories: true
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


export const updateCategories = async (entityId: string, categories: string, user?: UserProps) => {
    await db.entity.update({
        where: {
            id: entityId
        },
        data: {
            categories: categories
        }
    })
    revalidateTag("entities")
    revalidateTag("entity")
}