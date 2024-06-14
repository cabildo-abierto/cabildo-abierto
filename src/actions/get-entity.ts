'use server'

import {db} from "@/db";
import {getUserIdByUsername} from "@/actions/get-user";
import parse from 'html-react-parser'
import { getLikeState } from "./likes";

export type EntityProps = {
    id: string;
    name: string;
    text: any;
};

export async function getEntityById(entityId: string): Promise<EntityProps | null> {
    let entity: EntityProps | null = await db.entity.findUnique(
        {select: {
                id: true,
                text: true,
                name: true
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
                text: true,
                name: true
            },
        }
    )
    return entities
}