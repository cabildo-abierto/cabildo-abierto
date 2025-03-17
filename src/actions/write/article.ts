"use server"
import {getSessionAgent} from "../auth";
import {processCreateRecord} from "../sync/process-event";
import {splitUri} from "../../components/utils/uri";
import {revalidateUri} from "../revalidate";


export async function createArticle(compressedText: string, userId: string, title: string){

    const {agent, did} = await getSessionAgent()
    if(!agent) return {error: "Iniciá sesión para publicar un artículo."}

    const record = {
        "$type": "ar.com.cabildoabierto.article",
        text: compressedText,
        format: "lexical-compressed",
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
        await processCreateRecord({
            uri,
            cid,
            ...splitUri(uri),
            record
        })
        await revalidateUri(uri)
    } catch (err){
        console.error("Error", err)
        return {error: "Ocurrió un error al publicar el artículo."}
    }

    return {}
}