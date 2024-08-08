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
    childrenComments: {id: string}[]
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
                isDraft: true
        },
            where: {
                id: contentId,
            }
        }
    )
    return content
}, ["content"],
{tags: ["content"]})


export async function getChildrenAndData(contents: any){
    const contentsWithChildren = await Promise.all(contents.map(async (content: any) => {
        return await getContentById(content.id)
    }))

    return contentsWithChildren
}


export const getPosts = cache(async () => {
    console.log("getting posts")
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
            isDraft: true
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