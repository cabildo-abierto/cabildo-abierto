'use server'

import { EntityProps } from "@/app/lib/definitions";
import {db} from "@/db";
import { cache } from "./cache";


export const getEntities = cache(async () => {
    let entities = await db.entity.findMany({
        select: {
            id: true,
            name: true,
            protection: true,
            isPublic: true,
            versions: {
                select: {
                    id: true,
                    categories: true,
                    isUndo: true,
                    undoMessage: true
                },
                orderBy: {
                    createdAt: "asc"
                }
            }
        },
        orderBy: {
            name: "asc"
        }
    })
    return entities
}, ["entities"], {tags: ["entities"]})


export const getEntityById = cache(async (id: string) => {
    const entity = db.entity.findUnique(
        {select: {
            id: true,
            name: true,
            protection: true,
            isPublic: true,
            versions: {
                select: {
                    id: true,
                    categories: true,
                    isUndo: true,
                    undoMessage: true
                },
                orderBy: {
                    createdAt: "asc"
                }
            },
            referencedBy: {
                select: {
                    id: true,
                    createdAt: true
                }
            }
        },
            where: {
                id: id,
            }
        }
    )
    return entity
}, ["entities"], {tags: ["entities"]})


export const getCategories = cache(async () => {
    let entities = await db.content.findMany({
        distinct: ["categories"],
        select: {
            categories: true
        },
    })
    return entities.map(({categories}) => (categories))
}, ["entities", "contents"], {tags: ["entities", "contents"]})