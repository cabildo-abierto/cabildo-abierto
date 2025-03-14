"use server"
import {getSessionAgent} from "../auth";


export async function createDataset(title: string, columns: string[], description: string, formData: FormData, format: string): Promise<{error?: string}>{
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

        const record = {
            title: title,
            createdAt: curDate,
            columns: columns.map((c) => ({name: c})),
            description,
            "$type": "ar.com.cabildoabierto.dataset"
        }

        let datasetLink = null
        try {
            const {data} = await agent.com.atproto.repo.createRecord({
                repo: did,
                collection: "ar.com.cabildoabierto.dataset",
                record
            })
            datasetLink = {uri: data.uri, cid: data.cid}
        } catch (e) {
            console.error(e)
            return {error: "No se pudo publicar el dataset."}
        }

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

        try {
            await agent.com.atproto.repo.createRecord({
                repo: did,
                collection: "ar.com.cabildoabierto.dataBlock",
                record: blockRecord
            })
        } catch (e) {
            console.error(e)
        }
    } else {
        return {error: "No se pudo publicar el dataset."}
    }
    return {}
}