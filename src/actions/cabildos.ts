"use server"

import {getSessionAgent} from "./auth";
import {db} from "../db";
import {recordQuery} from "./utils";
import {CabildoProps} from "../app/lib/definitions";
import {getUser} from "./users";


export async function createCabildo(name: string){
    const {agent, did} = await getSessionAgent()

    if(!did){
        return {error: "Iniciá sesión para crear un cabildo."}
    }

    try {
        await agent.com.atproto.repo.createRecord({
            repo: did,
            collection: "ar.com.cabildoabierto.cabildo",
            record: {
                name: name,
                createdAt: new Date().toISOString()
            }
        })
    } catch {
        return {error: "Error al crear el cabildo."}
    }
    return {}
}


export async function getCabildos(){
    const cabildos: CabildoProps[] = await db.record.findMany({
        select: {
            ...recordQuery,
            cabildo: {
                select: {
                    name: true,
                    members: {
                        select: {
                            did: true
                        }
                    }
                }
            }
        },
        where: {
            collection: "ar.com.cabildoabierto.cabildo"
        }
    })
    return cabildos
}


export async function joinCabildo(uri: string){
    // TO DO: Should be done through ATProto
    const user = await getUser()
    try {
        await db.cabildo.update({
            data: {
                members: {
                    connect: {
                        did: user.user.did
                    }
                }
            },
            where: {
                uri: uri
            }
        })
        return {}
    } catch {
        return {error: "Error al unirse al cabildo."}
    }
}