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