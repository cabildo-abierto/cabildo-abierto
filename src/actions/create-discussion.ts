'use server'

import {db} from "@/db";
import {getUserId} from "@/actions/get-user";

export async function createDiscussion(title) {
    if(title.length == 0)
        return false

    const id = await getUserId()
    console.log("Author id", id)
    await db.discussion.create({
        data: {
            title,
            authorId: id,
        },
    })
    return true
}