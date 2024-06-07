'use server'

import {db} from "@/db";
import {getUserIdByUsername} from "@/actions/get-user";
import parse from 'html-react-parser'
import { getLikeState } from "./likes";

export type ContentProps = {
    id: string;
    createdAt: Date
    author: {
        id: string
        name: string
        username: string
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

export async function getContentById(contentId: string): Promise<ContentProps | null> {
    let content: ContentProps | null = await db.content.findUnique(
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
                    select: { 
                        childrenComments: true,
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
    content.textWithLinks = await getContentWithLinks(content)
    content.likeState = await getLikeState(content.id)
    return content
}

export async function replaceAsync(text: string, regexp: RegExp, 
    replacerFunction: (match: string, replace: string) => Promise<string>) {
    const replacements = await Promise.all(
        Array.from(text.matchAll(regexp), ([match, replace]) => replacerFunction(match, replace)));
    let i = 0;
    return text.replace(regexp, () => replacements[i++]);
}

export type ContentWithLinks = React.JSX.Element | string | React.JSX.Element[]

export async function getContentWithLinks(content: ContentProps): Promise<ContentWithLinks> {
    async function replaceMention(match: string, username: string): Promise<string> {
        const user = await getUserIdByUsername(username)
        if (user) {
            return `<a href="/profile/${user.id}" style="color: skyblue;">@${username}</a>`;
        } else {
            return match
        }
    }

    const withLinks = await replaceAsync(content.text, /@(\w+)/g, replaceMention);

    return parse(withLinks)
}

export async function getContentComments(contentId: string){
    let comments: ContentProps[] = await db.content.findMany({
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
                select: { 
                    childrenComments: true,
                    likedBy: true,
                    dislikedBy: true,
                },
            },
            type: true
        },
        where: {parentContentId: contentId},
    })
    comments.forEach(async function(comment){
        comment.textWithLinks = await getContentWithLinks(comment)
        comment.likeState = await getLikeState(comment.id)
    })
    return comments
}

export async function getPostsAndDiscussions() {
    let contents: ContentProps[] = await db.content.findMany({
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
                select: { 
                    childrenComments: true,
                    likedBy: true,
                    dislikedBy: true,
                },
            },
            type: true
        },
        where: {
            parentContentId: null
        }
    })
    contents.forEach(async function(content){
        content.textWithLinks = await getContentWithLinks(content)
        content.likeState = await getLikeState(content.id)
    })
    return contents
}