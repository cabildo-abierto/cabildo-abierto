'use server'

import {db} from "@/db";
import {verifySession} from "@/actions/auth";
import { cache } from "./cache";


export type SubscriptionProps = {
    id: string
    createdAt: Date
    boughtByUserId: string
    usedAt: Date | null
}

export type UserProps = {
    id: string
    name: string
    email: string
    createdAt: Date
    authenticated: Boolean
    editorStatus: string
    subscriptionsUsed: SubscriptionProps[]
    following: {id: string}[]
    likes: {id: string}[]
    dislikes: {id: string}[]
    followedBy: {id: string}[]
};


export async function getUserId(): Promise<string | null> {
    const session = await verifySession()
    if(!session) return null
    return session.userId
}

export async function getUser() {
    const userId = await getUserId()
    if(!userId)
        return null
    return getUserById(userId)
}

export const getUsers = cache(async () => {
    console.log("getting users")
    const users: UserProps[] = await db.user.findMany(
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
    const user: UserProps | null = await db.user.findUnique(
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
    return user
},
    ["user"],
    {
        tags: ["user"]
    }
)