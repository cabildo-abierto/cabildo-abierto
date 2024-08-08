'use server';

import { db } from '@/db';
import { cache } from './cache';
import { redirect } from 'next/navigation';
import { revalidateTag } from 'next/cache';


export async function buyAndUseSubscription(userId: string, redirect_on_done: boolean = true) { 
    const result = await db.subscription.create({
        data: {
            userId: userId,
            boughtByUserId: userId,
            usedAt: new Date()
        }
    })
    revalidateTag("user")
    revalidateTag("users")
    if(redirect_on_done)
        redirect("/inicio")
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
    revalidateTag("user")
    revalidateTag("users")
    redirect("/inicio")
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
        revalidateTag("user")
        revalidateTag("users")
        redirect("/inicio")
        return result
    }
}

export const getSubscriptionPoolSize = cache(async () => {
    console.log("getting pool size")
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