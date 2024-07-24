'use server'

import {db} from "@/db";
import {verifySession} from "@/actions/auth";
import { getChildrenAndData } from "./get-content";


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

export async function getUserById(userId: string){
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
                likes: true,
                dislikes: true
            },
            where: {id:userId}
        }
    )
    return user
}

export async function getUserStatusById(userId: string){
    return await db.user.findUnique(
        {
            select: {
                id: true,
                editorStatus: true,
                authenticated: true,
                subscriptionsUsed: true,
            },
            where: {id:userId}
        }
    )
}

export async function getUserActivityById(userId: string){
    let contents: {id: string}[] = await db.content.findMany(
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
                            {type: "FastPost"},
                            {type: "Post"}
                        ]
                    },
                    {
                        visible: true
                    }
                ]
            },
            select: {
                id: true
            },
            orderBy: {
                createdAt: "desc"
            }
        }
    )
    return await getChildrenAndData(contents)
}


export async function getUsersMatching(queryText: string) {
    const users = await db.user.findMany({
        select: {
            id: true,
            name: true
        }
    })
    const searchString = queryText.toLowerCase();

    function userMatch(user: any) {
        return user.name.toLowerCase().includes(searchString) || user.id.toLowerCase().includes(searchString);
    }

    return users.filter(userMatch)
}