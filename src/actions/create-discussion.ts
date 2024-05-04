'use server'

import {db} from "@/db";

export async function createDiscussion({title, email}) {
    if(title.length == 0)
        return false

    const author = await db.user.findUnique({ where: { email: email} })

    await db.discussion.create({
        data: {
            title,
            authorId: author.id,
        },
    })
    return true
}