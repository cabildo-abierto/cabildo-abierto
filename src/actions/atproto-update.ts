'use server'
import { db } from "../db";
import { getSessionAgent } from "./auth";
import {Agent, AtUri} from "@atproto/api";
import {getUserById} from "./users";
import {revalidateTag} from "next/cache";


export async function updateProfile(did: string, agent: Agent){
    const {data} = await agent.getProfile({actor: did})

    const {user} = await getUserById(did)

    if(user.handle != data.handle ||
    user.avatar != data.avatar ||
    user.banner != data.banner ||
    user.displayName != data.displayName ||
    user.description != data.description){
        console.log("Profile required update.")
        console.log(user.handle == data.handle, user.handle, data.handle)
        console.log(user.avatar == data.avatar, user.avatar, data.avatar)
        console.log(user.banner == data.banner, user.banner, data.banner)
        console.log(user.displayName == data.displayName, user.displayName, data.displayName)
        console.log(user.description == data.description, user.description, data.description)
        await db.user.update({
            data: {
                handle: data.handle,
                avatar: data.avatar,
                banner: data.banner,
                displayName: data.displayName,
                description: data.description
            },
            where: {
                did: did
            }
        })
        revalidateTag("user:"+did)
    }
}


export async function deleteRecords(cids: string[]){
    const d1 = db.follow.deleteMany({
        where: {
            cid: {
                in: cids
            }
        }
    })
    const d2 = db.post.deleteMany({
        where: {
            cid: {
                in: cids
            }
        }
    })
    const d3 = db.article.deleteMany({
        where: {
            cid: {
                in: cids
            }
        }
    })
    const d4 = db.content.deleteMany({
        where: {
            cid: {
                in: cids
            }
        }
    })
    const d5 = db.reaction.deleteMany({
        where: {
            cid: {
                in: cids
            }
        }
    })
    await db.$transaction([d1, d2, d3, d4, d5])
    await db.record.deleteMany({
        where: {
            cid: {
                in: cids
            }
        }
    })
}


export async function deleteAllRecords(){
    const records = await db.record.findMany({
        select: {
            cid: true
        }
    })
    await deleteRecords(records.map(({cid}) => (cid)))
}


export async function updateEverything(replace: boolean){
    const users = await db.user.findMany({
        select: {
            did: true
        }
    })

    const {agent} = await getSessionAgent()

    for(let i = 0; i < users.length; i++){
        console.log("Updating user", users[i])
        await updateProfile(users[i].did, agent)
    }
}

export async function allRecords(){
    const {agent} = await getSessionAgent()
    /*const {data} = await agent.com.atproto.sync.getRepo({
        did: "did:plc:cpooyynmjuqtcyhujscrxme7"
    })
    console.log(data)*/
    const res = await fetch('https://blewit.us-west.host.bsky.network/xrpc/com.atproto.sync.getRepo?did='+encodeURIComponent("did:plc:cpooyynmjuqtcyhujscrxme7"), {
        method: 'GET',
        headers: {
            'Accept': 'application/json', // Adjust headers if needed
        },
        cache: 'no-store', // Ensure the data isn't cached for live updates
    });

    console.log(res)
}