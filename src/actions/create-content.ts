'use server'

import {db} from "@/db";
import {getUser} from "@/actions/get-user";
import { ContentType } from "@prisma/client";


export async function createComment(text: string, parentContentId: string) {
    const author = await getUser()
    if(!author) return false

    await db.content.create({
        data: {
            text: text,
            authorId: author.id,
            parentContentId: parentContentId,
            type: "Comment"
        },
    })

    return true
}



export async function createPost(text: string, postType: ContentType) {
    const author = await getUser()
    if(!author) return false

    await db.content.create({
        data: {
            text: text,
            authorId: author.id,
            type: postType
        },
    })

    return true
}