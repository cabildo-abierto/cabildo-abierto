'use server'

import { revalidateTag, unstable_cache } from "next/cache";
import { db } from "../db";
import { createClient } from "../utils/supabase/server";
import { revalidateEverythingTime } from "./utils";
import { UserStats } from "../app/lib/definitions";
import { getEntities } from "./entities";
import { createNotification } from "./contents";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import MercadoPagoConfig, { Customer, CustomerCard, Payment, Preference } from "mercadopago";
import { accessToken, getSubscriptionPrice } from "../components/utils";


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


export const getConversations = (userId: string) => {
    return unstable_cache(async () => {
        const user = await db.user.findUnique(
            {
                select: {
                    id: true,
                    name: true,
                    following: {
                        select: {
                            id: true
                        }
                    },
                    messagesSent: {
                        select: {
                            id: true,
                            createdAt: true,
                            fromUserId: true,
                            toUserId: true,
                            text: true,
                            seen: true
                        },
                    },
                    messagesReceived: {
                        select: {
                            id: true,
                            createdAt: true,
                            fromUserId: true,
                            toUserId: true,
                            text: true,
                            seen: true
                        }
                    }
                },
                where: {
                    id: userId
                }
            }
        )

        let users = new Map<string, {date: Date, seen: boolean}>()

        function addMessage(from: string, date: Date, seen: boolean){
            if(users.has(from)){
                if(users.get(from).date.getTime() < date.getTime()){
                    users.set(from, {date: date, seen: seen})
                }
            } else {
                users.set(from, {date: date, seen: seen})
            }
        }

        user.messagesReceived.forEach((m) => {
            addMessage(m.fromUserId, m.createdAt, m.seen)
        })

        user.messagesSent.forEach((m) => {
            addMessage(m.toUserId, m.createdAt, m.seen)
        })

        const usersArray = Array.from(users).map(([u, d]) => ({id: u, date: d.date, seen: d.seen}))

        return [...usersArray, ...user.following.map(({id}) => ({id: id, date: null, seen: null}))]
    },
        ["conversations", userId],
        {
            revalidate: revalidateEverythingTime,
            tags: ["conversations:"+userId]
        }
    )()
}


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
                    description: true,
                    _count: {
                        select: {
                            notifications: {
                                where: {
                                    viewed: false
                                }
                            },
                            contents: {
                                where: {
                                    NOT: {
                                        fakeReportsCount: {
                                            equals: 0
                                        }
                                    }
                                }
                            }
                        }
                    }
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
                            },
                            charsAdded: true
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
    createNotification(userId, userToFollowId, "Follow")
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
        
        const entities = await getEntities()

        let entityReactions = 0
        let entityViews = 0
        let entityAddedChars = 0
        for(let i = 0; i < entities.length; i++){
            const entity = entities[i]
            if(editedEntitiesIds.has(entity.id)){
                let isAuthor = false
                for(let j = 0; j < entity.versions.length; j++){
                    if(entity.versions[j].authorId == userId){
                        isAuthor = true
                    }
                    if(isAuthor){
                        for(let k = 0; k < userContents.length; k++){
                            if(userContents[k].id == entity.versions[j].id){
                                entityAddedChars += userContents[k].charsAdded
                                entityReactions += userContents[k]._count.reactions
                                entityViews += userContents[k]._count.views
                                break
                            }
                        }
                    }
                }
            }
        }

        const stats: UserStats = {
            posts: postsIds.length,
            entityEdits: entityEdits,
            editedEntities: editedEntitiesIds.size,
            reactionsInPosts: reactionsInPosts,
            reactionsInEntities: entityReactions,
            income: 0,
            entityAddedChars: entityAddedChars,
            viewsInPosts: viewsInPosts,
            viewsInEntities: 0
        }
        
        return stats
    }, ["userStats", userId], {
        revalidate: Math.min(revalidateEverythingTime, 3600),
        tags: ["userStats", "userStats:"+userId, ""]})()
}



export async function buyAndUseSubscription(userId: string, paymentId: string, price: number) {
    const result = await db.subscription.create({
        data: {
            userId: userId,
            boughtByUserId: userId,
            usedAt: new Date(),
            paymentId: paymentId,
            price: price
        }
    })
    revalidateTag("user:"+userId)
}

export async function donateSubscriptions(n: number, userId: string, paymentId: string, price: number) {
    const queries = []
    
    for(let i = 0; i < n; i++){
        queries.push({
            boughtByUserId: userId,
            price: price,
            paymentId: paymentId
        })
    }

    await db.subscription.createMany({
        data: queries
    })
    revalidateTag("user:"+userId)
    revalidateTag("poolsize")
}


// TO DO: esto debería ser atómico
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


const min_time_between_visits = 60*60*1000


export const logVisit = async (header: ReadonlyHeaders, agent: any, contentId: string) => {
    const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0]

    let user = await db.noAccountUser.findFirst({
        where: {
            ip: ip,
            browser: JSON.stringify(agent.browser),
            engine: JSON.stringify(agent.engine),
            os: JSON.stringify(agent.os),
            device: JSON.stringify(agent.device),
            cpu: JSON.stringify(agent.cpu),
            isBot: agent.isBot
        }
    })
    const newUser = user == null
    if(newUser){
        user = await db.noAccountUser.create({
            data: {
                ip: ip,
                ua: agent.ua,
                browser: JSON.stringify(agent.browser),
                engine: JSON.stringify(agent.engine),
                os: JSON.stringify(agent.os),
                device: JSON.stringify(agent.device),
                cpu: JSON.stringify(agent.cpu),
                isBot: agent.isBot
            }
        })
    }

    let recentVisit = false
    if(!newUser){
        const visit = await db.noAccountVisit.findFirst({
            where: {
                userId: user.id,
                contentId: contentId
            },
            orderBy: {
                createdAt: "desc"
            }
        })
        if(visit && new Date().getTime() - visit.createdAt.getTime() <= min_time_between_visits){ 
            recentVisit = true
        }
    }
    if(!recentVisit){
        await db.noAccountVisit.create({
            data: {
                userId: user.id,
                contentId: contentId,
            }
        })
    }
    return await getNoAccountUser(header, agent)
}


export const getNoAccountUser = async (header: ReadonlyHeaders, agent: any) => {
    const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0]

    let user = await db.noAccountUser.findFirst({
        where: {
            ip: ip,
            browser: JSON.stringify(agent.browser),
            engine: JSON.stringify(agent.engine),
            os: JSON.stringify(agent.os),
            device: JSON.stringify(agent.device),
            cpu: JSON.stringify(agent.cpu),
            isBot: agent.isBot
        },
        select: {
            id: true,
            visits: {
                select: {
                    createdAt: true
                }
            }
        }
    })

    return user
}

const baseUrl = "https://www.cabildoabierto.com.ar"
//const baseUrl = "localhost:3000"

export async function createPreference(userId: string, amount: number) {
    const client = new MercadoPagoConfig({ accessToken: accessToken });
    const preference = new Preference(client);

    let title = 'Un mes de suscripción en Cabildo Abierto'
    if(amount > 1){
        title = amount + " meses de suscripción en Cabildo Abierto"
    }

    const result = await preference.create({
      body: {
        back_urls: {
            success: baseUrl+"/suscripciones/pago-exitoso",
            pending: baseUrl+"/suscripciones/pago-pendiente",
            failure: baseUrl+"/suscripciones/pago-fallido"
        },
        notification_url: baseUrl+"/api/pago?source_news=webhooks",
        items: [
          {
            picture_url: baseUrl+"/cabildo-icono.png",
            id: "0",
            title: title,
            quantity: 1,
            unit_price: getSubscriptionPrice()*amount
          }
        ],
        metadata: {
            user_id: userId,
            amount: amount
        },
      }
    })

    return result.id
}


export const getChatBetween = (userId: string, anotherUserId: string) => {
    return unstable_cache(async () => {
        const messages = await db.chatMessage.findMany({
            select: {
                createdAt: true,
                id: true,
                text: true,
                fromUserId: true,
                toUserId: true,
                seen: true
            },
            where: {
                OR: [{
                    fromUserId: userId,
                    toUserId: anotherUserId
                },
                {
                    fromUserId: anotherUserId,
                    toUserId: userId
                }
                ]
            },
            orderBy: {
                createdAt: "asc"
            }
        })
        return messages
    }, ["chat", userId, anotherUserId], {
        revalidate: revalidateEverythingTime,
        tags: ["chat:"+userId+":"+anotherUserId, "chat:"+anotherUserId+":"+userId]})()    
}


export async function sendMessage(message: string, userFrom: string, userTo: string){
    await db.chatMessage.create({
        data: {
            text: message,
            fromUserId: userFrom,
            toUserId: userTo
        }
    })
    revalidateTag("chat:"+userFrom+":"+userTo)
    revalidateTag("conversations:"+userFrom)
    revalidateTag("conversations:"+userTo)
}


export async function setMessageSeen(id: string, userFrom: string, userTo: string){
    await db.chatMessage.update({
        data: {
            seen: true
        },
        where: {
            id: id
        }
    })
    console.log("message", id, "is seen", userFrom, userTo)
    revalidateTag("chat:"+userFrom+":"+userTo)
    revalidateTag("conversations:"+userFrom)
    revalidateTag("conversations:"+userTo)
}