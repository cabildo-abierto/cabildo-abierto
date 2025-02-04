'use server'
import { db } from "../db";
import { getSessionAgent } from "./auth";
import {Agent} from "@atproto/api";
import {getUserById} from "./users";
import {revalidateTag} from "next/cache";
import {getCollectionFromUri, getRkeyFromUri} from "../components/utils";


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


export async function deleteRecords({uris, author, atproto}: {uris?: string[], author?: string, atproto: boolean}){
    const {agent, did} = await getSessionAgent()

    if(atproto){
        for(let i = 0; i < uris.length; i++){
            await agent.com.atproto.repo.deleteRecord({
                repo: did,
                rkey: getRkeyFromUri(uris[i]),
                collection: getCollectionFromUri(uris[i])
            })
        }
    }

    if(!uris){
        uris = (await db.record.findMany({
            select: {
                uri: true
            },
            where: {
                OR: [
                    {
                        author: {
                            did: author
                        }
                    },
                    {
                        author: {
                            handle: author
                        }
                    }
                ]
            }
        })).map((r) => (r.uri))
    }

    const d1 = db.follow.deleteMany({
        where: {
            uri: {
                in: uris
            }
        }
    })
    const d2 = db.post.deleteMany({
        where: {
            uri: {
                in: uris
            }
        }
    })
    const d3 = db.article.deleteMany({
        where: {
            uri: {
                in: uris
            }
        }
    })
    const d4 = db.content.deleteMany({
        where: {
            uri: {
                in: uris
            }
        }
    })
    const d5 = db.reaction.deleteMany({
        where: {
            uri: {
                in: uris
            }
        }
    })
    const d6 = db.topicVersion.deleteMany({
        where: {
            uri: {
                in: uris
            }
        }
    })
    const d7 = db.visualization.deleteMany({
        where: {
            uri: {
                in: uris
            }
        }
    })
    const d8 = db.dataBlock.deleteMany({
        where: {
            uri: {
                in: uris
            }
        }
    })
    const d9 = db.dataset.deleteMany({
        where: {
            uri: {
                in: uris
            }
        }
    })
    const d10 = db.record.deleteMany({
        where: {
            uri: {
                in: uris
            }
        }
    })
    await db.$transaction([d1, d2, d3, d5, d6, d7, d8, d9, d4, d10])
}


export async function deleteAllRecords(){
    const records = await db.record.findMany({
        select: {
            cid: true
        }
    })
    await deleteRecords({uris: records.map(({cid}) => (cid)), atproto: false})
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