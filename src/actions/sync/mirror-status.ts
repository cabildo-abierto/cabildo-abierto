"use server"


import {revalidateTag, unstable_cache} from "next/cache";
import {db} from "../../db";
import {revalidateEverythingTime} from "../utils";
import {$Enums} from ".prisma/client";
import MirrorStatus = $Enums.MirrorStatus;

export async function getUserMirrorStatus(did: string){
    return (await unstable_cache(
        async () => {
            return await db.user.findUnique({
                select: {
                    mirrorStatus: true
                },
                where: {
                    did
                }
            })
        },
        ["mirrorStatus:"+did],
        {
            tags: ["mirrorStatus:"+did, "user:"+did],
            revalidate: revalidateEverythingTime
        }
    )()).mirrorStatus
}


export async function getDirtyUsers(){
    return (await unstable_cache(
        async () => {
            console.log("getting dirty users")
            return await db.user.findMany({
                select: {
                    did: true
                },
                where: {
                    mirrorStatus: "Dirty",
                    inCA: true
                }
            })
        },
        undefined,
        {
            tags: ["dirtyUsers"],
            revalidate: revalidateEverythingTime
        }
    )()).map(({did}) => did)
}


export async function setMirrorStatus(did: string, mirrorStatus: MirrorStatus){
    await db.user.update({
        data: {
            mirrorStatus
        },
        where: {did}
    })
    revalidateTag("dirtyUsers")
    revalidateTag("mirrorStatus:"+did)
}