'use server'

import {db} from "@/db";
import diceCoefficientDistance from "@/actions/dice-coefficient";
import { UserProps } from "./get-user";
import { ContentProps, ContentWithLinks, getPosts } from "./get-content";
import { EntityProps } from "./get-entity";

export type UserSearchResult = {
    id: string
    name: string
    dist?: number
}


export type ContentSearchResult = {
    id: string;
    createdAt: Date
    author: {
        id: string
        name: string
    } | null;
    text: string;
    _count: {
        childrenComments: number
        likedBy: number
        dislikedBy: number
    }
    type: string
    textWithLinks?: ContentWithLinks | null
    likeState?: string
    dist?: number
};


export type EntitySearchResult = {
    id: string
    name: string
    dist?: number
}


export async function searchUsers(value: string): Promise<UserProps[]>{
    if(value.length == 0)
        return []

    const dist = diceCoefficientDistance

    const users: UserSearchResult[] = await db.user.findMany({
        select: {
            name: true, 
            id: true
        }
    })

    const maxDist = dist(value, '')
    // console.log("Dist", value, 'empty string', dist(value, ''))

    users.forEach(function(item){
        item.dist = 1e10
        if(item.name) {
            item.dist = dist(value, item.name)
        }
        item.dist = Math.min(item.dist, dist(value, item.id))
    })

    users.sort((a, b) => {return a.dist - b.dist })
    users.filter((a) => {return a.dist < maxDist})
    return users
}


export async function searchContents(value: string, userId: string) {
    if(value.length == 0)
        return []

    const dist = diceCoefficientDistance

    const contents: any[] = await getPosts(userId)

    const maxDist = dist(value, '')
    contents.forEach(function(item){
        item.content.dist = dist(value, item.content.text)
    })

    contents.sort((a, b) => {return a.dist - b.dist })
    contents.filter((a) => {return a.dist < maxDist})
    return contents
}


export async function searchEntities(value: string): Promise<EntityProps[]>{
    if(value.length == 0)
        return []

    const dist = diceCoefficientDistance

    const entities: any[] = await db.entity.findMany({
        select: {
            name: true, 
            id: true, 
        }
    })

    const maxDist = dist(value, '')
    // console.log("Dist", value, 'empty string', dist(value, ''))

    entities.forEach(function(item){
        item.dist = 1e10
        if(item.name) {
            item.dist = dist(value, item.name)
        }
    })

    entities.sort((a, b) => {return a.dist - b.dist })
    entities.filter((a) => {return a.dist < maxDist})
    return entities
}