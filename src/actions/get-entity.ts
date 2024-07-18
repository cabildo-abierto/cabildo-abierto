'use server'

import {db} from "@/db";
import { getContentById } from "./get-content";

export type EntityProps = {
    id: string;
    name: string;
};

export async function getEntityById(entityId: string, userId) {
    let entity: EntityProps | null = await db.entity.findUnique(
        {select: {
            id: true,
            name: true,
            content: true,
        },
            where: {
                id: entityId,
            }
        }
    )
    const content = await getContentById(entity.content.id, userId)
    return {entity: entity, content: content.content, children: content.children}
}


export async function getEntities(): Promise<EntityProps[]> {
    let entities: EntityProps[] = await db.entity.findMany(
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