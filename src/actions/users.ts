'use server'

import { revalidateTag, unstable_cache } from "next/cache";
import { db } from "../db";
import { revalidateEverythingTime } from "./utils";
import {SmallUserProps, UserProps, UserStats} from "../app/lib/definitions";
import {getRkeyFromUri, supportDid, validSubscription} from "../components/utils";
import { getSubscriptionPrice } from "./payments";
import { getSessionAgent } from "./auth";
import {ProfileView, ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { Prisma } from "@prisma/client";
import {NextResponse} from "next/server";


export const getUsersListNoCache = async (): Promise<{did: string}[]> => {
    const users = await db.user.findMany({
        select: {
            did: true,
            handle: true
        }
    })
    return users
}

export const getUsers = async (): Promise<{users?: SmallUserProps[], error?: string}> => {
    try {
        const users = await db.user.findMany({
            select: {
                did: true,
                handle: true,
                displayName: true,
                avatar: true,
                description: true
            },
            where: {
                inCA: true,
                hasAccess: true
            }
        })
        return {users: users}
    } catch (error) {
        return {error: "Error al obtener a los usuarios."}
    }
}
    

export const getConversations = (userId: string) => {
    return unstable_cache(async () => {
        const user = await db.user.findUnique(
            {
                select: {
                    did: true,
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
                    did: userId
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


export async function getATProtoUserById(userId: string): Promise<{profile?: ProfileViewDetailed, error?: string}> {
    try {
        const {agent} = await getSessionAgent()
        const {data} = await agent.getProfile({
            actor: userId
        })
        return {profile: data}
    } catch {
        return {error: "Error getting ATProto user"}
    }
}


const fullUserQuery = {
    did: true,
    handle: true,
    avatar: true,
    banner: true,
    displayName: true,
    description: true,
    email: true,
    createdAt: true,
    hasAccess: true,
    inCA: true,
    editorStatus: true,
    subscriptionsUsed: {
        orderBy: {
            createdAt: "asc" as Prisma.SortOrder
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
    records: {
        select: {
            cid: true,
            follow: {
                select: {
                    userFollowedId: true
                }
            }
        },
        where: {
            collection: "app.bsky.graph.follow",
            follow: {
                userFollowed: {
                    inCA: true
                }
            }
        }
    },
    followers: {
        select: {
            uri: true,
            record: {
                select: {
                    authorId: true
                }
            }
        }
    },
    messagesReceived: {
        select: {
            createdAt: true,
            id: true,
            text: true,
            fromUserId: true,
            toUserId: true,
            seen: true
        }
    },
    messagesSent: {
        select: {
            createdAt: true,
            id: true,
            text: true,
            fromUserId: true,
            toUserId: true,
            seen: true
        }
    }
}


export const getFullProfileById = async (userId: string): Promise<{user?: UserProps, atprotoProfile?: ProfileViewDetailed, error?: string}> => {
    const promiseATProtoProfile = getATProtoUserById(userId)

    const promiseCAUser = db.user.findFirst(
        {
            select: fullUserQuery,
            where: {
                OR: [
                    {
                        did: userId
                    },
                    {
                        handle: userId
                    }
                ]
            }
        }
    )

    const [CAUser, ATProtoProfile] = await Promise.all([promiseCAUser, promiseATProtoProfile])

    if(!CAUser){
        return {atprotoProfile: ATProtoProfile.profile ? ATProtoProfile.profile : null}
    }

    let following = undefined
    for(let i = 0; i < CAUser.followers.length; i++) {
        const f = CAUser.followers[i]
        if(f.record.authorId == userId){
            following = f.uri
        }
    }

    let followed = undefined
    for(let i = 0; i < CAUser.records.length; i++){
        const r = CAUser.records[i]
        if(r.follow.userFollowedId == userId){
            followed = r.cid
        }
    }

    return {
        user: {
            ...CAUser,
            followersCount: CAUser.followers.length,
            followsCount: CAUser.records.length,
            viewer: {
                following,
                followed
            }
        },
        atprotoProfile: ATProtoProfile.profile ? ATProtoProfile.profile : undefined
    }
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
    const {did} = await getSessionAgent()
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


export async function getUserById(userId: string){
    return await unstable_cache(async () => {
        return await getUserByIdNoCache(userId)
    },
        ["user:"+userId],
        {
            tags: ["user:"+userId, "user"],
            revalidate: revalidateEverythingTime
        }
    )()
}


export async function getUserByIdNoCache(userId: string){
    try {
        const user = await db.user.findFirst(
            {
                select: fullUserQuery,
                where: {
                    OR: [
                        {
                            did: userId
                        },
                        {
                            handle: userId
                        }
                    ]
                }
            }
        )
        return {user}
    } catch {
        return {error: "No se pudo obtener el usuario."}
    }
}


export async function getBskyUser(): Promise<{bskyUser?: ProfileViewDetailed, error?: string}>{
    const {agent, did} = await getSessionAgent()
    try {
        const {data} = await agent.getProfile({actor: did})
        return {bskyUser: data}
    } catch {
        return {error: "User not found."}
    }
}


export async function buySubscriptions(userId: string, donatedAmount: number, paymentId: string) {
    const did = await getUserId()
    if(!did || did != userId) return {error: "Error de autenticación"}

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


const min_time_between_visits = 60*60*1000 // una hora


function olderThan(date: Date, ms: number){
    return new Date().getTime() - date.getTime() <= ms
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


export const getSupportNotRespondedCount = async () => {
    const {user} = await getUser()
    if(!user || user.editorStatus != "Administrator"){
        return {error: "Sin permisos suficientes."}
    }

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

    return {count: c.size}
}


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


/*export async function createNewCAUserForBskyAccount(did: string, agent: Agent){
    try {
        const exists = await db.user.findFirst({
            where: {did: did}
        })
        if(!exists){

            const {data}: {data: ProfileViewDetailed} = await agent.getProfile({actor: agent.assertDid})

            await db.user.create({
                data: {
                    did: did,
                    handle: data.handle
                }
            })
        }
    } catch(err) {
        console.log("error", err)
        return {error: "Error al crear el usuario"}
    }
    return {}
}*/


export async function setATProtoProfile(did: string){

    try {
        const {agent} = await getSessionAgent()

        const {data} = await agent.com.atproto.repo.listRecords({
            repo: did,
            collection: "ar.com.cabildoabierto.profile"
        })
        if(data.records.some((r) => (getRkeyFromUri(r.uri) == "self"))){
            const rec = {
                repo: did,
                collection: 'ar.com.cabildoabierto.profile',
                rkey: getRkeyFromUri(data.records[0].uri),
                record: {
                    createdAt: new Date().toISOString(),
                },
            }
            await agent.com.atproto.repo.putRecord(rec)
            return {}
        }

        await agent.com.atproto.repo.createRecord({
            repo: did,
            collection: 'ar.com.cabildoabierto.profile',
            rkey: "self",
            record: {
                createdAt: new Date().toISOString(),
            },
        })

        return {}
    } catch (err) {
        console.log("Error", err)
        return {error: "Error al conectar con ATProto."}
    }
}


export async function unsafeCreateUserFromDid(did: string){
    const {agent} = await getSessionAgent()
    
    const {data}: {data: ProfileViewDetailed} = await agent.getProfile({actor: did})

    await db.user.create({
        data: {
            did: did,
            handle: data.handle
        }
    })

}


export async function updateEmail(email: string){
    const {bskyUser} = await getBskyUser()
    try {
        await db.user.upsert({
            update: {email: email},
            create: {did: bskyUser.did, handle: bskyUser.handle, displayName: bskyUser.displayName, email: email},
            where: {did: bskyUser.did}
        })
    } catch (error) {
        console.log(error)
        return {error: "Ups... Ocurrió un error al guardar el mail. Volvé a intentarlo."}
    }
    return {}
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
                did: true,
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


export async function searchATProtoUsers(q: string): Promise<{users?: ProfileView[], error?: string}> {
    try {
        const {agent} = await getSessionAgent()

        const {data} = await agent.searchActors({
            q
        })
        return {users: data.actors}
    } catch (error) {
        console.log(error)
        return {error: "Ocurrió un error en la búsqueda de usuarios de Bluesky."}
    }
}


export async function getUserStats(): Promise<{stats?: UserStats, error?: string}>{
    const stats = {
        posts: 0,
        entityEdits: 0,
        editedEntities: 0,
        reactionsInPosts: 0,
        reactionsInEntities: 0,
        income: 0,
        pendingConfirmationIncome: 0,
        pendingPayIncome: 0,
        entityAddedChars: 0,
        viewsInPosts: 0,
        viewsInEntities: 0
    }
    return {stats}
}