"use server"
import {ATProtoStrongRef, FastPostReplyProps, VisualizationProps} from "../../app/lib/definitions";
import {getSessionAgent} from "../auth";
import {RichText} from "@atproto/api";
import {getCollectionFromUri, getDidFromUri, getRkeyFromUri, getVisualizationTitle} from "../../components/utils";
import {revalidateTag} from "next/cache";
import {createContent, createRecord, newDirtyRecord, SyncRecordProps} from "./utils";
import {db} from "../../db";


export async function createFastPostATProto(
    {text, reply, quote, visualization}: {
        text: string
        reply?: FastPostReplyProps
        quote?: string
        visualization?: VisualizationProps
    }
){
    //const t1 = Date.now()
    const {agent} = await getSessionAgent()
    //const t2 = Date.now()
    //console.log("get session agent time", t2-t1)

    const rt = new RichText({
        text: text
    })
    await rt.detectFacets(agent)

    let ref: {uri: string, cid: string}
    let record: CreateFastPostRecord
    if(visualization){
        record = {
            "$type": "app.bsky.feed.post",
            text: rt.text,
            facets: rt.facets,
            createdAt: new Date().toISOString(),
            reply,
            embed: {
                $type: "app.bsky.embed.external",
                external: {
                    uri: "https://www.cabildoabierto.com.ar/c/"+visualization.author.did+"/visualization/"+visualization.rkey,
                    title: getVisualizationTitle(visualization),
                    description: "Mirá la visualización interactiva en Cabildo Abierto."
                }
            }
        }

        ref = await agent.post(record)
    } else if(!quote){
        record = {
            "$type": "app.bsky.feed.post",
            text: rt.text,
            facets: rt.facets,
            createdAt: new Date().toISOString(),
            reply
        }

        ref = await agent.post(record)
    } else {
        record = {
            "$type": "ar.com.cabildoabierto.quotePost",
            text: rt.text,
            facets: rt.facets,
            createdAt: new Date().toISOString(),
            reply,
            quote
        }

        const {data} = await agent.com.atproto.repo.createRecord({
            repo: agent.did,
            collection: record.$type,
            record
        })
        ref = data
    }
    const t3 = Date.now()

    //console.log("Posting to atproto", t3-t2)

    return {ref, record}
}


export type CreateFastPostRecord = {
    $type: string
    text: string
    facets?: any
    embed?: any
    createdAt: string
    reply?: {
        parent: ATProtoStrongRef
        root: ATProtoStrongRef
    }
    quote?: string
}


export async function createFastPostDB(
    {ref, record}: {ref: {uri: string, cid: string}, record: CreateFastPostRecord}
) {

    let updates: any[] = []

    const baseRecord = {
        did: getDidFromUri(ref.uri),
        uri: ref.uri,
        cid: ref.cid,
        rkey: getRkeyFromUri(ref.uri),
        createdAt: new Date(),
        collection: getCollectionFromUri(ref.uri),
        record
    }

    updates = [...updates, ...createRecord(baseRecord)]

    if(record.reply){
        updates = [...updates, ...newDirtyRecord(record.reply.parent)]
        if(record.reply.root){
            updates = [...updates, ...newDirtyRecord(record.reply.root)]
        }
    }

    updates = [...updates, ...createContent(baseRecord)]

    const post = {
        facets: record.facets ? JSON.stringify(record.facets) : null,
        embed: record.embed ? JSON.stringify(record.embed) : null,
        uri: ref.uri,
        replyToId: record.reply ? record.reply.parent.uri as string : null,
        rootId: record.reply && record.reply.root ? record.reply.root.uri : null,
        quote: record.quote ? record.quote : null,
    }

    updates.push(db.post.upsert({
        create: post,
        update: post,
        where: {
            uri: ref.uri
        }
    }))

    await db.$transaction(updates)
}


export async function createFastPost(
    {text, reply, quote, visualization}: {
        text: string, reply?: FastPostReplyProps, quote?: string, visualization?: VisualizationProps
    }
): Promise<{error?: string, ref?: {uri: string, cid: string}}> {

    const t1 = Date.now()
    const {ref, record} = await createFastPostATProto({text, reply, quote, visualization})
    const t2 = Date.now()

    if (ref) {
        await createFastPostDB({ref, record})
    }
    const t3 = Date.now()

    //console.log("create post at time", t2-t1)
    //console.log("create post db time", t3-t2)
    //console.log("create post time", t3-t1)

    if(reply){
        revalidateTag("thread:"+getDidFromUri(reply.parent.uri)+":"+getRkeyFromUri(reply.parent.uri))
        revalidateTag("thread:"+getDidFromUri(reply.root.uri)+":"+getRkeyFromUri(reply.root.uri))

        revalidateTag("topic:Inflación")
    }

    return {ref}
}