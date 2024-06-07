'use server'

import {db} from "@/db";
import {getUser} from "@/actions/get-user";


export const getLikeState = async (content_id: string) => {
    const user = await getUser()
    if(!user) return "not authenticated"

    const likedContent = await db.content.findUnique({
        where: { id: content_id },
        select: {
            likedBy: {
                where: { id: user.id },
            },
        },
    });

    if(likedContent && likedContent.likedBy.length > 0) return "liked"

    const dislikedContent = await db.content.findUnique({
        where: { id: content_id },
        select: {
            dislikedBy: {
                where: { id: user.id },
            },
        },
    });

    if(dislikedContent && dislikedContent.dislikedBy.length > 0) return "disliked"

    return "none"
};


export const addLike = async (content_id: string) => {
    const author = await getUser()
    if(!author) return false

    await db.content.update({
        where: { id: content_id },
        data: {
            likedBy: {
                connect: { id: author.id },
            },
        },
    });
    removeDislike(content_id)
}


export const addDislike = async (content_id: string) => {
    const author = await getUser()
    if(!author) return false

    await db.content.update({
        where: { id: content_id },
        data: {
            dislikedBy: {
                connect: { id: author.id },
            },
        },
    });
    removeLike(content_id)
}


export const removeLike = async (content_id: string) => {
    const author = await getUser()
    if(!author) return false

    await db.content.update({
        where: { id: content_id },
        data: {
            likedBy: {
                disconnect: { id: author.id },
            },
        },
    });
}


export const removeDislike = async (content_id: string) => {
    const author = await getUser()
    if(!author) return false

    await db.content.update({
        where: { id: content_id },
        data: {
            dislikedBy: {
                disconnect: { id: author.id },
            },
        },
    });
}