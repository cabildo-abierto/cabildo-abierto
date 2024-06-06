'use server'

import {db} from "@/db";

export async function getContentById(contentId: string) {
    return await db.content.findUnique(
        {select: {
                id: true,
                text: true,
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
                type: true
        },
        where: {
            id: contentId,
        }
        }
    )
}

export async function getContentComments(contentId: string){
    return await db.content.findMany({
        select: {
            id: true,
            text: true,
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
        where: {parentContentId: contentId},
    })
}

export async function getPostsAndDiscussions() {
    return await db.content.findMany({
        select: {
            id: true,
            text: true,
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
            parentContentId: null
        }
    })
}