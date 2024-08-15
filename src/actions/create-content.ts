'use server'

import {db} from "@/db";
import { ContentType } from "@prisma/client";
import { getUserId } from "./get-user";
import { revalidateTag } from "next/cache";
import { RangeSelection } from "lexical";
import { getContentById } from "./get-content";


export async function createComment(text: string, parentContentId: string, userId: string | null = null) {
    if(!userId){
        userId = await getUserId()
    }

    console.log("creating comment in db")
    const comment = await db.content.create({
        data: {
            text: text,
            authorId: userId,
            parentContentId: parentContentId,
            type: "Comment"
        },
    })
    revalidateTag("contents")
    revalidateTag("content")
    return await getContentById(comment.id)
}



export async function createPost(text: string, postType: ContentType, isDraft: boolean, userId: string | null = null, title?: string) {
    if(!userId){
        userId = await getUserId()
    }
    console.log("author", userId)

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
    revalidateTag("content")
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
    revalidateTag("content")
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
    revalidateTag("content")
    return true
}