'use server'

import { revalidateTag, unstable_cache } from "next/cache";
import { db } from "../db";
import { createClient } from "../utils/supabase/server";
import { revalidateEverythingTime } from "./utils";
import { UserProps, UserStats } from "../app/lib/definitions";
import { getEntities } from "./entities";
import { createNotification, getContentById } from "./contents";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import MercadoPagoConfig, { Preference } from "mercadopago";
import { accessToken, contributionsToProportionsMap, isDemonetized, subscriptionEnds } from "../components/utils";
import assert from "assert";
import { pathLogo } from "../components/logo";
import { headers } from "next/headers";
import { userAgent } from "next/server";


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
    await createNotification(userId, userToFollowId, "Follow")
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
        
        return stats
    }, ["userStats", userId], {
        revalidate: Math.min(revalidateEverythingTime, 3600),
        tags: ["userStats", "userStats:"+userId, ""]})()
}



export async function buyAndUseSubscription(userId: string, price: number, paymentId?: string) {
    
    const usedAt = new Date()
    const endsAt = subscriptionEnds(usedAt)
    const result = await db.subscription.create({
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
    revalidateTag("user:"+userId)
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

    await db.subscription.createMany({
        data: queries
    })

    revalidateTag("user:"+userId)
    revalidateTag("poolsize")
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

    await db.subscription.createMany({
        data: queries
    })
    revalidateTag("user:"+userId)
    revalidateTag("poolsize")
}


// TO DO: Atómico
export async function getDonatedSubscription(userId: string) {
    const subscription = await db.subscription.findFirst({
        where: {
            usedAt: null,
            isDonation: true
        }
    })

    if(!subscription){
        return null
    } else {
        const usedAt = new Date()
        const endsAt = subscriptionEnds(usedAt)
        const result = await db.subscription.update({
            data: {
                usedAt: usedAt,
                endsAt: endsAt,
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
        where: {usedAt: null, isDonation: true}
    })
    return available.length
},
    ["poolsize"],
    {
        revalidate: revalidateEverythingTime,
        tags: ["poolsize"]
    }
)


const min_time_between_visits = 60*60*1000 // una hora


export const logVisit = async (contentId: string) => {
    const header = headers()
    const agent = userAgent({headers: header})

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

export async function createPreference(userId: string, amount: number, donationsAmount) {
    const client = new MercadoPagoConfig({ accessToken: accessToken });
    const preference = new Preference(client);

    const price = await getSubscriptionPrice()

    console.log("creating preference with", amount, donationsAmount)
    /*const methods = await fetch(
        "https://api.mercadopago.com/v1/payment_methods", {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
        }
    )*/
    if(amount + donationsAmount == 0) return null

    let title = null
    if(amount == 0){
        if(donationsAmount == 1){
            title = "Un mes de suscripción donado"
        } else {
            title = donationsAmount + " suscripciones donadas"
        }
    } else if(amount == 1){
        if(donationsAmount == 0){
            title = "Un mes de suscripción"
        } else if(donationsAmount == 1){
            title = "Un mes para vos y uno donado"
        } else {
            title = "Un mes para vos y " + donationsAmount + " donados"
        }
    } else if(amount > 1){
        if(donationsAmount == 0){
            title = amount + " meses de suscripción"
        } else if(donationsAmount == 1){
            title = amount + " meses para vos y uno donado"
        } else {
            title = amount + " meses para vos y " + donationsAmount + " meses donados"
        }
    }

    let items = [{
        picture_url: baseUrl+pathLogo,
        id: "0",
        title: title,
        quantity: 1,
        unit_price: (donationsAmount + amount) * price.price,
        currencyId: "ARS"
    }]

    const result = await preference.create({
      body: {
        back_urls: {
            success: baseUrl+"/suscripciones/pago-exitoso",
            pending: baseUrl+"/suscripciones/pago-pendiente",
            failure: baseUrl+"/suscripciones/pago-fallido"
        },
        notification_url: baseUrl+"/api/pago?source_news=webhooks",
        items: items,
        metadata: {
            user_id: userId,
            amount: (amount+donationsAmount)
        },
        payment_methods: {
            excluded_payment_types: [
                {id: "ticket"}
            ]
        }
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
        tags: [
            "chat:"+userId+":"+anotherUserId
        ]})()    
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
    revalidateTag("chat:"+userTo+":"+userFrom)
    revalidateTag("conversations:"+userFrom)
    revalidateTag("conversations:"+userTo)
    revalidateTag("not-responded-count")
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


export async function getSubscriptionPrice() {
    return unstable_cache(async () => {
        const count = await db.subscription.count({
            where: {
                price: {
                    gte: 500,
                }
            }
        })
        console.log("count", count)
        if(count < 100){
            return {price: 500, remaining: 100-count}
        } else {
            return {price: 1000, remaining: 1000-count}
        }
    }, ["subscriptionPrice"], {tags: ["subscriptionPrice"]})()
}


export async function newContactMail(mail: string){
    await db.contactEmails.create({
        data: {
          mail: mail
        }
    })
}


export async function createPaymentPromisesForEntityView(view: {content: {id: string, authorId: string, createdAt: Date}}, viewValue: number, subscriptionId: string){

    console.log("creating payment promises for entity view")

    const content = await getContentById(view.content.id)
    
    const contributions = contributionsToProportionsMap(JSON.parse(content.contribution))

    const authors = Object.keys(contributions)
    console.log("contributions map", contributions)

    for(let i = 0; i < authors.length; i++){
        console.log("creating promise for", authors[i], "with contribution", contributions[authors[i]], "and value", viewValue)
        await db.paymentPromise.create({
            data: {
                authorId: authors[i],
                subscriptionId: subscriptionId,
                contentId: view.content.id,
                amount: viewValue * contributions[authors[i]]
            }
        })
    }
}


export async function createPaymentPromisesForEntityViews(user: UserProps, amount: number, start: Date, end: Date, subscriptionId: string){
    const entityViews = await db.view.findMany({
        select: {
            content: {
                select: {
                    id: true,
                    authorId: true,
                    createdAt: true
                }
            }
        },
        where: {
            userById: user.id,
            content: {
                type: "EntityContent"
            },
            createdAt: {
                gte: start
            }
        }
    })

    const viewValue = amount / entityViews.length

    for(let i = 0; i < entityViews.length; i++){
        const view = entityViews[i]
        await createPaymentPromisesForEntityView(view, viewValue, subscriptionId)
    }
}


export async function createPaymentPromisesForContentReactions(user: UserProps, amount: number, start: Date, end: Date, subscriptionId: string){
    const contentReactions = await db.reaction.findMany({
        select: {
            content: {
                select: {
                    id: true,
                    authorId: true,
                    createdAt: true
                }
            }
        },
        where: {
            userById: user.id,
            content: {
                type: "Post"
            },
            createdAt: {
                gte: start
            }
        }
    })

    const reactionValue = amount / contentReactions.length

    for(let i = 0; i < contentReactions.length; i++){
        const reaction = contentReactions[i]
        console.log("creating payment promise for post reaction", reaction.content.id, "with value", reactionValue)
        await db.paymentPromise.create({
            data: {
                authorId: reaction.content.authorId,
                subscriptionId: subscriptionId,
                contentId: reaction.content.id,
                amount: reactionValue
            }
        })
    }
}


export async function createPaymentPromises(){
    const curDate = new Date()

    const subscriptions = await db.subscription.findMany({
        select: {
            id: true,
            usedAt: true,
            endsAt: true,
            userId: true,
            boughtByUserId: true,
            createdAt: true,
            price: true
        },
        where: {
            price: {
                gt: 0
            },
            usedAt: {
                not: null
            },
            endsAt: {
                lt: curDate
            },
            promisesCreated: false
        }
    })

    console.log("ended subscriptions found", subscriptions.length)
    for(let i = 0; i < subscriptions.length; i++){
        const s = subscriptions[i]
        await createPromises(s.userId, s.price*0.64, s.usedAt, s.endsAt, s.id)
    }
}


export async function createPromises(userId: string, amount: number, start: Date, end: Date, subscriptionId: string){
    const user = await getUserById(userId)

    console.log("creating promises by user", user.id, "with total value", amount, "between", start, "and", end)
    await createPaymentPromisesForEntityViews(user, amount*0.5, start, end, subscriptionId)
    await createPaymentPromisesForContentReactions(user, amount*0.5, start, end, subscriptionId)
}


export async function reassignPromise(p: {id: string, amount: number, subscription: {id: string, userId: string, usedAt: Date, endsAt: Date}}) {
    await db.paymentPromise.update({
        data: {
            status: "Canceled"
        },
        where: {
            id: p.id
        }
    })
    await createPromises(p.subscription.userId, p.amount, p.subscription.usedAt, p.subscription.endsAt, p.subscription.id)
}


export async function confirmPayments() {
    const promises = await db.paymentPromise.findMany({
        select: {
            id: true,
            amount: true,
            subscription: {
                select: {
                    price: true,
                    userId: true,
                    usedAt: true,
                    endsAt: true,
                    id: true
                }
            },
            content: {
                select: {
                    stallPaymentUntil: true,
                    undos: {
                        select: {
                            id: true
                        }
                    },
                    claimsAuthorship: true,
                    rejectedById: true,
                    charsAdded: true,
                    confirmedById: true,
                    editPermission: true
                }
            }
        },
        where: {
            status: "Pending"
        }
    })

    console.log("unconfirmed promises found", promises.length)
    const curDate = new Date()
    for(let i = 0; i < promises.length; i++){
        const p = promises[i]
        if(p.content.stallPaymentUntil < curDate){
            if(isDemonetized(p.content)){
                await reassignPromise(p)
            } else {
                await db.paymentPromise.update({
                    data: {
                        status: "Confirmed"
                    },
                    where: {
                        id: p.id
                    }
                })
            }
        }
    }
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