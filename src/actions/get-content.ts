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
    likedBy: any[]
    dislikedBy: any[]
    type: string
    childrenComments: any[]
};

export type ContentAndChildrenProps = {
    content: ContentProps | null, 
    children: (ContentAndChildrenProps | null)[] 
}

export async function getContentById(contentId: string, userId: string | null): Promise<ContentAndChildrenProps | null> {
    const _userId = userId ? userId : undefined
    let content: ContentProps | null = await db.content.findUnique(
        {select: {
                id: true,
                text: true,
                createdAt: true,
                author: true,
                likedBy: {
                    where: {
                        id: _userId
                    }
                },
                dislikedBy: {
                    where: {
                        id: _userId
                    }
                },
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
        return await getContentById(child.id, userId)
    }))

    return {content: content, children: childrenWithData}
}


export async function getChildrenAndData(contents: any, userId: string){
    const contentsWithChildren = await Promise.all(contents.map(async (content: any) => {
        return await getContentById(content.id, userId)
    }))

    return contentsWithChildren
}


export async function getPosts(userId: string | null = null) {
    if(!userId) userId = await getUserId()
    if(!userId) return null

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

    return await getChildrenAndData(contents, userId)
}


export async function getPostsFollowing(userId: string | null = null) {
    if(!userId) userId = await getUserId()
    if(!userId) return null
    
    const followedUsers = await db.user.findUnique({
        where: {
            id: userId,
        },
    }).following();

    if(!followedUsers) return null

    const followedUsernames = followedUsers.map(user => user.id);

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
                    authorId: {in: followedUsernames}
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

    return await getChildrenAndData(contents, userId)
}