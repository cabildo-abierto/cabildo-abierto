'use server';

import { db } from '@/db';
import { getUserById, getUserId } from './get-user';


export async function buyAndUseSubscription(userId) { 

    await db.subscription.create({
        data: {
            userId: userId,
            boughtByUserId: userId,
            usedAt: new Date()
        }
    })

    return await getUserById(userId)
}

export async function donateSubscriptions(n) {
    const userId = await getUserId()

    const queries = []
    
    for(let i = 0; i < n; i++){
        queries.push({
            boughtByUserId: userId
        })
    }
    console.log(queries)

    await db.subscription.createMany({
        data: queries
    })
}

export async function useDonatedSubscription() {
    const userId = await getUserId()

    const subscription = await db.subscription.findFirst({
        where: {
            usedAt: null
        }
    })

    if(!subscription){
        console.log("No subscription")
        return null
    } else {
        return await db.subscription.update({
            data: {
                usedAt: new Date(),
                userId: userId
            },
            where: {
                id: subscription.id
            }
        })
    }
}

export async function getSubscriptionPoolSize() {
    const available = await db.subscription.findMany({
        select: {id: true},
        where: {usedAt: null}
    })
    return available.length
}

export async function getSubscriptionPrice() {
    return 1000
}