'use server'

import {db} from "@/db";
import {verifySession} from "@/actions/auth";
import levenshtein from './levenshtein'



export async function search(value){

    const users = await db.user.findMany()
    users.forEach(function(item){
        item.dist = levenshtein(value, item.name)
        console.log(item.name, item.dist)
    })

    users.sort((a, b) => {return a.dist - b.dist })
    console.log(users)
    return users
}