'use server'

import {db} from "@/db";
import { revalidateTag } from "next/cache";


export const addLike = async (contentId: string, userId: string) => {
    await db.reaction.create({
        data: {
            userById: userId,
            contentId: contentId
        },
    });
    revalidateTag("contents")
    revalidateTag("users")
    revalidateTag("reactions")
}


export const removeLike = async (contentId: string, userId: string) => {
    const result = await db.reaction.deleteMany({
        where: { 
            AND: [
                {contentId: contentId},
                {userById: userId}
            ]
        }
    });
    revalidateTag("contents")
    revalidateTag("users")
    revalidateTag("reactions")
    return result
}