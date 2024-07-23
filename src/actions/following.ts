'use server'

import {db} from "@/db";
import { getUserId } from "./get-user";


export async function follow(userToFollowId: string) {
    const loggedInUserId = await getUserId()
    if(!loggedInUserId) return null

    const updatedUser = await db.user.update({
        where: {
            id: loggedInUserId as string,
        },
        data: {
            following: {
                connect: {
                    id: userToFollowId,
                },
            },
        },
    });
    return updatedUser;
}


export async function unfollow(userToUnfollowId: string) {
    const loggedInUserId = await getUserId()
    if(!loggedInUserId) return null

    const updatedUser = await db.user.update({
        where: {
            id: loggedInUserId as string,
        },
        data: {
            following: {
                disconnect: {
                    id: userToUnfollowId,
                },
            },
        },
    });
    return updatedUser;
}


export async function followerCount(userId: string) {
    const user = await db.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            followedBy: true
        },
    });
    
    return user?.followedBy.length;
}


export async function followingCount(userId: string) {
    const user = await db.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            following: true
        },
    });
    
    return user?.following.length;
}


export async function doesFollow(userId: string) {
    const loggedInUserId = await getUserId()
    if(!loggedInUserId) return false

    const user = await db.user.findUnique({
        where: {
            id: loggedInUserId as string,
        },
        select: {
            following: {
                where: {
                    id: userId,
                },
            },
        },
    });

    if(!user) return false
    return user.following.length > 0;
}