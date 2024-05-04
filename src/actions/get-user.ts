'use server'

import {db} from "@/db";
import {verifySession} from "@/actions/auth";

export async function getUser() {
    const session = await verifySession()
    if(!session) return undefined

    return getUserById(session?.userId)
}

export async function getUserById(userId){
    return await db.user.findUnique(
        {where: {id:userId}}
    )
}