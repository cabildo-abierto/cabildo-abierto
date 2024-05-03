'use server'

import {db} from "@/db";

export async function createComment({comment, email, discussionId}) {
    const author = await db.user.findUnique({ where: { email: email} })

    await db.discussion.create({
        data: {
            comment,
            authorId: author.id,
            discussionId
        },
    })
}