import {SessionAgent} from "#/utils/session-agent.js";
import {CAHandler} from "#/utils/handler.js";
import {uploadStringBlob} from "#/services/blob.js";
import {ArCabildoabiertoDataDataset} from "@cabildo-abierto/api"
import {BlobRef} from "@atproto/lexicon";
import {compress} from "@cabildo-abierto/editor-core";
import {DatasetRecordProcessor} from "#/services/sync/event-processing/dataset.js";
import {getRkeyFromUri} from "@cabildo-abierto/utils";
import {AppContext} from "#/setup.js";


export async function createDatasetATProto(ctx: AppContext, agent: SessionAgent, params: CreateDatasetProps) {
    if(params.format != "json"){
        return {error: "Formato no soportado."}
    }
    let blobRef: BlobRef | null = null
    try {
        blobRef = await uploadStringBlob(agent, compress(params.data))
    } catch (err) {
        ctx.logger.pino.error({error: err}, "Error al publicar el blob.")
        return {error: "Error al publicar el dataset."}
    }

    const curDate = new Date().toISOString()

    const record: ArCabildoabiertoDataDataset.Record = {
        name: params.name,
        createdAt: curDate,
        columns: params.columns.map((c) => ({name: c})),
        description: params.description,
        data: [
            {
                $type: "ar.cabildoabierto.data.dataset#dataBlock",
                blob: blobRef,
                format: "json-compressed"
            }
        ],
        $type: "ar.cabildoabierto.data.dataset"
    }

    try {
        if(!params.uri) {
            const {data: datasetData} = await agent.bsky.com.atproto.repo.createRecord({
                repo: agent.did,
                collection: "ar.cabildoabierto.data.dataset",
                record: record
            })

            return {
                record,
                ref: {cid: datasetData.cid, uri: datasetData.uri}
            }
        } else {
            const {data: datasetData} = await agent.bsky.com.atproto.repo.putRecord({
                repo: agent.did,
                collection: "ar.cabildoabierto.data.dataset",
                rkey: getRkeyFromUri(params.uri),
                record: record
            })

            return {
                record,
                ref: {cid: datasetData.cid, uri: datasetData.uri}
            }
        }
    } catch (e) {
        console.error(e)
        return {error: "No se pudo publicar el dataset."}
    }
}

type CreateDatasetProps = {
    name: string
    description: string
    columns: string[]
    data: string
    format?: string
    uri?: string
}

export const createDataset: CAHandler<CreateDatasetProps, {uri: string}> = async (ctx, agent, params) => {
    const {error, record, ref} = await createDatasetATProto(ctx, agent, params)
    if (error || !record || !ref) return {error}

    await new DatasetRecordProcessor(ctx).processValidated([{ref, record}])

    return {data: {uri: ref.uri}}
}