'use server'

import {db} from "@/db";
import diceCoefficientDistance from "@/actions/dice-coefficient";



export async function searchUsers(value){
    if(value.length == 0)
        return []

    const dist = diceCoefficientDistance

    const users = await db.user.findMany({select: {name: true, id: true, username: true}})

    const maxDist = dist(value, '')
    // console.log("Dist", value, 'empty string', dist(value, ''))

    users.forEach(function(item){
        item.dist = 1e10
        if(item.name) {
            item.dist = dist(value, item.name)
            // console.log("Dist", value, item.name, dist(value, item.name))
        }
        item.dist = Math.min(item.dist, dist(value, item.username))
        // console.log("Dist", value, item.username, dist(value, item.username))
    })

    users.sort((a, b) => {return a.dist - b.dist })
    users.filter((a) => {return a.dist < maxDist})
    return users
}