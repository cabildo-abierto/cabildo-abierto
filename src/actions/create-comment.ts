'use server'

import {db} from "@/db";
import {getUser} from "@/actions/get-user";

export async function createComment({comment, discussionId}) {
    const author = await getUser()

    await db.comment.create({
        data: {
            content: comment,
            authorId: author.id,
            discussionId
        },
    })
}