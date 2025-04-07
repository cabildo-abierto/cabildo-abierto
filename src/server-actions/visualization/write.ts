"use server"
import {VisualizationSpec} from "vega-embed";
import {getSessionAgent} from "../auth";
import {BlobRef} from "@atproto/lexicon";
import {db} from "@/db";
import {ATProtoStrongRef} from "@/lib/definitions";
import {VisualizationSpecWithMetadata} from "@/components/visualizations/editor/get-spec";
import {processCreateRecordFromRefAndRecord} from "../sync/process-event";
import {revalidateTags} from "../admin";


export async function createVisualizationATProto(spec: VisualizationSpec, preview: FormData): Promise<{error?: string, ref?: ATProtoStrongRef, record?: any}> {
    const {agent, did} = await getSessionAgent()

    try {

        const data = Object.fromEntries(preview);
        const f = data.data as File

        const headers: Record<string, string> = {
            "Content-Length": f.size.toString()
        }

        let blob: BlobRef
        try {
            const res = await agent.uploadBlob(f, {headers})
            blob = res.data.blob
        } catch {
            console.error("Error uploading preview")
            return {error: "Ocurrió un error al guardar la visualización."}
        }

        const record = {
            spec: JSON.stringify(spec),
            createdAt: new Date().toISOString(),
            preview: {
                ref: blob.ref,
                mimeType: blob.mimeType,
                size: blob.size,
                $type: "blob"
            },
        }

        const {data: ref} = await agent.com.atproto.repo.createRecord({
            repo: did,
            collection: "ar.com.cabildoabierto.visualization",
            record: record,
        })
        return {ref, record}
    } catch (err) {
        console.error("error", err)
        return {error: "Ocurrió un error al guardar la visualización."}
    }
}


export async function createVisualization(spec: VisualizationSpecWithMetadata, preview: FormData){
    const {error, record, ref} = await createVisualizationATProto(spec, preview)
    if(error){
        return {error}
    }
    const {updates, tags} = await processCreateRecordFromRefAndRecord(ref, record)
    await db.$transaction(updates)
    await revalidateTags(Array.from(tags))

    return {}
}