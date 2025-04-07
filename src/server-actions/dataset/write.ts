"use server"
import {getSessionAgent} from "../auth";
import {db} from "@/db";
import {processCreateRecordFromRefAndRecord} from "../sync/process-event";
import {revalidateTags} from "../admin";
import {union} from "@/utils/arrays";


export async function createDatasetATProto(title: string, columns: string[], description: string, formData: FormData, format: string){
    const data = Object.fromEntries(formData);

    let f = data.data as File

    const {agent, did} = await getSessionAgent()

    const headers: Record<string, string> = {
        "Content-Length": f.size.toString()
    }

    const res = await agent.uploadBlob(f, {headers})
    if(res.success){
        const blob = res.data.blob
        const curDate = new Date().toISOString()

        const datasetRecord = {
            title: title,
            createdAt: curDate,
            columns: columns.map((c) => ({name: c})),
            description,
            "$type": "ar.com.cabildoabierto.dataset"
        }

        let datasetLink = null
        try {
            const {data: datasetData} = await agent.com.atproto.repo.createRecord({
                repo: did,
                collection: "ar.com.cabildoabierto.dataset",
                record: datasetRecord
            })
            datasetLink = {uri: data.uri, cid: data.cid}

            const blockRecord = {
                createdAt: curDate,
                dataset: datasetLink,
                format: format,
                data: {
                    ref: blob.ref,
                    mimeType: blob.mimeType,
                    size: blob.size,
                    $type: "blob"
                },
                "$type": "ar.com.cabildoabierto.dataBlock"
            }

            const {data: blockData} = await agent.com.atproto.repo.createRecord({
                repo: did,
                collection: "ar.com.cabildoabierto.dataBlock",
                record: blockRecord
            })
            return {
                blockRef: {cid: blockData.cid, uri: blockData.uri},
                blockRecord,
                datasetRecord,
                datasetRef: {cid: datasetData.cid, uri: datasetData.uri}
            }
        } catch (e) {
            console.error(e)
            return {error: "No se pudo publicar el dataset."}
        }
    } else {
        return {error: "No se pudo publicar el dataset."}
    }
}


export async function createDataset(title: string, columns: string[], description: string, formData: FormData, format: string): Promise<{error?: string}>{
    const {error, datasetRecord, datasetRef, blockRecord, blockRef} = await createDatasetATProto(title, columns, description, formData, format)
    if(error) return {error}


    const r1 = await processCreateRecordFromRefAndRecord(datasetRef, datasetRecord)
    const r2 = await processCreateRecordFromRefAndRecord(blockRef, blockRecord)

    const updates = [
        ...r1.updates,
        ...r2.updates
    ]

    await db.$transaction(updates)
    await revalidateTags(Array.from(union(r1.tags, r2.tags)))

    return {}
}