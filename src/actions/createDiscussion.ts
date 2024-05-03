'use server'

import {db} from "@/db";

export async function createDiscussion({title, email}) {
    console.log("A request for adding a discussion")

    const author = await db.user.findUnique({ where: { email: email} })

    await db.discussion.create({
        data: {
            title,
            published: true,
            authorId: author.id,
        },
    })
}