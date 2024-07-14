'use server'

import {db} from "@/db";

export type EntityProps = {
    id: string;
    name: string;
};

export async function getEntityById(entityId: string): Promise<EntityProps | null> {
    let entity: EntityProps | null = await db.entity.findUnique(
        {select: {
            id: true,
            name: true,
            content: {
                select: {
                    id: true,
                    text: true,
                    childrenComments: {
                        select: {
                            id: true,
                            text: true,
                            createdAt: true,
                            type: true,
                            author: true,
                            _count: {
                                select: {
                                    childrenComments: true
                                }
                            }
                        }
                    }
                }
            },
        },
            where: {
                id: entityId,
            }
        }
    )
    return entity
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