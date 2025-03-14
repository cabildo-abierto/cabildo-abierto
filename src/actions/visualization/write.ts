"use server"
import {VisualizationSpec} from "vega-embed";
import {getSessionAgent} from "../auth";
import {BlobRef} from "@atproto/lexicon";
import {getCollectionFromUri, getDidFromUri, getRkeyFromUri} from "../../components/utils/utils";
import {createRecord, newDirtyRecord} from "../write/utils";
import {db} from "../../db";
import {ATProtoStrongRef} from "../../app/lib/definitions";
import {VisualizationSpecWithMetadata} from "../../components/visualizations/editor/spec";
import {revalidateTag} from "next/cache";
import {revalidateUri} from "../revalidate";


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

    return {}
}


export async function createVisualizationDB(
    ref: ATProtoStrongRef,
    record: any,
    spec: VisualizationSpecWithMetadata
): Promise<{error?: string}> {


    const baseRecord = {
        did: getDidFromUri(ref.uri),
        uri: ref.uri,
        cid: ref.cid,
        rkey: getRkeyFromUri(ref.uri),
        createdAt: new Date(),
        collection: getCollectionFromUri(ref.uri),
        record
    }
    console.log("base record", baseRecord)

    let updates: any[] = createRecord(baseRecord)

    const datasetUri: string | null = spec.metadata && spec.metadata.editorConfig ? spec.metadata.editorConfig.datasetUri : null

    if(datasetUri){
        updates = [...updates, ...newDirtyRecord({uri: datasetUri})]
    }

    const blobCid: string = record.preview.ref.toString()
    const blobDid = getDidFromUri(ref.uri)
    const blob = {
        cid: blobCid,
        authorId: blobDid
    }

    const visualization = {
        uri: ref.uri,
        spec: JSON.stringify(spec),
        datasetId: datasetUri,
        previewBlobCid: blobCid
    }

    console.log("blob", blob)
    console.log("visualization", visualization)

    updates = [
        ...updates,
        db.blob.upsert({
            create: blob,
            update: blob,
            where: {cid: blobCid}
        }),
        db.visualization.upsert({
            create: visualization,
            update: visualization,
            where: {uri: ref.uri}
        })
    ]

    await db.$transaction(updates)

    return {}
}


export async function createVisualization(spec: VisualizationSpecWithMetadata, preview: FormData){
    const {error, record, ref} = await createVisualizationATProto(spec, preview)
    if(error){
        return {error}
    }
    await createVisualizationDB(ref, record, spec)
    revalidateTag("visualizations")
    await revalidateUri(spec.metadata.editorConfig.datasetUri)
    return {}
}