import {
    getDidFromUri
} from "@cabildo-abierto/utils";
import {ArCabildoabiertoDataDataset} from "@cabildo-abierto/api"
import {ATProtoStrongRef} from "@cabildo-abierto/api";
import {
    Processor
} from "#/services/sync/event-processing/record-processor.js";
import {Effect} from "effect";
import {DeleteProcessor} from "#/services/sync/event-processing/delete-processor.js";
import {DBDeleteError, DBInsertError} from "#/utils/errors.js";
import {RefAndRecord} from "#/services/sync/types.js";
import {AppContext} from "#/setup.js";


export const datasetProcessor: Processor<ArCabildoabiertoDataDataset.Record> = {
    validator: (ctx, record: ArCabildoabiertoDataDataset.Record) => {
        return Effect.succeed(ArCabildoabiertoDataDataset.validateRecord(record))
    },

    addRecordsToDB: (ctx: AppContext, records: RefAndRecord<ArCabildoabiertoDataDataset.Record>[], trx, reprocess = false) => Effect.gen(function* () {
        const datasets = records.map(({ref, record: r}) => ({
            uri: ref.uri,
            columns: r.columns.map(({name}: { name: string }) => (name)),
            title: r.name,
            description: r.description ? r.description : undefined
        }))

        const blobs = records.flatMap(r =>
            r.record.data?.map(b => ({
                cid: b.blob.ref.toString(),
                authorId: getDidFromUri(r.ref.uri)
            })) ?? []
        )

        const blocks = records.flatMap(r =>
            r.record.data?.map(b => ({
                cid: b.blob.ref.toString(),
                datasetId: r.ref.uri,
                format: b.format
            })) ?? []
        )


        yield* Effect.tryPromise({
            try: () => trx
                .insertInto("Dataset")
                .values(datasets)
                .onConflict((oc) => (
                    oc.column("uri").doUpdateSet({
                        columns: (eb) => eb.ref("excluded.columns"),
                        title: (eb) => eb.ref("excluded.title"),
                        description: (eb) => eb.ref("excluded.description"),
                    })
                ))
                .execute(),
            catch: error => new DBInsertError(error)
        })

        if (blobs.length > 0) {
            yield* Effect.tryPromise({
                try: () => trx
                    .insertInto("Blob")
                    .values(blobs)
                    .onConflict((oc) => oc.column("cid").doNothing())
                    .execute(),
                catch: error => new DBInsertError(error)
            })
        }

        yield* Effect.tryPromise({
            try: () => trx
                .deleteFrom("DataBlock")
                .where("datasetId", "in", records.map(r => r.ref.uri))
                .execute(),
            catch: error => new DBInsertError(error)
        })

        if (blocks.length > 0) {
            yield* Effect.tryPromise({
                try: () => trx
                    .insertInto("DataBlock")
                    .values(blocks)
                    .onConflict((oc) => oc.column("cid").doNothing())
                    .execute(),
                catch: error => new DBInsertError(error)
            })
        }

        return records.length
    })
}

export const datasetRecordProcessor = datasetProcessor


export const datasetDeleteProcessor: DeleteProcessor = (ctx, uris) => {
    return Effect.tryPromise({
        try: () => ctx.kysely.transaction().execute(async (trx) => {
            await trx
                .deleteFrom("DataBlock")
                .where("DataBlock.datasetId", "in", uris)
                .execute()
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