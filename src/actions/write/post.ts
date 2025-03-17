"use server"
import {ATProtoStrongRef, FastPostReplyProps, VisualizationProps} from "../../app/lib/definitions";
import {getSessionAgent} from "../auth";
import {RichText} from "@atproto/api";
import {revalidateTag} from "next/cache";
import {db} from "../../db";
import {getDidFromUri, getRkeyFromUri, splitUri} from "../../components/utils/uri";
import {processCreateRecord, processCreateRecordFromRefAndRecord} from "../sync/process-event";
import {revalidateUri} from "../revalidate";
import {getVisualizationTitle} from "../../components/visualizations/editor/spec";
import {logTimes} from "../utils";


export async function createFastPostATProto(
    {text, reply, quote, visualization}: {
        text: string
        reply?: FastPostReplyProps
        quote?: string
        visualization?: VisualizationProps
    }
){
    const t1 = Date.now()
    const {agent} = await getSessionAgent()
    const t2 = Date.now()

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

        ref = await agent.post({
            ...record,
            "$type": "app.bsky.feed.post"
        })
    } else if(!quote){
        record = {
            "$type": "app.bsky.feed.post",
            text: rt.text,
            facets: rt.facets,
            createdAt: new Date().toISOString(),
            reply
        }

        ref = await agent.post({
            ...record,
            "$type": "app.bsky.feed.post"
        })
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

    logTimes("Posting to atproto", [t1, t2, t3])

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


export async function createFastPost(
    {text, reply, quote, visualization}: {
        text: string, reply?: FastPostReplyProps, quote?: string, visualization?: VisualizationProps
    }
): Promise<{error?: string, ref?: {uri: string, cid: string}}> {

    const {ref, record} = await createFastPostATProto({text, reply, quote, visualization})

    if (ref) {
        const updates = await processCreateRecordFromRefAndRecord(ref, record)
        await db.$transaction(updates)
        await revalidateUri(ref.uri)
    }

    if(reply){
        revalidateTag("thread:"+getDidFromUri(reply.parent.uri)+":"+getRkeyFromUri(reply.parent.uri))
        revalidateTag("thread:"+getDidFromUri(reply.root.uri)+":"+getRkeyFromUri(reply.root.uri))

        revalidateTag("topic:Inflación")
    }

    return {ref}
}