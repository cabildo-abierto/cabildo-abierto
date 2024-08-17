'use server'

import {db} from "@/db";
import { UserProps } from "./get-user";
import { cache } from "./cache";
import { ContentType } from "@prisma/client";

export type AuthorProps = {
    id: string,
    name: string
}

export type ContentProps = {
    id: string
    createdAt: Date
    text: string
    author: AuthorProps
    _count: {
        likedBy: number
        dislikedBy: number
    }
    type: ContentType
    isDraft: boolean | null
    childrenComments: {id: string}[]
    parentContentId: string | null
    title: string | null
    categories: string | null
};


export const getContentById = cache(async (contentId: string) => {
    let content: ContentProps | null = await db.content.findUnique(
        {select: {
            id: true,
            text: true,
            createdAt: true,
            author: true,
            childrenComments: true,
            _count: {
                select: {
                    likedBy: true,
                    dislikedBy: true,
                },
            },
            type: true,
            isDraft: true,
            parentContentId: true,
            title: true,
            categories: true
        },
            where: {
                id: contentId,
            }
        }
    )
    return content
}, ["content"], {tags: ["content"]})


export const getPosts = async () => {
    let contents = await db.content.findMany({
        select: {
            id: true,
            text: true,
            createdAt: true,
            author: true,
            childrenComments: true,
            _count: {
                select: {
                    likedBy: true,
                    dislikedBy: true,
                },
            },
            type: true,
            isDraft: true,
            parentContentId: true,
            title: true,
            categories: true
        },
        where: {
            AND: [
                {type: {
                    in: ["FastPost", "Post", "Comment", "EntityContent"]
                }},
                {visible: true}
            ]
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
    return contents
}