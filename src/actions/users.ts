'use server'

import { revalidateTag, unstable_cache } from "next/cache";
import { db } from "../db";
import { createClient } from "../utils/supabase/server";
import { revalidateEverythingTime } from "./utils";
import { SmallUserProps, UserProps, UserStats } from "../app/lib/definitions";
import { getEntities } from "./entities";
import { createNotification, getContentById } from "./contents";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import MercadoPagoConfig, { Preference } from "mercadopago";
import { accessToken, contributionsToProportionsMap, isDemonetized, listOrderDesc, subscriptionEnds, validSubscription } from "../components/utils";
import { pathLogo } from "../components/logo";
import { headers } from "next/headers";
import { userAgent } from "next/server";
import { isSameDay } from "date-fns";
import { NoAccountUser } from "@prisma/client";


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


export const getUsersNoCache = async (): Promise<SmallUserProps[]> => {
    const users = await db.user.findMany({
        select: {
            id: true,
            name: true,
            following: {select: {id: true}},
            contents: {
                select: {
                    _count: {
                        select: {
                            reactions: true,
                        }
                    },
                    uniqueViewsCount: true
                },
                where: {
                    type: {
                        in: ["Comment", "Post", "FastPost"]
                    }
                }
            }
        },
        where: {
            id: {
                not: "guest"
            }
        }
    })
    return users
}


export const getUsers = async (): Promise<{users?: SmallUserProps[], error?: string}> => {
    try {
        const users = await unstable_cache(async () => {
            return await getUsersNoCache()
        },
            ["users"],
            {
                revalidate: revalidateEverythingTime,
                tags: ["users"]
            }
        )() 
        return {users}
    } catch {
        return {error: "Error al obtener los usuarios."}
    }
}
    


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
    const {users, error} = await getUsers()
    if(error) return {error}

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
        let user: UserProps
        try {
            user = await db.user.findUnique(
                {
                    select: {
                        id: true,
                        name: true,
                        createdAt: true,
                        authenticated: true,
                        editorStatus: true,
                        subscriptionsUsed: {
                            orderBy: {
                                createdAt: "asc"
                            }
                        },
                        subscriptionsBought: {
                            select: {
                                id: true
                            }, 
                            where: {
                                userId: null,
                                isDonation: false,
                                price: {
                                    gte: 500
                                }
                            }
                        },
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
                                views: {
                                    where: {
                                        content: {
                                            parentEntityId: "Cabildo_Abierto"
                                        }
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
                        },
                        closedFollowSuggestionsAt: true
                    },
                    where: {id:userId}
                }
            )
        } catch {
            return {error: "error on get entity"}
        }
        return user ? {user} : {error : "error on get entity"}
    }, ["user", userId], {
        revalidate: revalidateEverythingTime,
        tags: ["user:"+userId, "user"]})()    
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


export async function getUser(): Promise<{error?: string, user?: UserProps}> {
    const userId = await getUserId()
    if(!userId) return {error: "no user id"}

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
    const {user, error} = await getUserById(userId)
    if(error) return {error}

    if(user.following.some(({id}) => (userToFollowId == id))){
        return {error: "already follows"}
    }

    let updatedUser

    try {
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
        })
    } catch {
        return {error: "error on update user"}
    }

    revalidateTag("user:"+userToFollowId)
    revalidateTag("user:"+userId)
    const {error: errorOnNotify} = await createNotification(userId, userToFollowId, "Follow")
    if(errorOnNotify) return {error: errorOnNotify}
    return {updatedUser};
}


export async function unfollow(userToUnfollowId: string, userId: string) {
    let updatedUser
    try {
        updatedUser = await db.user.update({
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
        })
    } catch {
        return {error: "error on update user"}
    }

    revalidateTag("user:"+userToUnfollowId)
    revalidateTag("user:"+userId)
    return {updatedUser};
}


export const getUserIncome = async (userId: string) => {
    let income = 0
    let pendingConfirmationIncome = 0

    const promises = await db.paymentPromise.findMany({
        select: {
            amount: true,
            status: true
        },
        where: {
            authorId: userId
        }
    })
    
    for(let i = 0; i < promises.length; i++){
        const p = promises[i]
        if(p.status == "Canceled") continue
        if(p.status == "Pending"){
            pendingConfirmationIncome += p.amount
        } else {
            income += p.amount
        }
    }

    return {income: income, pendingPayIncome: income, pendingConfirmationIncome: pendingConfirmationIncome}
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
        
        const {entities, error} = await getEntities()
        if(error) return {error: error}

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

        const {income, pendingConfirmationIncome, pendingPayIncome} = await getUserIncome(userId)

        const stats: UserStats = {
            posts: postsIds.length,
            entityEdits: entityEdits,
            editedEntities: editedEntitiesIds.size,
            reactionsInPosts: reactionsInPosts,
            reactionsInEntities: entityReactions,
            income: income,
            pendingConfirmationIncome: pendingConfirmationIncome,
            pendingPayIncome: pendingPayIncome,
            entityAddedChars: entityAddedChars,
            viewsInPosts: viewsInPosts,
            viewsInEntities: entityViews
        }
        
        return {stats}
    }, ["userStats", userId], {
        revalidate: Math.min(revalidateEverythingTime, 3600),
        tags: ["userStats", "userStats:"+userId, ""]})()
}



export async function buyAndUseSubscription(userId: string, price: number, paymentId?: string) {
    
    const usedAt = new Date()
    const endsAt = subscriptionEnds(usedAt)
    
    try {
        await db.subscription.create({
            data: {
                userId: userId,
                boughtByUserId: userId,
                usedAt: usedAt,
                endsAt: endsAt,
                paymentId: paymentId,
                price: price,
                isDonation: false
            }
        })
    } catch {
        return {error: "error on create subscription"}
    }
    revalidateTag("user:"+userId)
    return {}
}


export async function stockSubscriptions(userId: string, price: number, n: number, paymentId?: string) {
    
    const queries = []
    
    for(let i = 0; i < n; i++){
        queries.push({
            boughtByUserId: userId,
            price: price,
            paymentId: paymentId,
            isDonation: false
        })
    }

    try {
        await db.subscription.createMany({
            data: queries
        })
    } catch {
        return {error: "error on stock subscriptions"}
    }

    revalidateTag("user:"+userId)
    revalidateTag("poolsize")
    return {}
}

export async function donateSubscriptions(n: number, userId: string, paymentId: string, price: number) {
    const queries = []
    
    for(let i = 0; i < n; i++){
        queries.push({
            boughtByUserId: userId,
            price: price,
            paymentId: paymentId,
            isDonation: true
        })
    }

    try {
        await db.subscription.createMany({
            data: queries
        })
    } catch {
        return {error: "error on donate subscriptions"}
    }
    revalidateTag("user:"+userId)
    revalidateTag("poolsize")
    return {}
}


// TO DO: Atómico
export async function getDonatedSubscription(userId: string) {
    let subscription
    try {
        subscription = await db.subscription.findFirst({
            where: {
                usedAt: null,
                isDonation: true
            }
        })
    } catch {
        return {error: "error finding donated subscription"}
    }

    if(!subscription){
        return {error: "no donated subscription"}
    } else {
        const usedAt = new Date()
        const endsAt = subscriptionEnds(usedAt)
        try {
            await db.subscription.update({
                data: {
                    usedAt: usedAt,
                    endsAt: endsAt,
                    userId: userId
                },
                where: {
                    id: subscription.id
                }
            })
        } catch {
            return {error: "error on use donated subscription"}
        }
        revalidateTag("user:"+userId)
        revalidateTag("poolsize")
        return {}
    }
}

export const getSubscriptionPoolSize = unstable_cache(async () => {
    try {
        const available = await db.subscription.findMany({
            select: {id: true},
            where: {usedAt: null, isDonation: true}
        })
        return {poolSize: available.length}
    } catch {
        return {error: "error getting subscription poolsize"}
    }
},
    ["poolsize"],
    {
        revalidate: revalidateEverythingTime,
        tags: ["poolsize"]
    }
)


const min_time_between_visits = 60*60*1000 // una hora


function olderThan(date: Date, ms: number){
    return new Date().getTime() - date.getTime() <= ms
}


export const logVisit = async (contentId: string): Promise<{error?: string, user?: NoAccountUserProps}> => {
    const header = headers()
    const agent = userAgent({headers: header})

    const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0]

    let user
    try {
        user = await db.noAccountUser.findFirst({
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
    } catch {
        return {error: "error finding no account user"}
    }

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
        if(visit && olderThan(visit.createdAt, min_time_between_visits)){ 
            recentVisit = true
        }
    }
    if(!recentVisit){
        try {
            await db.noAccountVisit.create({
                data: {
                    userId: user.id,
                    contentId: contentId,
                }
            })
        } catch {
            return {error: "error creating no account visit"}
        }
    }
    return await getNoAccountUser(header, agent)
}


export type NoAccountUserProps = {
    id: string
    visits: {
        createdAt: Date
    }[]
}


export const getNoAccountUser = async (header: ReadonlyHeaders, agent: any): Promise<{error?: string, user?: NoAccountUserProps}> => {
    const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0]

    try {
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

        return {user}
    } catch {
        return {error: "error on get no account user"}
    }
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
        tags: [
            "chat:"+userId+":"+anotherUserId
        ]})()    
}


export async function sendMessage(message: string, userFrom: string, userTo: string){
    try {
        await db.chatMessage.create({
            data: {
                text: message,
                fromUserId: userFrom,
                toUserId: userTo
            }
        })
    } catch {
        return {error: "Ocurrió un error al enviar el mensaje."}
    }
    revalidateTag("chat:"+userFrom+":"+userTo)
    revalidateTag("chat:"+userTo+":"+userFrom)
    revalidateTag("conversations:"+userFrom)
    revalidateTag("conversations:"+userTo)
    revalidateTag("not-responded-count")
    return {}
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
    
    revalidateTag("chat:"+userFrom+":"+userTo)
    revalidateTag("chat:"+userTo+":"+userFrom)
    revalidateTag("conversations:"+userFrom)
    revalidateTag("conversations:"+userTo)
}


export const getSupportNotRespondedCount = unstable_cache(async () => {
    const messages = await db.chatMessage.findMany(
        {
            select: {
                id: true,
                fromUserId: true,
                toUserId: true
            },
            where: {
                OR: [{toUserId: "soporte"}, {fromUserId: "soporte"}]
            },
            orderBy: {
                createdAt: "asc"
            }
        }
    )
    const c = new Set()

    for(let i = 0; i < messages.length; i++){
        const m = messages[i]
        if(m.fromUserId == "soporte"){
            c.delete(m.toUserId)
        } else {
            c.add(m.fromUserId)
        }
    }

    return c.size
},
    ["not-responded-count"],
    {
        revalidate: revalidateEverythingTime,
        tags: ["not-responded-count"]
    }
)


export async function addDonatedSubscriptionsManually(boughtByUserId: string, amount: number, price: number, paymentId?: string){

    const data = []
    for(let i = 0; i < amount; i++){
        data.push({
            boughtByUserId: boughtByUserId,
            price: price,
            paymentId: paymentId,
            isDonation: true
        })
    }

    await db.subscription.createMany({
        data: data
    })
    
}


export async function getUserFollowSuggestions(userId: string){

    return await unstable_cache(async () => {
        const {user, error} = await getUserById(userId)
        if(error) return {error}
        const {users, error: usersError} = await getUsers()
        if(usersError) return {error: usersError}

        const following = new Set<string>(user.following.map(({id}) => (id)))

        function filter(u: {id: string}){
            return !following.has(u.id) && u.id != user.id
        }

        function suggestionScore(s: {id: string, contents?: {_count: {reactions:number}, uniqueViewsCount?: number}[], following?: {id: string}[]}){
            let n = 0
            for(let i = 0; i < s.following.length; i++){
                if(following.has(s.following[i].id)) n++
            }

            let writingScore = 0
            for(let i = 0; i < s.contents.length; i++){
                writingScore += s.contents[i]._count.reactions / s.contents[i].uniqueViewsCount
            }
            writingScore /= Math.max(s.contents.length, 1)

            return [n, writingScore, Math.random()]
        }

        let suggestions = users.filter(filter)

        let scores = suggestions.map((u) => ({user: u, score: suggestionScore(u)}))

        scores = scores.sort(listOrderDesc)
        
        return {suggestions: scores.map(({user}) => (user))}

    }, ["followSuggestions", userId], {revalidate: revalidateEverythingTime, tags: ["followSuggestions", userId]})()
}


export async function updateClosedFollowSuggestions(userId: string){
    await db.user.update({
        data: {
            closedFollowSuggestionsAt: new Date()
        },
        where: {
            id: userId
        }
    })
    revalidateTag("user:"+userId)
    return true
}