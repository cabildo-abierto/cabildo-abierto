'use server'

import {db} from "@/db";
import { getUserId } from "./get-user";


export async function follow(userToFollow) {
    const loggedInUserId = await getUserId()

    const updatedUser = await db.user.update({
        where: {
            id: loggedInUserId,
        },
        data: {
            following: {
                connect: {
                    id: userToFollow,
                },
            },
        },
    });
    return updatedUser;
}


export async function unfollow(userToUnfollow) {
    const loggedInUserId = await getUserId()

    const updatedUser = await db.user.update({
        where: {
            id: loggedInUserId,
        },
        data: {
            following: {
                disconnect: {
                    id: userToUnfollow,
                },
            },
        },
    });
    return updatedUser;
}


export async function followerCount(userId) {
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


export async function followingCount(userId) {
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


export async function doesFollow(userId) {
    const loggedInUserId = await getUserId()

    const user = await db.user.findUnique({
        where: {
            id: loggedInUserId,
        },
        select: {
            following: {
                where: {
                    id: userId,
                },
            },
        },
    });

    return user.following.length > 0;
}