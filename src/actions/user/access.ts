"use server"


import {db} from "../../db";
import {revalidateTag} from "next/cache";
import {getSessionAgent, getSessionDid} from "../auth";

export async function grantAccess(handle: string): Promise<{error?: string}>{
    const {agent} = await getSessionAgent()
    const {data} = await agent.resolveHandle({handle})

    try {
        await db.user.update({
            data: {
                hasAccess: true
            },
            where: {
                did: data.did
            }
        })
        revalidateTag("user:"+data.did)
        return {}
    } catch (error) {
        console.error("Grant access error:", error)
        return {error: "No se encontró el usuario."}
    }
}


export async function createCodes(amount: number){
    await db.inviteCode.createMany({
        data: new Array(amount).fill({})
    })
}


export async function getAvailableInviteCodes() {
    return (await db.inviteCode.findMany({
        select: {
            code: true
        },
        where: {
            usedByDid: null
        }
    })).map(({code}) => code)
}


export async function assignInviteCode(inviteCode: string) {
    const did = await getSessionDid()

    const code = await db.inviteCode.findUnique({
        where: {
            code: inviteCode
        }
    })

    if(code.usedByDid == did){
        return {}
    }

    if(code.usedByDid != null){
        return {error: "El código ya fue usado."}
    }

    console.log("assigning invite code", inviteCode, "to did", did)

    const updates = [
        db.inviteCode.update({
            data: {
                usedAt: new Date(),
                usedByDid: did
            },
            where: {
                code: inviteCode
            }
        }),
        db.user.update({
            data: {
                hasAccess: true,
                inCA: true
            },
            where: {
                did
            }
        })
    ]

    await db.$transaction(updates)

    revalidateTag("user:"+did)

    return {}
}