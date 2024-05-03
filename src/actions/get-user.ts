'use server'

import {db} from "@/db";
import {verifySession} from "@/actions/auth";

export async function getUser() {
    const session = await verifySession()
    if(!session) return undefined

    const user = await db.user.findUnique(
        {where: {id:session?.userId}}
    )

    return user
}