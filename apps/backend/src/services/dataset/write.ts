import {SessionAgent} from "#/utils/session-agent.js";
import {uploadStringBlob} from "#/services/blob.js";
import {ArCabildoabiertoDataDataset} from "@cabildo-abierto/api"
import {BlobRef} from "@atproto/lexicon";
import {compress} from "@cabildo-abierto/editor-core";
import {DatasetRecordProcessor} from "#/services/sync/event-processing/dataset.js";
import {getRkeyFromUri} from "@cabildo-abierto/utils";
import {AppContext} from "#/setup.js";
import {Effect} from "effect";
import {ATCreateRecordError} from "#/services/wiki/votes.js";
import {RefAndRecord} from "#/services/sync/types.js";
import {EffHandler} from "#/utils/handler.js";


export function createDatasetATProto(ctx: AppContext, agent: SessionAgent, params: CreateDatasetProps): Effect.Effect<RefAndRecord<ArCabildoabiertoDataDataset.Record>, string> {

    return Effect.gen(function* () {
        if(params.format != "json"){
            return yield* Effect.fail(`Formato no soportado.`)
        }
        let blobRef: BlobRef | null = yield* uploadStringBlob(agent, compress(params.data))

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

        if(!params.uri) {
            const {data: datasetData} = yield* Effect.tryPromise({
                try: () => agent.bsky.com.atproto.repo.createRecord({
                    repo: agent.did,
                    collection: "ar.cabildoabierto.data.dataset",
                    record: record
                }),
                catch: () => new ATCreateRecordError()
            })

            return {
                record,
                ref: {cid: datasetData.cid, uri: datasetData.uri}
            }
        } else {
            const {data: datasetData} = yield* Effect.tryPromise({
                try: () => agent.bsky.com.atproto.repo.putRecord({
                    repo: agent.did,
                    collection: "ar.cabildoabierto.data.dataset",
                    rkey: getRkeyFromUri(params.uri!),
                    record: record
                }),
                catch: () => new ATCreateRecordError()
            })

            return {
                record,
                ref: {cid: datasetData.cid, uri: datasetData.uri}
            }
        }
    }).pipe(
        Effect.catchTag("ATCreateRecordError", () => {
            return Effect.fail("Ocurrió un error al publicar el conjunto de datos.")
        }),
        Effect.catchTag("UploadStringBlobError", () => {
            return Effect.fail("Ocurrió un error al guardar los datos.")
        })
    )
}

type CreateDatasetProps = {
    name: string
    description: string
    columns: string[]
    data: string
    format?: string
    uri?: string
}

export const createDataset: EffHandler<CreateDatasetProps, {uri: string}> = (ctx, agent, params) => {
    return Effect.gen(function* () {
        const {record, ref} = yield* createDatasetATProto(ctx, agent, params)

        yield* new DatasetRecordProcessor(ctx).processValidated([{ref, record}]).pipe(Effect.catchAll(() => Effect.fail("Se publicó el conjunto de datos pero tuvimos un inconveniente al procesarlo.")))

        return {uri: ref.uri}
    })
}