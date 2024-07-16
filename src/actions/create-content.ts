'use server'

import {db} from "@/db";
import {getUser} from "@/actions/get-user";
import { ContentType } from "@prisma/client";
import { getContentById } from "./get-content";


export async function createComment(text: string, parentContentId: string) {
    const author = await getUser()
    if(!author) return null

    const comment = await db.content.create({
        data: {
            text: text,
            authorId: author.id,
            parentContentId: parentContentId,
            type: "Comment"
        },
    })
    return await getContentById(comment.id)
}



export async function createPost(text: string, postType: ContentType, isDraft: boolean) {
    const author = await getUser()
    if(!author) return false

    await db.content.create({
        data: {
            text: text,
            authorId: author.id,
            type: postType,
            isDraft: isDraft
        },
    })

    return true
}


export async function updateContent(text: string, contentId: string) {
    const author = await getUser()
    if(!author) return false

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
    const author = await getUser()
    if(!author) return false

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