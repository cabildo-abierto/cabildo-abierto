'use server'

import {db} from "@/db";
import { ContentType } from "@prisma/client";
import { getUserId } from "./get-user";
import { revalidateTag } from "next/cache";


export async function createComment(text: string, parentContentId: string, userId?: string) {
    if(!userId){
        userId = await getUserId()
    }
    if(!userId) return null

    const comment = await db.content.create({
        data: {
            text: text,
            authorId: userId,
            parentContentId: parentContentId,
            type: "Comment"
        },
    })
    revalidateTag("contents")
    revalidateTag("users")
    return comment
}


export async function createPost(text: string, postType: ContentType, isDraft: boolean, userId?: string, title?: string) {
    if(!userId){
        userId = await getUserId()
    }
    if(!userId) return null

    const result = await db.content.create({
        data: {
            text: text,
            authorId: userId,
            type: postType,
            isDraft: isDraft,
            title: title
        },
    })

    revalidateTag("contents")
    revalidateTag("users")
    return result
}


export async function updateContent(text: string, contentId: string, title?: string) {

    await db.content.update({
        where: {
            id: contentId
        },
        data: {
            text: text,
            title: title
        }
    })

    revalidateTag("contents")
    revalidateTag("users")
    return true
}


export async function publishDraft(text: string, contentId: string, title?: string) {

    await db.content.update({
        where: {
            id: contentId
        },
        data: {
            text: text,
            isDraft: false,
            createdAt: new Date(),
            title: title
        }
    })
    revalidateTag("contents")
    revalidateTag("users")
    return true
}