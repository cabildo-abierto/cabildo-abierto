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
    revalidateTag("user")
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
    revalidateTag("user")
    revalidateTag("users")
    return updatedUser;
}