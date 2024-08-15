'use server'

import {db} from "@/db";
import { UserProps } from "./get-user";
import { cache } from "./cache";

export type AuthorProps = {
    id: string,
    name: string
}

export type ContentProps = {
    id: string
    createdAt: Date
    text: string
    author: AuthorProps | null
    _count: {
        likedBy: number
        dislikedBy: number
    }
    type: string
    isDraft: boolean | null
    childrenComments: {id: string}[],
    parentContentId: string | null,
    title?: string
};

export type ContentAndChildrenProps = {
    content: ContentProps | null, 
    children: (ContentProps | null)[] 
}

export const getContentById = cache(async (contentId: string) => {
    let content = await db.content.findUnique(
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
            title: true
        },
            where: {
                id: contentId,
            }
        }
    )
    return content
}, ["content"], {tags: ["content"]})


export const getPosts = cache(async () => {
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
            title: true
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
},
    ["contents"],
    {
        tags: ["contents"]
    }
)