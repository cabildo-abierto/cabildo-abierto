'use server'

import {db} from "@/db";
import {verifySession} from "@/actions/auth";
import { ContentProps, getChildrenAndData } from "./get-content";


export type SubscriptionProps = {
    id: string
    createdAt: Date
    boughtBy: string
    userId?: string
    usedAt?: Date
}

export type UserProps = {
    id: string
    name: string
    email: string
    createdAt: Date
    authenticated: Boolean
    editorStatus: string
    subscriptionsUsed: SubscriptionProps[]
};


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

export async function getUserById(userId: string){
    const user = await db.user.findUnique(
        {
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                authenticated: true,
                editorStatus: true,
                subscriptionsUsed: true
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
    let contents: ContentProps[] = await db.content.findMany(
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
    return await getChildrenAndData(contents, userId)
}


export async function getUsersMatching(queryText) {
    const users = await db.user.findMany({
        select: {
            id: true,
            name: true
        }
    })
    const searchString = queryText.toLowerCase();

    function userMatch(user) {
        return user.name.toLowerCase().includes(searchString) || user.id.toLowerCase().includes(searchString);
    }

    return users.filter(userMatch)
}