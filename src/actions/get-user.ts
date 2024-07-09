'use server'

import {db} from "@/db";
import {verifySession} from "@/actions/auth";
import { ContentProps, getContentWithLinks } from "./get-content";
import { getLikeState } from "./likes";


export type UserProps = {
    id: string
    name: string
};


export async function getUserId(){
    const session = await verifySession()
    if(!session) return undefined

    return session?.userId
}

export async function getUser() {
    const userId = await getUserId()
    if(!userId)
        return false
    return getUserById(userId)
}

export async function getUserById(userId: string){
    return await db.user.findUnique(
        {
            where: {id:userId}
        }
    )
}

export async function getUserActivityById(userId: string){
    let contents: ContentProps[] = await db.content.findMany(
        {
            where: {
                AND: [
                    {
                        OR: [
                        {authorId:userId},
                        {mentionedUsers:
                                {
                                    some: {
                                        id: userId
                                    }
                                }
                        }
                        ]
                    },
                    {
                        OR: [
                            {type: "FastPost"},
                            {type: "Post"}
                        ]
                    }
                ]
            },
            select: {
                text: true,
                author: true,
                createdAt: true,
                id: true,
                _count: {
                    select: { 
                        childrenComments: true,
                        likedBy: true,
                        dislikedBy: true,
                    },
                },
                type: true
            }
        }
    )
    contents.forEach(async function(content){
        content.textWithLinks = await getContentWithLinks(content)
        content.likeState = await getLikeState(content.id)
    })
    return contents
}


export async function getUsersMatching(queryText) {
    const users = await db.user.findMany({
        select: {
            id: true,
            name: true
        }
    })
    const searchString = queryText.toLowerCase();

    function userMatch(user) {
        return user.name.toLowerCase().includes(searchString) || user.id.toLowerCase().includes(searchString);
    }

    return users.filter(userMatch)
}