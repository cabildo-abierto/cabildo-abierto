'use server'

import {db} from "@/db";
import {verifySession} from "@/actions/auth";
import { cache } from "./cache";


export async function getUserId(): Promise<string | undefined> {
    const session = await verifySession()
    if(!session) return undefined
    return session.userId
}

export async function getUser() {
    const userId = await getUserId()
    if(!userId)
        return undefined
    return getUserById(userId)
}

export const getUsers = cache(async () => {
    const users = await db.user.findMany(
        {
            select: {
                id: true,
                name: true
            }
        }
    )
    return users
},
    ["users"],
    {
        tags: ["users"]
    }
)

export const getUserById = cache(async (userId: string) => {
    const user = await db.user.findUnique(
        {
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                authenticated: true,
                editorStatus: true,
                subscriptionsUsed: true,
                following: true,
                followedBy: true,
                likes: true,
                dislikes: true,
            },
            where: {id:userId}
        }
    )
    return user ? user : undefined
},
    ["users"],
    {
        tags: ["users"]
    }
)