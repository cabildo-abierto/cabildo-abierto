'use server'

import {db} from "@/db";
import { revalidateTag } from "next/cache";


export const addLike = async (id: string, userId: string, isEntity: boolean) => {
    if(isEntity){
        await db.reaction.create({
            data: {
                userById: userId,
                entityId: id
            },
        });
        revalidateTag("entities")
    } else {
        await db.reaction.create({
            data: {
                userById: userId,
                contentId: id
            },
        });
        revalidateTag("contents")
    }
    revalidateTag("users")
    revalidateTag("reactions")
}


export const removeLike = async (id: string, userId: string, isEntity: boolean) => {
    if(isEntity){
        await db.reaction.deleteMany({
            where: { 
                AND: [
                    {contentId: id},
                    {userById: userId}
                ]
            }
        });
        revalidateTag("contents")
    } else {
        await db.reaction.deleteMany({
            where: { 
                AND: [
                    {entityId: id},
                    {userById: userId}
                ]
            }
        });
        revalidateTag("entities")
    }
    revalidateTag("users")
    revalidateTag("reactions")
}


export const addView = async (id: string, userId: string) => {
    const exists = await db.view.findMany({
        select: {
            createdAt: true
        },
        where: {
            userById: userId,
            contentId: id
        },
        orderBy: {
            createdAt: "asc"
        }
    })

    function olderThan(seconds: number){
        const dateLast = new Date(exists[exists.length-1].createdAt).getTime()
        const currentDate = new Date().getTime()
        const difference = (currentDate - dateLast) / 1000
        return difference > seconds
    }

    if(exists.length == 0 || olderThan(3600)){
        await db.view.create({
            data: {
                userById: userId,
                contentId: id
            },
        });
        revalidateTag("views")
        revalidateTag("users")
        revalidateTag("reactions")
    }
}