'use server'

import {db} from "@/db";
import { getUserId, UserProps } from "./get-user";

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
    childrenComments: any[]
};

export type ContentAndChildrenProps = {
    content: ContentProps | null, 
    children: (ContentAndChildrenProps | null)[] 
}

export async function getContentById(contentId: string): Promise<ContentAndChildrenProps | null> {
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
                type: true
        },
            where: {
                id: contentId,
            }
        }
    )
    if(!content) return null
    if(!content.childrenComments) return null
    const childrenWithData = await Promise.all(content.childrenComments.map(async (child) => {
        return await getContentById(child.id)
    }))

    return {content: content, children: childrenWithData}
}


export async function getChildrenAndData(contents: any){
    const contentsWithChildren = await Promise.all(contents.map(async (content: any) => {
        return await getContentById(content.id)
    }))

    return contentsWithChildren
}


export async function getPosts() {
    let contents = await db.content.findMany({
        select: {
            id: true
        },
        where: {
            AND: [
                {type: {
                    in: ["FastPost", "Post"]
                }},
                {visible: true}
            ]
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return await getChildrenAndData(contents)
}


export async function getPostsFollowing(user: UserProps) {

    const following = user.following.map(user => user.id);

    let contents: {id: string}[] = await db.content.findMany({
        select: {
            id: true,
        },
        where: {
            AND: [
                {
                    type: {in: ["FastPost", "Post"]}
                },
                {
                    authorId: {in: following}
                },
                {
                    visible: true
                }
            ]
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return await getChildrenAndData(contents)
}