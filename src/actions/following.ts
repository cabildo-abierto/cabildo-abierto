'use server'

import {db} from "@/db";
import { revalidateTag } from "next/cache";


export async function follow(userToFollowId: string, userId: string) {
    const updatedUser = await db.user.update({
        where: {
            id: userId,
        },
        data: {
            following: {
                connect: {
                    id: userToFollowId,
                },
            },
        },
    });
    revalidateTag("users")
    return updatedUser;
}


export async function unfollow(userToUnfollowId: string, userId: string) {

    const updatedUser = await db.user.update({
        where: {
            id: userId,
        },
        data: {
            following: {
                disconnect: {
                    id: userToUnfollowId,
                },
            },
        },
    });
    revalidateTag("users")
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


export async function doesFollow(userId: string, userMaybeFollowed: string) {

    const user = await db.user.findUnique({
        where: {
            id: userMaybeFollowed,
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