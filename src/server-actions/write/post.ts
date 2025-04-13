"use server"
import {ATProtoStrongRef, FastPostReplyProps, VisualizationProps} from "@/lib/definitions";
import {getSessionAgent} from "../auth";
import {RichText} from "@atproto/api";
import {revalidateTag} from "next/cache";
import {db} from "@/db";
import {getDidFromUri, getRkeyFromUri} from "@/utils/uri";
import {processCreateRecordFromRefAndRecord} from "../sync/process-event";
import {getVisualizationTitle} from "@/components/visualizations/editor/get-spec";
import {logTimes} from "../utils";
import {revalidateTags} from "../admin";
import {addToEnDiscusion} from "@/server-actions/feed/inicio/en-discusion";


export async function createFastPostATProto({
    text,
    reply,
    quote,
    visualization,
    images
}: {
    text: string
    reply?: FastPostReplyProps
    quote?: string
    visualization?: VisualizationProps
    images?: { src?: string, formData?: FormData }[]
}){
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
    } else if(quote){
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
    } else if (images){
        const imagesEmbed = []
        for(let i = 0; i < images.length; i++) {
            let f: File | Uint8Array
            let size: number
            if(images[i].formData){
                const data = Object.fromEntries(images[i].formData)
                f = data.image as File
                size = f.size
            } else {
                const response = await fetch(images[i].src)
                const arrayBuffer = await response.arrayBuffer();
                f = new Uint8Array(arrayBuffer);
                size = f.length
            }

            const headers: Record<string, string> = {
                "Content-Length": size.toString()
            }

            try {
                const res = await agent.uploadBlob(f, {headers})
                const blob = res.data.blob
                imagesEmbed.push({
                    alt: "",
                    image: blob
                })
            } catch {
                console.error("Error uploading image")
                return {error: "Ocurrió un error al publicar la imagen."}
            }
        }

        record = {
            "$type": "app.bsky.feed.post",
            text: rt.text,
            facets: rt.facets,
            createdAt: new Date().toISOString(),
            reply,
            embed: {
                "$type": "app.bsky.embed.images",
                "images": imagesEmbed
            }
        }

        ref = await agent.post({
            ...record,
            "$type": "app.bsky.feed.post"
        })
    } else {
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


export async function createFastPost({
    text,
    reply,
    quote,
    visualization,
    images,
    enDiscusion
}: {
    text: string
    reply?: FastPostReplyProps
    quote?: [number, number]
    visualization?: VisualizationProps
    images?: { src?: string, formData?: FormData }[]
    enDiscusion: boolean
}): Promise<{error?: string, ref?: {uri: string, cid: string}}> {
    console.log("reply", reply)

    const {ref, record} = await createFastPostATProto({
        text, reply, quote: JSON.stringify(quote), visualization, images
    })

    if (ref) {
        const {updates, tags} = await processCreateRecordFromRefAndRecord(ref, record)

        const p: Promise<any>[] = [db.$transaction(updates)]
        if(enDiscusion){
            p.push(addToEnDiscusion(ref))
        }

        await Promise.all(p)
        await revalidateTags(Array.from(tags))
    }

    if(reply){
        revalidateTag("thread:"+getDidFromUri(reply.parent.uri)+":"+getRkeyFromUri(reply.parent.uri))
        revalidateTag("thread:"+getDidFromUri(reply.root.uri)+":"+getRkeyFromUri(reply.root.uri))

        revalidateTag("topic:Inflación")
    }

    return {ref}
}