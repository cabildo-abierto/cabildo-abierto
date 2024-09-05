'use server';

import { revalidateTag, unstable_cache } from 'next/cache';
import { db } from '../db';


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
        tags: ["poolsize"]
    }
)