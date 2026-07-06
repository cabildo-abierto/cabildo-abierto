import {
    getDidFromUri
} from "@cabildo-abierto/utils";
import {ArCabildoabiertoDataDataset} from "@cabildo-abierto/api"
import {
    addRecordsToDBBatch,
    InsertRecordError,
    Processor
} from "#/services/record/processor.js";
import {Effect} from "effect";
import {DeleteProcessor} from "#/services/sync/event-processing/delete-processor.js";
import {DBDeleteError} from "#/utils/errors.js";
import {RefAndRecord} from "#/services/sync/types.js";
import {AppContext} from "#/setup.js";


export const datasetRecordProcessor: Processor<ArCabildoabiertoDataDataset.Record> = {
    validator: (ctx, record: ArCabildoabiertoDataDataset.Record) => {
        return Effect.succeed(ArCabildoabiertoDataDataset.validateRecord(record))
    },

    addRecordsToDB: (ctx: AppContext, records: RefAndRecord<ArCabildoabiertoDataDataset.Record>[], reprocess = false) => {
        const datasets = records.map(({ref, record: r}) => ({
            uri: ref.uri,
            columns: r.columns.map(({name}: { name: string }) => (name)),
            title: r.name,
            description: r.description ? r.description : undefined,
            blobCid: r.blob?.ref ? r.blob.ref.toString() : undefined,
        }))

        const blobs: {cid: string, authorId: string}[] = records.map(r =>
            r.record.blob?.ref ? ({
                cid: r.record.blob?.ref.toString(),
                authorId: getDidFromUri(r.ref.uri)
            }) : null
        ).filter(x => x != null)

        const insertRecords = ctx.kysely.transaction().execute(async (trx) => {
            await addRecordsToDBBatch(trx, records)

            if(blobs.length > 0) {
                await trx
                    .insertInto("Blob")
                    .values(blobs)
                    .onConflict((oc) => oc.column("cid").doNothing())
                    .execute()
            }

            if(datasets.length > 0) {
                await trx
                    .insertInto("Dataset")
                    .values(datasets)
                    .onConflict((oc) => (
                        oc.column("uri").doUpdateSet({
                            columns: (eb) => eb.ref("excluded.columns"),
                            title: (eb) => eb.ref("excluded.title"),
                            description: (eb) => eb.ref("excluded.description"),
                            blobCid: (eb) => eb.ref("excluded.blobCid"),
                        })
                    ))
                    .execute()
            }

            return records.length
        })

        return Effect.tryPromise({
            try: () => insertRecords,
            catch: (error) => new InsertRecordError(error)
        })
    }
}


export const datasetDeleteProcessor: DeleteProcessor = (ctx, uris) => {
    return Effect.tryPromise({
        try: () => ctx.kysely.transaction().execute(async (trx) => {
            await trx
                .deleteFrom("Dataset")
                .where("Dataset.uri", "in", uris)
                .execute()
            await trx
                .deleteFrom("Record")
                .where("Record.uri", "in", uris)
                .execute()
        }),
        catch: () => new DBDeleteError()
    })
}