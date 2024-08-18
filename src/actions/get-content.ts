'use server'

import {db} from "@/db";
import { cache } from "./cache";
import { getUserById } from "./get-user";


export const getContentById = cache(async (id: string) => {
    let content = await db.content.findUnique({
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
            id: id,
        }
    })
    return content
}, ["contents"], {tags: ["contents"]})


export const getFeed = cache(async () => {
    let contents = await db.content.findMany({
        select: {
            id: true,
            type: true,
            isDraft: true,
            text: true
        },
        where: {
            AND: [
                {type: {
                    in: ["FastPost", "Post"]
                }},
                {visible: true},
            ]
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
    return contents
}, ["contents"], {tags: ["contents"]})


export const getDraftsById = cache(async (id: string) => {
    const drafts = await db.content.findMany({
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
                {isDraft: true},
                {visible: true},
                {authorId: id}
            ]
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
    return drafts
}, ["contents"], {tags: ["contents"]})


export const getProfileFeed = cache(async (id: string) => {
    const feed = await db.content.findMany({
        select: {
            id: true
        },
        where: {
            AND: [
                {type: {
                    in: ["FastPost", "Post"]
                }},
                {visible: true},
                {authorId: id}
            ]
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
    return feed
}, ["users", "contents"], {tags: ["users", "contents"]})


export const getFollowingFeed = cache(async (id: string) => {
    const user = await getUserById(id)
    if(!user) return []
    const feed = await db.content.findMany({
        select: {
            id: true
        },
        where: {
            AND: [
                {type: {
                    in: ["FastPost", "Post"]
                }},
                {visible: true},
                {authorId: {
                    in: user.following.map(({id}: {id: string}) => (id))
                }}
            ]
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
    return feed
}, ["users", "contents"], {tags: ["users", "contents"]})