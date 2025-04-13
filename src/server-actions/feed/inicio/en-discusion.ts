"use server"
import {ATProtoStrongRef, FeedContentProps} from "@/lib/definitions";
import {getSessionAgent} from "@/server-actions/auth";
import {rootCreationDateSortKey} from "@/server-actions/feed/utils";
import {db} from "@/db";
import {processCreateRecord} from "@/server-actions/sync/process-event";
import {getCollectionFromUri, getRkeyFromUri} from "@/utils/uri";
import {deleteRecords, revalidateTags} from "@/server-actions/admin";
import {getFeed} from "@/server-actions/feed/feed";
import {FeedSkeleton} from "@/server-actions/feed/profile/main";



export async function getEnDiscusionSkeleton(): Promise<FeedSkeleton> {
    let result = await db.enDiscusion.findMany({
        select: {

            enDiscu: {
                select: {
                    uri: true
                }
            }
        },
        where: {
            collection: {
                in: ["app.bsky.feed.post", "ar.com.cabildoabierto.article"]
            }
        }
    })

    return result.filter(x => x.enDiscusionFor && x.enDiscusionFor.uri)
}


export async function getEnDiscusion(): Promise<{feed?: FeedContentProps[], error?: string}> {
    return getFeed({
        getSkeleton: getEnDiscusionSkeleton,
        sortKey: rootCreationDateSortKey // TO DO: Popularidad
    })
}



export async function addToEnDiscusion(ref: ATProtoStrongRef){
    const {agent, did} = await getSessionAgent()

    const record = {
        "$type": "ar.com.cabildoabierto.enDiscusion",
        createdAt: new Date().toISOString(),
        subject: ref
    }

    const {data} = await agent.com.atproto.repo.createRecord({
        repo: agent.did,
        collection: record.$type,
        record
    })

    let {updates, tags} = await processCreateRecord({
        did,
        uri: data.uri,
        cid: data.cid,
        rkey: getRkeyFromUri(data.uri),
        collection: getCollectionFromUri(data.uri),
        record
    })

    await db.$transaction(updates)
    await revalidateTags(Array.from(tags))
    return {uri: ref.uri}
}


export async function removeFromEnDiscusion(labelUri: string){
    await deleteRecords({uris: [labelUri], atproto: true})
    return {}
}