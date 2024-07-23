'use server'

import {db} from "@/db";
import {getUserId} from "@/actions/get-user";

export type ContentProps = {
    id: string;
    createdAt: Date
    author: {
        id: string
        name: string
    } | null;
    text: string;
    _count: {
        childrenComments: number
        likedBy: number
        dislikedBy: number
    }
    type: string
    textWithLinks?: ContentWithLinks | null
    likeState?: string
};

export async function getDrafts() {
    const userId = await getUserId()

    const drafts: [] = await db.content.findMany({
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