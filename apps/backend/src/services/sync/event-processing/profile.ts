import {getDidFromUri} from "@cabildo-abierto/utils";
import {ArCabildoabiertoActorCaProfile} from "@cabildo-abierto/api"
import {
    InsertRecordError,
    Processing
} from "#/services/record/processing.js";
import {DeleteProcessor} from "#/services/sync/event-processing/delete-processor.js";
import {Effect} from "effect";
import {DBDeleteError} from "#/utils/errors.js";


export const caProfileRecordProcessor: Processing<ArCabildoabiertoActorCaProfile.Record> = {
    validator: (ctx, record: ArCabildoabiertoActorCaProfile.Record) => {
        return Effect.succeed(ArCabildoabiertoActorCaProfile.validateRecord(record))
    },

    addRecordsToDB: (ctx, records, reprocess = false) => {
        const values = records.map(r => {
            return {
                did: getDidFromUri(r.ref.uri),
                inCA: true,
                recordCreatedAt: r.record.createdAt ?? null,
                displayName: r.record.displayName
            }
        })

        const insertRecords = ctx.kysely.transaction().execute(async (trx) => {

            await trx
                .insertInto("User")
                .values(values)
                .onConflict(oc => oc.column("did").doUpdateSet(() => ({
                    inCA: eb => eb.ref("excluded.inCA"),
                    recordCreatedAt: eb => eb.ref("excluded.recordCreatedAt")
                })))
                .execute()

            return values.length
        })

        return Effect.tryPromise({
            try: () => insertRecords,
            catch: (error) => new InsertRecordError(error)
        })
    }
}


export const caProfileDeleteProcessor: DeleteProcessor = (ctx, uris) => {
    const dids = uris.map(getDidFromUri)

    return Effect.tryPromise({
        try: () => ctx.kysely.transaction().execute(async (trx) => {
            await trx
                .deleteFrom("Record")
                .where("Record.uri", "in", uris)
                .execute()

            await trx
                .updateTable("User")
                .set("inCA", false)
                .set("hasAccess", false)
                .where("User.did", "in", dids)
                .execute()
        }),
        catch: error => new DBDeleteError(error)
    })
}