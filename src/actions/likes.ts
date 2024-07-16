'use server'

import {db} from "@/db";
import {getUser} from "@/actions/get-user";


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