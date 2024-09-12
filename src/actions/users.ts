'use server'

import { revalidateTag, unstable_cache } from "next/cache";
import { db } from "../db";
import { createClient } from "../utils/supabase/server";
import { revalidateEverythingTime } from "./utils";
import { UserStats } from "../app/lib/definitions";


export async function updateDescription(text: string, userId: string) {
    await db.user.update({
        data: {
            description: text
        },
        where: {
            id: userId
        }
    })
    revalidateTag("user:"+userId)
}


export const getUsers = unstable_cache(async () => {
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
        revalidate: revalidateEverythingTime,
        tags: ["users"]
    }
)


export const getUsersWithStats = unstable_cache(async () => {
    const users = await getUsers()

    const withStats = []
    for(let i = 0; i < users.length; i++){
        withStats.push({
            user: users[i],
            stats: await getUserStats(users[i].id)
        })
    }
    return withStats
},
    ["usersWithStats"],
    {
        revalidate: Math.min(3600, revalidateEverythingTime),
        tags: ["users", "usersWithStats"]
    }
)


export const getUserById = (userId: string) => {
    return unstable_cache(async () => {
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
                    description: true
                },
                where: {id:userId}
            }
        )
        return user ? user : undefined
    }, ["user", userId], {
        revalidate: revalidateEverythingTime,
        tags: ["user:"+userId]})()    
}


export const getUserContents = (userId: string) => {
    return unstable_cache(async () => {
        const contents = (await db.user.findUnique(
            {
                select: {
                    contents: {
                        select: {
                            id: true,
                            type: true,
                            parentEntityId: true,
                            _count: {
                                select: {
                                    reactions: true,
                                    views: true
                                }
                            }
                        },
                        where: {
                            type: {
                                in: ["Post", "EntityContent"]
                            }
                        },
                        orderBy: {
                            createdAt: "desc"
                        },
                    },
                },
                where: {
                    id: userId
                }
            }
        )).contents

        return contents ? contents : undefined
    }, ["userContents", userId], {
        revalidate: revalidateEverythingTime,
        tags: ["userContents:"+userId]})()    
}


export const getUserIdByAuthId = (authId: string) => {
    return unstable_cache(async () => {
        const userId = await db.user.findUnique(
            {
                select: {
                    id: true,
                },
                where: {
                    authUserId: authId
                }
            }
        )
        return userId?.id
    }, ["userIdByAuthId", authId], {
        revalidate: revalidateEverythingTime,
        tags: ["userIdByAuthId", "userIdByAuthId:"+authId]})()    
}


export async function getUser() {
    const userId = await getUserId()
    if(!userId) return null

    return await getUserById(userId)
}


export async function getUserId() {
    const userAuthId = await getUserAuthId()
    if(!userAuthId) return null

    return await getUserIdByAuthId(userAuthId)
}


export async function getUserAuthId() {

    const supabase = createClient()
    const {data} = await supabase.auth.getUser()

    const userId = data?.user?.id

    return userId
}


export async function follow(userToFollowId: string, userId: string) {
    const updatedUser = await db.user.update({
        where: {
            id: userId,
        },
        data: {
            following: {
                connect: {
                    id: userToFollowId,
                },
            },
        },
    });
    revalidateTag("user:"+userToFollowId)
    revalidateTag("user:"+userId)
    return updatedUser;
}


export async function unfollow(userToUnfollowId: string, userId: string) {

    const updatedUser = await db.user.update({
        where: {
            id: userId,
        },
        data: {
            following: {
                disconnect: {
                    id: userToUnfollowId,
                },
            },
        },
    });
    revalidateTag("user:"+userToUnfollowId)
    revalidateTag("user:"+userId)
    return updatedUser;
}


export const getUserStats = async (userId: string) => {
    return unstable_cache(async () => {
        const userContents = await getUserContents(userId)
        let entityEdits = 0
        let editedEntitiesIds = new Set()
        const postsIds = []
        
        let reactionsInPosts = 0
        let viewsInPosts = 0
        userContents.forEach((content) => {
            if(content.type == "EntityContent"){
                entityEdits ++
                if(content.parentEntityId)
                    editedEntitiesIds.add(content.parentEntityId)
            } else if(content.type == "Post"){
                postsIds.push(content.id)
                reactionsInPosts += content._count.reactions
                viewsInPosts += content._count.views
            }
        })
    
        //const entityReactions = await Promise.all(Array.from(editedEntitiesIds).map(getReactionsFromFirstEdit))
        //const entityViews = await Promise.all(Array.from(editedEntitiesIds).map(getViewsFromFirstEdit))
    
        const stats: UserStats = {
            posts: postsIds.length,
            entityEdits: entityEdits,
            editedEntities: editedEntitiesIds.size,
            reactionsInPosts: reactionsInPosts,
            reactionsInEntities: 0,
            income: 0,
            entityAddedChars: 0,
            viewsInPosts: viewsInPosts,
            viewsInEntities: 0
        }
        return stats
    }, ["userStats", userId], {
        revalidate: Math.min(revalidateEverythingTime, 3600),
        tags: ["userStats", "userStats:"+userId, ""]})()
}



export async function buyAndUseSubscription(userId: string) { 
    const result = await db.subscription.create({
        data: {
            userId: userId,
            boughtByUserId: userId,
            usedAt: new Date()
        }
    })
    revalidateTag("user:"+userId)
}

export async function donateSubscriptions(n: number, userId: string) {
    const queries = []
    
    for(let i = 0; i < n; i++){
        queries.push({
            boughtByUserId: userId
        })
    }

    await db.subscription.createMany({
        data: queries
    })
    revalidateTag("user:"+userId)
    revalidateTag("poolsize")
}

export async function getDonatedSubscription(userId: string) {
    const subscription = await db.subscription.findFirst({
        where: {
            usedAt: null
        }
    })

    if(!subscription){
        return null
    } else {
        const result = await db.subscription.update({
            data: {
                usedAt: new Date(),
                userId: userId
            },
            where: {
                id: subscription.id
            }
        })
        revalidateTag("user:"+userId)
        revalidateTag("poolsize")
    }
}

export const getSubscriptionPoolSize = unstable_cache(async () => {
    const available = await db.subscription.findMany({
        select: {id: true},
        where: {usedAt: null}
    })
    return available.length
},
    ["poolsize"],
    {
        revalidate: revalidateEverythingTime,
        tags: ["poolsize"]
    }
)