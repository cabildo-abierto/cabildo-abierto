'use server'
import { db } from "../db";
import { getSessionAgent } from "./auth";
import {getCollectionFromUri, getRkeyFromUri} from "../components/utils/utils";
import {revalidateTags} from "./admin";



export async function deleteRecords({uris, author, atproto}: {uris?: string[], author?: string, atproto: boolean}){
    const {agent, did} = await getSessionAgent()
    if(!agent) return

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

    await db.$transaction([
        db.follow.deleteMany({
            where: {
                uri: {
                    in: uris
                }
            }
        }),
        db.post.deleteMany({
            where: {
                uri: {
                    in: uris
                }
            }
        }),
        db.article.deleteMany({
            where: {
                uri: {
                    in: uris
                }
            }
        }),
        db.like.deleteMany({
            where: {
                uri: {
                    in: uris
                }
            }
        }),
        db.repost.deleteMany({
            where: {
                uri: {
                    in: uris
                }
            }
        }),
        db.topicVersion.deleteMany({
            where: {
                uri: {
                    in: uris
                }
            }
        }),
        db.visualization.deleteMany({
            where: {
                uri: {
                    in: uris
                }
            }
        }),
        db.dataBlock.deleteMany({
            where: {
                uri: {
                    in: uris
                }
            }
        }),
        db.dataset.deleteMany({
            where: {
                uri: {
                    in: uris
                }
            }
        }),
        db.content.deleteMany({
            where: {
                uri: {
                    in: uris
                }
            }
        }),
        db.record.deleteMany({
            where: {
                uri: {
                    in: uris
                }
            }
        })
    ])

    const tags = new Set<string>()
    for(let i = 0; i < uris.length; i++){
        const c = getCollectionFromUri(uris[i])
        if(c == "ar.com.cabildoabierto.topic"){
        }
        if(c == "app.bsky.feed.post" || c == "ar.com.cabildoabierto.quotePost"){

        }
        if(c == "app.bsky.feed.post"){
        }
        if(c == "ar.com.cabildoabierto.article"){
        }
        if(c == "ar.com.cabildoabierto.visualization"){
            tags.add("visualizations")
        }
        if(c == "ar.com.cabildoabierto.dataset"){
            tags.add("datasets")
        }
    }
    await revalidateTags(Array.from(tags))
}


export async function deleteAllRecords(){
    const records = await db.record.findMany({
        select: {
            cid: true
        }
    })
    await deleteRecords({uris: records.map(({cid}) => (cid)), atproto: false})
}