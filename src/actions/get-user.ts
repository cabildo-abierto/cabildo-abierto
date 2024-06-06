'use server'

import {db} from "@/db";
import {verifySession} from "@/actions/auth";

export async function getUserId(){
    const session = await verifySession()
    if(!session) return undefined

    return session?.userId
}

export async function getUser() {
    const userId = await getUserId()
    if(!userId)
        return false
    return getUserById(userId)
}

export async function getUserIdByUsername(username: string){
    return await db.user.findUnique(
        {
            where: {username:username},
            select: {id: true}
        }
    )
}

export async function getUserById(userId: string){
    return await db.user.findUnique(
        {
            where: {id:userId}
        }
    )
}

export async function getUserActivityById(userId: string){
    return await db.content.findMany(
        {
            where: {
                AND: [
                    {
                        OR: [
                        {authorId:userId},
                        {mentionedUsers:
                                {
                                    some: {
                                        id: userId
                                    }
                                }
                        }
                        ]
                    },
                    {
                        OR: [
                            {type: "Discussion"},
                            {type: "Post"}
                        ]
                    }
                ]
            },
            select: {
                text: true,
                author: true,
                createdAt: true,
                id: true,
                _count: {
                    select: { childrenComments: true },
                },
                type: true
            }
        }
    )
}