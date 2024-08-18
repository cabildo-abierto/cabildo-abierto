'use server'

import {db} from "@/db";
import { revalidateTag } from "next/cache";


export const addLike = async (contentId: string, userId: string) => {
    await db.content.update({
        where: { id: contentId },
        data: {
            likedBy: {
                connect: { id: userId },
            },
        },
    });
    revalidateTag("contents")
    revalidateTag("users")
    return await removeDislike(contentId, userId)
}


export const addDislike = async (contentId: string, userId: string) => {
    await db.content.update({
        where: { id: contentId },
        data: {
            dislikedBy: {
                connect: { id: userId },
            },
        },
    });
    const result = await removeLike(contentId, userId)
    revalidateTag("contents")
    revalidateTag("users")
    return result
}


export const removeLike = async (contentId: string, userId: string) => {
    const result = await db.content.update({
        where: { id: contentId },
        data: {
            likedBy: {
                disconnect: { id: userId },
            },
        },
    });
    revalidateTag("contents")
    revalidateTag("users")
    return result
}


export const removeDislike = async (contentId: string, userId: string) => {
    const result = await db.content.update({
        where: { id: contentId },
        data: {
            dislikedBy: {
                disconnect: { id: userId },
            },
        },
    });
    revalidateTag("users")
    revalidateTag("contents")
    return result
}