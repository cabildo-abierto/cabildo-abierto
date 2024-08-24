'use server'

import {db} from "@/db";
import { cache } from "./cache";
import { createClient } from "@/utils/supabase/server";


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
                createdAt: true,
                authenticated: true,
                editorStatus: true,
                subscriptionsUsed: true,
                following: {select: {id: true}},
                followedBy: {select: {id: true}},
                reactions: {
                    select: {
                        contentId: true,
                        entityId: true
                    }
                },
                authUser: {
                    select: {
                        email: true,
                    }
                }
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


export const getUserByAuthId = cache(async (userId: string) => {
    const user = await db.user.findUnique(
        {
            select: {
                id: true,
                name: true,
                createdAt: true,
                authenticated: true,
                editorStatus: true,
                subscriptionsUsed: true,
                following: {select: {id: true}},
                followedBy: {select: {id: true}},
                authUser: {
                    select: {
                        email: true,
                    }
                },
                reactions: {
                    select: {
                        contentId: true,
                        entityId: true
                    }
                },   
            },
            where: {
                authUserId: userId
            }
        }
    )
    return user ? user : undefined
},
    ["users"],
    {
        tags: ["users"]
    }
)


export async function getUser() {
    const userId = await getUserId()
    return userId ? await getUserByAuthId(userId) : undefined;
}


export async function getUserId() {

    const supabase = createClient()
    const { data, error } = await supabase.auth.getUser()

    const userId = data?.user?.id

    return userId
}