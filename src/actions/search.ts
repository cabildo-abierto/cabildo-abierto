'use server'

import {db} from "@/db";
import diceCoefficientDistance from "@/actions/dice-coefficient";
import { UserProps } from "./get-user";
import { ContentAndChildrenProps, getPosts } from "./get-content";


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


export async function searchContents(value: string, userId: string | null=null) {
    if(value.length == 0)
        return []

    const dist = diceCoefficientDistance

    const contents = await getPosts(userId)
    if(!contents) return []

    const maxDist = dist(value, '')
    contents.forEach(function(item){
        item.content.dist = dist(value, item.content.text)
    })

    contents.sort((a, b) => {return a.dist - b.dist })
    contents.filter((a) => {return a.dist < maxDist})
    return contents
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