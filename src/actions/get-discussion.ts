'use server'

import {db} from "@/db";

export async function getDiscussionById(discussionId) {
    return await db.discussion.findUnique(
        {select: {
                id: true,
                title: true,
                author: {
                    select: { name: true },
                },
                _count: {
                    select: { comments: true },
                },
        },
        where: {id:discussionId}
        }
    )
}

export async function getDiscussionComments(discussionId){
    return await db.comment.findMany({
        where: {discussionId: discussionId},
    })
}

export async function getAllDiscussionsWithAuthors() {
    return await db.discussion.findMany({
        select: {
            id: true,
            title: true,
            author: {
                select: { name: true },
            },
            _count: {
                select: { comments: true },
            },
        }
    })
}