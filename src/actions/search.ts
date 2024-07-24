'use server'

import {db} from "@/db";
import diceCoefficientDistance from "@/actions/dice-coefficient";
import { UserProps } from "./get-user";
import { ContentProps, getPosts } from "./get-content";


export async function searchUsers(value: string): Promise<UserProps[]>{
    if(value.length == 0)
        return []

    const dist = diceCoefficientDistance

    const users: any[] = await db.user.findMany({
        select: {
            name: true, 
            id: true
        }
    })

    const maxDist = dist(value, '')

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


export async function searchContents(value: string, contents: Record<string, ContentProps>) {
    if(value.length == 0)
        return []

    const dist = diceCoefficientDistance

    const maxDist = dist(value, '')
    const dists: {id: string, dist: number}[] = []

    Object.values(contents).forEach(function(item){
        dists.push({id: item.id, dist: dist(value, item.text)})
    })

    dists.sort((a, b) => {return a.dist - b.dist })
    dists.filter((a) => {return a.dist < maxDist})
    return dists
}


export async function searchEntities(value: string): Promise<any[]>{
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