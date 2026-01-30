import {
    getDidFromUri
} from "@cabildo-abierto/utils";
import {ArCabildoabiertoDataDataset} from "@cabildo-abierto/api"
import {ATProtoStrongRef} from "@cabildo-abierto/api";
import {InsertRecordError, RecordProcessor} from "#/services/sync/event-processing/record-processor.js";
import {DeleteProcessor} from "#/services/sync/event-processing/delete-processor.js";
import {Effect} from "effect";



export class DatasetRecordProcessor extends RecordProcessor<ArCabildoabiertoDataDataset.Record> {

    validateRecord = ArCabildoabiertoDataDataset.validateRecord

    addRecordsToDB(records: {ref: ATProtoStrongRef, record: ArCabildoabiertoDataDataset.Record}[], reprocess: boolean = false) {
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


        const insertRecords = this.ctx.kysely.transaction().execute(async (trx) => {
            await this.processRecordsBatch(trx, records)

            await trx
                .insertInto("Dataset")
                .values(datasets)
                .onConflict((oc) => (
                    oc.column("uri").doUpdateSet({
                        columns: (eb) => eb.ref("excluded.columns"),
                        title: (eb) => eb.ref("excluded.title"),
                        description: (eb) => eb.ref("excluded.description"),
                    })
                ))
                .execute()

            await trx
                .insertInto("Blob")
                .values(blobs)
                .onConflict((oc) => oc.column("cid").doNothing())
                .execute()

            await trx
                .deleteFrom("DataBlock")
                .where("datasetId", "in", records.map(r => r.ref.uri))
                .execute()

            await trx
                .insertInto("DataBlock")
                .values(blocks)
                .onConflict((oc) => oc.column("cid").doNothing())
                .execute()

            return records.length
        })

        return Effect.tryPromise({
            try: () => insertRecords,
            catch: () => new InsertRecordError()
        })
    }
}

export class DatasetDeleteProcessor extends DeleteProcessor {
    async deleteRecordsFromDB(uris: string[]){
        await this.ctx.kysely.transaction().execute(async (trx) => {
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
        })
    }
}