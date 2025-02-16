'use server'
import { db } from "../db";
import { getSessionAgent } from "./auth";
import {getCollectionFromUri, getRkeyFromUri} from "../components/utils";



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