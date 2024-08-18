'use server'

import { ContentType } from "@prisma/client";

export type AuthorProps = {
    id: string,
    name: string
}

export type ContentProps = {
    id: string
    createdAt: string
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