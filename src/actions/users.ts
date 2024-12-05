'use server'

import { revalidateTag, unstable_cache } from "next/cache";
import { db } from "../db";
import { revalidateEverythingTime } from "./utils";
import { SmallUserProps, UserProps, UserStats } from "../app/lib/definitions";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { listOrder, subscriptionEnds, supportDid, validSubscription } from "../components/utils";
import { headers } from "next/headers";
import { userAgent } from "next/server";
import { getSubscriptionPrice } from "./payments";
import { getSessionAgent } from "./auth";
import { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";


export const getUsersNoCache = async (): Promise<SmallUserProps[]> => {
    const users = await db.user.findMany({
        select: {
            id: true,
            handle: true,
            displayName: true,
            avatar: true,
            contents: {
                select: {
                    _count: {
                        select: {
                            reactions: true,
                        }
                    }
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
        if(!user) return []

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

        return usersArray
    },
        ["conversations", userId],
        {
            revalidate: revalidateEverythingTime,
            tags: ["conversations:"+userId]
        }
    )()
}


export const getUserById = async (userId: string): Promise<{user?: UserProps, bskyProfile?: ProfileViewDetailed, error?: string}> => {

    const {user, error} = await unstable_cache(async () => {
        let user: UserProps
        try {
            user = await db.user.findFirst(
                {
                    select: {
                        id: true,
                        displayName: true,
                        handle: true,
                        email: true,
                        description: true,
                        createdAt: true,
                        editorStatus: true,
                        avatar: true,
                        banner: true,
                        following: {
                            select: {
                                id: true
                            }
                        },
                        followers: {
                            select: {
                                id: true
                            }
                        },
                        subscriptionsUsed: {
                            orderBy: {
                                createdAt: "asc"
                            }
                        },
                        subscriptionsBought: {
                            select: {
                                id: true,
                                price: true
                            }, 
                            where: {
                                price: {
                                    gte: 500
                                }
                            }
                        },
                        _count: {
                            select: {
                                notifications: {
                                    where: {
                                        viewed: false
                                    }
                                },
                                contents: {
                                    where: {
                                        fakeReportsCount: {
                                            not: 0
                                        }
                                    }
                                }
                            }
                        }
                    },
                    where: {
                        OR: [
                            {
                                id: userId
                            },
                            {
                                handle:userId
                            }
                        ]
                    }
                }
            )
        } catch {
            console.log("error con get user", userId)
            return {error: "error on get user " + userId}
        }
        return user ? {user} : {error : "error on get user " + userId}
    }, ["user", userId], {
        revalidate: revalidateEverythingTime,
        tags: ["user:"+userId, "user"]})()

    if(error) return {error}

    const {agent} = await getSessionAgent()

    const {data} = await agent.getProfile({actor: userId})

    return {user, bskyProfile: data}
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


export async function follow(userToFollowId: string) {
    const {agent} = await getSessionAgent()

    try {
        await agent.follow(userToFollowId)
    } catch {
        return {error: "Error al seguir al usuario."}
    }

    return {}
}


export async function unfollow(followUri: string) {
    const {agent} = await getSessionAgent()

    try {
        await agent.deleteFollow(followUri)
    } catch {
        return {error: "Error al seguir al usuario."}
    }

    return {}
}


export async function getUserId(){
    const {agent, did} = await getSessionAgent()

    if(!did) return null

    return did
}


export async function getUser(){
    const userId = await getUserId()
    if(userId){
        return await getUserById(userId)
    } else {
        return {error: "Sin sesión."}
    }
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


export async function buySubscriptions(userId: string, donatedAmount: number, paymentId: string) {
    const {user, error} = await getUserById(userId)
    if(error) return {error}

    const queries: {boughtByUserId: string, price: number, paymentId: string, isDonation: boolean, userId: string | null, usedAt: Date | null, endsAt: Date | null}[] = []
    
    const price = await getSubscriptionPrice()

    for(let i = 0; i < donatedAmount / price.price; i++){
        queries.push({
            boughtByUserId: userId,
            price: price.price,
            paymentId: paymentId,
            isDonation: true,
            userId: null,
            usedAt: null,
            endsAt: null
        })
    }

    try {
        await db.subscription.createMany({
            data: queries
        })
    } catch(e) {
        return {error: "error on buy subscriptions"}
    }

    revalidateTag("user:"+userId)
    revalidateTag("poolsize")
    revalidateTag("fundingPercentage")
    return {}
}


// TO DO: Atómico
export async function getDonatedSubscription(userId: string) {
    let subscription
    try {
        subscription = await db.subscription.findFirst({
            where: {
                usedAt: null
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
        revalidateTag("fundingProgress")
        return {}
    }
}


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
                OR: [{toUserId: supportDid}, {fromUserId: supportDid}]
            },
            orderBy: {
                createdAt: "asc"
            }
        }
    )
    const c = new Set()

    for(let i = 0; i < messages.length; i++){
        const m = messages[i]
        if(m.fromUserId == supportDid){
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


// to do: cachear
export async function getUsersByLocation(){
    return {usersByLocation: [], error: undefined}
    /*try {
        const users = await db.users.groupBy({
            by: ['provincia'],
            _count: {
            provincia: true,
            },
        })
        
        return {usersByLocation} // usersByLocation should by {nombre: string, count: number}
    } catch {
        return {error: "error al obtener los usuarios"}
    }*/
}


export const getFundingPercentage = unstable_cache(async () => {
    const available = await db.subscription.findMany({
        select: {id: true},
        where: {
            usedAt: null,
            price: {
                gte: 500
            }
        }
    })
    if(available.length > 0){
        return 100
    }

    const usersWithViews = await db.user.findMany({
        select: {
            id: true,
            subscriptionsUsed: {
                select: {
                    endsAt: true
                },
                orderBy: {
                    endsAt: "asc"
                }
            },
            views: {
                select: {
                    createdAt: true
                },
                orderBy: {
                    createdAt: "desc"
                }
            }
        },
    })

    let activeUsers = 0
    let activeNoSubscription = 0
    usersWithViews.forEach((u) => {
        if(u.views.length > 0 && new Date().getTime() - u.views[0].createdAt.getTime() < 1000*3600*24*30){
            activeUsers ++
            if(!validSubscription(u)){
                activeNoSubscription ++
            }
        }
    })

    console.log("active users", activeUsers)
    console.log("active no subs", activeNoSubscription)

    return (1 - (activeNoSubscription / activeUsers))*100

},
    ["fundingPercentage"],
    {
        revalidate: 5,
        tags: ["fundingPercentage"]
    }
)


export async function assignSubscriptions(){
    const usersWithViews = await db.user.findMany({
        select: {
            id: true,
            subscriptionsUsed: {
                select: {
                    endsAt: true
                },
                orderBy: {
                    usedAt: "asc"
                }
            },
            createdAt: true,
            views: {
                select: {
                    createdAt: true
                },
                orderBy: {
                    createdAt: "desc"
                }
            }
        }
    })

    let usersRequiringSubscription = []

    usersWithViews.forEach((u) => {
        if(u.views.length > 0 && new Date().getTime() - u.views[0].createdAt.getTime() < 1000*3600*24*30){
            if(!validSubscription(u)){
                usersRequiringSubscription.push(u)
            }
        }
    })

    //console.log("users requiring", usersRequiringSubscription.map(({id}) => (id)))

    function userScore(u){
        if(u.subscriptionsUsed.length > 0){
            return [u.subscriptionsUsed[u.subscriptionsUsed.length-1].usedAt]
        } else {
            return [u.createdAt]
        }
    }

    usersRequiringSubscription = usersRequiringSubscription.map((u) => ({user: u, score: userScore(u)})).sort(listOrder).map(({user}) => (user))

    //console.log("sorted", usersRequiringSubscription.map(({id}) => (id)))

    const available = await db.subscription.findMany({
        select: {id: true},
        where: {
            usedAt: null,
            price: {
                gte: 500
            }
        }
    })

    //console.log("available subscriptions", available.length)
    for(let i = 0; i < usersRequiringSubscription.length; i++){
        if(i >= available.length) break
        const usedAt = new Date()
        const endsAt = subscriptionEnds(usedAt)
        await db.subscription.update({
            data: {
                usedAt: usedAt,
                userId: usersRequiringSubscription[i].id,
                endsAt: endsAt,
            },
            where: {
                id: available[i].id
            }
        })    
        console.log("assigned subscription", available[i].id, "to", usersRequiringSubscription[i].id)
    }

    revalidateTag("fundingPercentage")
}


export async function recoverSubscriptions(){
    const sellsByUser = await db.subscription.groupBy({
        by: ['boughtByUserId'],
        _count: {
          boughtByUserId: true,
        },
        where: {
            price: {
                gte: 500
            }
        }
    })
    console.log(sellsByUser)
}


export const getDonationsDistribution = unstable_cache(async () => {
    const users = await db.user.findMany({
        select: {
            subscriptionsBought: {
                select: {
                    price: true
                }
            },
            createdAt: true
        }
    })

    const today = new Date()
    let data: number[] = []
    users.forEach((u) => {
        let t = 0
        u.subscriptionsBought.forEach(({price}) => {
            t += price
        })
        const months = Math.ceil((today.getTime() - u.createdAt.getTime()) / (1000*3600*24*30))
        data.push(t / months)
    })
    data.sort((a, b) => {return Math.sign(a-b)})
    //console.log("data", data)

    const percentiles = data.map((value, index) => {
        return {value, p: index / data.length}
    })

    //console.log("percentiles", percentiles)

    const inverse = []
    let j = 0
    for(let i = 0; i < 100; i++){
        while(percentiles[j].p < i / 100 && j < percentiles.length-1) j++
        inverse.push(percentiles[j].value)
    }

    //console.log("inverse", inverse)
    return inverse
},
    ["donationsDistribution"],
    {
        revalidate: 5,
        tags: ["donationsDistribution"]
    }
)


export async function desassignSubscriptions(){
    await db.subscription.updateMany({
        data: {
            usedAt: null,
            endsAt: null,
            userId: null
        }
    })
}


export async function removeSubscriptions(){
    await db.subscription.deleteMany({
        where: {
            price: {
                lt: 499
            }
        }
    })
}


export async function createNewCAUserForBskyAccount(did: string){
    try {
        const exists = await db.user.findFirst({
            where: {id: did}
        })
        if(!exists){

            const {agent} = await getSessionAgent()
            if(did != agent.assertDid){
                return {error: "El usuario no coincide con la sesión."}
            }
            
            const {data}: {data: ProfileViewDetailed} = await agent.getProfile({actor: agent.assertDid})

            await db.user.create({
                data: {
                    id: did,
                    handle: data.handle,
                    displayName: data.displayName,
                    description: data.description,
                    avatar: data.avatar,
                    banner: data.banner
                }
            })
        } else {
            console.log("User exists.")
        }
    } catch {
        return {error: "Error al crear el usuario"}
    }
    return {}
}


export async function unsafeCreateUserFromDid(did: string){
    const {agent} = await getSessionAgent()
    
    const {data}: {data: ProfileViewDetailed} = await agent.getProfile({actor: did})

    await db.user.create({
        data: {
            id: did,
            handle: data.handle,
            displayName: data.displayName,
            description: data.description,
            avatar: data.avatar,
            banner: data.banner
        }
    })

}