'use server'

import {db} from "@/db";
import { ContentType } from "@prisma/client";


export async function createComment(text: string, parentContentId: string, userId: string) {

    const comment = await db.content.create({
        data: {
            text: text,
            authorId: userId,
            parentContentId: parentContentId,
            type: "Comment"
        },
    })
    return // await getContentById(comment.id) as ContentProps
}



export async function createPost(text: string, postType: ContentType, isDraft: boolean, userId: string) {

    return await db.content.create({
        data: {
            text: text,
            authorId: userId,
            type: postType,
            isDraft: isDraft
        },
    })
}


export async function updateContent(text: string, contentId: string) {

    await db.content.update({
        where: {
            id: contentId
        },
        data: {
            text: text
        }
    })

    return true
}


export async function publishDraft(text: string, contentId: string) {

    await db.content.update({
        where: {
            id: contentId
        },
        data: {
            text: text,
            isDraft: false,
            createdAt: new Date()
        }
    })

    return true
}