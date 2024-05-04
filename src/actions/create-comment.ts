'use server'

import {db} from "@/db";
import {getUser} from "@/actions/get-user";

export async function createComment(content, parentCommentId) {
    const author = await getUser()
    if(!author) return false

    await db.comment.create({
        data: {
            content: content,
            authorId: author.id,
            parentCommentId: parentCommentId
        },
    })

    return true
}