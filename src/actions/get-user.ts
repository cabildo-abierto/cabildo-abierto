'use server'

import {db} from "@/db";
import {verifySession} from "@/actions/auth";

export async function getUserId(){
    const session = await verifySession()
    if(!session) return undefined

    return session?.userId
}

export async function getUser() {
    return getUserById(await getUserId())
}

export async function getUserIdByUsername(username){
    return await db.user.findUnique(
        {
            where: {username:username},
            select: {id: true}
        }
    )
}

export async function getUserById(userId){
    return await db.user.findUnique(
        {
            where: {id:userId}
        }
    )
}

export async function getUserActivityById(userId){
    return await db.comment.findMany(
        {
            where: {
                OR: [
                    {authorId:userId},
                    {mentions:
                            {
                                some: {
                                    id: userId
                                }
                            }
                    }
                ]
            },
            select: {
                content: true,
                author: true,
                createdAt: true,
                id: true,
                _count: {
                    select: { childrenComments: true },
                }
            }
        }
    )
}