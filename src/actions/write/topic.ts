"use server"
import {getSessionAgent} from "../auth";
import {revalidateTag} from "next/cache";
import {createContent, createRecord} from "./utils";
import {getCollectionFromUri} from "../../components/utils/utils";
import {db} from "../../db";
import {logTimes} from "../utils";
import {setTopicCategories} from "../topic/utils";
import {getDidFromUri, getRkeyFromUri, splitUri} from "../../components/utils/uri";
import {processCreateRecord, processCreateRecordFromRefAndRecord} from "../sync/process-event";

export async function createTopic(id: string){
    return await createTopicVersion({id, claimsAuthorship: true})
}


type CreateTopicVersionRecord = {
    id: string
    title?: string
    message?: string
    synonyms?: string
    categories?: string
    $type: string
    text: {ref: {
        $link: string
    }}
    createdAt: string
}


export async function createTopicVersionDB({
    ref,
    record
}: {
    ref: {uri: string, cid: string}
    record: CreateTopicVersionRecord
}){

    return {}
}


export async function createTopicVersionATProto({
                                                    id, text, format="markdown", title, claimsAuthorship, message, categories, synonyms}: {
    id: string,
    text?: FormData,
    format?: string,
    title?: string
    claimsAuthorship: boolean
    message?: string
    categories?: string[]
    synonyms?: string[]
}){

    const {agent, did} = await getSessionAgent()
    if(!did) return {error: "Iniciá sesión para crear un tema."}

    let blob = null
    if(text){
        const data = Object.fromEntries(text);
        let f = data.data as File
        const headers: Record<string, string> = {
            "Content-Length": f.size.toString()
        }
        const res = await agent.uploadBlob(f, {headers})
        blob = res.data.blob
    }

    const record = {
        "$type": "ar.com.cabildoabierto.topic",
        text: blob ? {
            ref: blob.ref,
            mimeType: blob.mimeType,
            size: blob.size,
            $type: "blob"
        } : null,
        title,
        format,
        message,
        categories: categories ? JSON.stringify(categories) : undefined,
        synonyms: synonyms ? JSON.stringify(synonyms) : undefined,
        id,
        createdAt: new Date().toISOString()
    }

    try {
        const {data} = await agent.com.atproto.repo.createRecord({
            repo: did,
            collection: 'ar.com.cabildoabierto.topic',
            record: record,
        })
        return {ref: {uri: data.uri, cid: data.cid}, record}
    } catch (e) {
        console.error("error", e)
        return {error: "Ocurrió un error al publicar en ATProto."}
    }

    return {}
}


export async function createTopicVersion({
                                             id, text, format="markdown", title, claimsAuthorship, message, categories, synonyms}: {
    id: string,
    text?: FormData,
    format?: string,
    title?: string
    claimsAuthorship: boolean
    message?: string
    categories?: string[]
    synonyms?: string[]
}): Promise<{error?: string}>{
    const t1 = Date.now()
    const {ref, record} = await createTopicVersionATProto({
        id, text, format, title, claimsAuthorship, message, categories, synonyms
    })
    const t2 = Date.now()
    if(ref){
        const updates = await processCreateRecordFromRefAndRecord(ref, record)
        await db.$transaction(updates)
        revalidateTag("topic:"+record.id)
    }
    const t3 = Date.now()
    logTimes("create topic version " + id, [t1, t2, t3])
    return {}
}


export async function updateCategoriesInTopic({topicId, categories}: {topicId: string, categories: string[]}) {
    const res = await createTopicVersion({
        id: topicId,
        categories,
        claimsAuthorship: false,
    })
    revalidateTag("categories")
    revalidateTag("topics")
    return res
}


export async function updateSynonymsInTopic({topicId, synonyms}: {topicId: string, synonyms: string[]}) {

    return await createTopicVersion({
        id: topicId,
        synonyms,
        claimsAuthorship: false,
    })
}