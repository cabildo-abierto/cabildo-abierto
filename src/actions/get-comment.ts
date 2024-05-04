'use server'

import {db} from "@/db";

// Una discusion es un comentario sin parentComment
export async function getCommentById(commentId) {
    return await db.comment.findUnique(
        {select: {
                id: true,
                content: true,
                createdAt: true,
                author: {
                    select: {
                        name: true,
                        id: true,
                        username: true
                    },
                },
                _count: {
                    select: { childrenComments: true },
                },
        },
        where: {
            id:commentId,
        }
        }
    )
}

export async function getCommentComments(commentId){
    return await db.comment.findMany({
        select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
                select: {
                    name: true,
                    id: true,
                    username: true
                },
            },
            _count: {
                select: { childrenComments: true },
            },
        },
        where: {parentCommentId: commentId},
    })
}

export async function getAllDiscussions() {
    return await db.comment.findMany({
        select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
                select: {
                    name: true,
                    id: true,
                    username: true
                },
            },
            _count: {
                select: { childrenComments: true },
            },
        },
        where: {
            parentCommentId:null
        }
    })
}