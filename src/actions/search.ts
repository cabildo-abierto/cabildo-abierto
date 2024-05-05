'use server'

import {db} from "@/db";
import levenshtein from './levenshtein'



export async function searchUsers(value){

    const users = await db.user.findMany({select: {name: true, id: true, username: true}})
    users.forEach(function(item){
        item.dist = 1e10
        if(item.name) {
            console.log("Levensh", value, item.name)
            item.dist = levenshtein(value, item.name)
        }
        console.log("Levensh", value, item.username)
        item.dist = Math.min(item.dist, levenshtein(value, item.username))
        console.log(item.name, item.dist)
    })

    users.sort((a, b) => {return a.dist - b.dist })
    return users
}