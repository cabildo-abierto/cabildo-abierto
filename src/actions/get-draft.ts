'use server'

import {db} from "@/db";
import {getUserId} from "@/actions/get-user";


export async function getDrafts() {
    const userId = await getUserId()

    const drafts: any[] = await db.content.findMany({
        select: {
            id: true,
            text: true,
            createdAt: true,
            author: {
                select: {
                    name: true,
                    id: true
                },
            },
            type: true
        },
        where: {
            AND: [{isDraft: true}, {authorId: userId}]
        },
        orderBy: {
            createdAt: 'asc'
        }
    })

    return drafts
}