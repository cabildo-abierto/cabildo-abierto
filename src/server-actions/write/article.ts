"use server"
import {getSessionAgent} from "../auth";
import {processCreateRecord} from "../sync/process-event";
import {splitUri} from "@/utils/uri";
import {revalidateTags} from "../admin";
import {db} from "@/db";


export async function createArticle(text: string, format: string, title: string){

    const {agent, did} = await getSessionAgent()
    if(!agent) return {error: "Iniciá sesión para publicar un artículo."}

    const record = {
        "$type": "ar.com.cabildoabierto.article",
        text: text,
        format: format,
        title: title,
        createdAt: new Date().toISOString()
    }

    try {
        const {data} = await agent.com.atproto.repo.createRecord({
            repo: did,
            collection: 'ar.com.cabildoabierto.article',
            record: record,
        })

        const {uri, cid} = data
        const {updates, tags} = await processCreateRecord({
            uri,
            cid,
            ...splitUri(uri),
            record
        })

        await db.$transaction(updates)
        await revalidateTags(Array.from(tags))
    } catch (err){
        console.error("Error", err)
        return {error: "Ocurrió un error al publicar el artículo."}
    }

    return {}
}