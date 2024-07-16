'use server'

import {db} from "@/db";
import {getUserId, getUserIdByUsername} from "@/actions/get-user";
import parse from 'html-react-parser'
import { getLikeState } from "./likes";

export type ContentProps = {
    id: string;
    createdAt: Date
    author: {
        id: string
        name: string
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

export async function getDrafts() {
    const userId = await getUserId()

    const drafts: [] = await db.content.findMany({
        select: {
            id: true,
            text: true,
            createdAt: true,
            author: {
                select: {
                    name: true,
                    id: true
                },
            },
            type: true
        },
        where: {
            AND: [{isDraft: true}, {authorId: userId}]
        },
        orderBy: {
            createdAt: 'asc'
        }
    })

    return drafts
}


export async function getPostsFollowing() {
    const userId = await getUserId()

    const followedUsers = await db.user.findUnique({
        where: {
            id: userId,
        },
    }).following();

    const followedUsernames = followedUsers.map(user => user.id);

    let contents: ContentProps[] = await db.content.findMany({
        select: {
            id: true,
            text: true,
            createdAt: true,
            author: {
                select: {
                    name: true,
                    id: true
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
            AND: [
                {
                    type: {in: ["FastPost", "Post", "Comment"]}
                },
                {
                    authorId: {in: followedUsernames}
                }
            ]
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return contents
}