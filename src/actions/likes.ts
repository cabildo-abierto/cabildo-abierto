'use server'

import {db} from "@/db";
import {getUser} from "@/actions/get-user";


export const addLike = async (contentId: string, userId: string) => {

    await db.content.update({
        where: { id: contentId },
        data: {
            likedBy: {
                connect: { id: userId },
            },
        },
    });
    await removeDislike(contentId, userId)
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
    await removeLike(contentId, userId)
}


export const removeLike = async (contentId: string, userId: string) => {

    await db.content.update({
        where: { id: contentId },
        data: {
            likedBy: {
                disconnect: { id: userId },
            },
        },
    });
}


export const removeDislike = async (contentId: string, userId: string) => {
    await db.content.update({
        where: { id: contentId },
        data: {
            dislikedBy: {
                disconnect: { id: userId },
            },
        },
    });
}