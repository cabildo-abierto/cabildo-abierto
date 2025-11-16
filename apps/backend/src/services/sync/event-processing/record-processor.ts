import {AppContext} from "#/setup.js";
import {ATProtoStrongRef} from "#/lib/types.js";
import {getCollectionFromUri, getDidFromUri, getRkeyFromUri, splitUri} from "@cabildo-abierto/utils";
import {ValidationResult} from "@atproto/lexicon";
import {parseRecord} from "#/services/sync/parse.js";
import {RefAndRecord} from "#/services/sync/types.js";
import {Transaction} from "kysely";
import { DB } from "prisma/generated/types.js";
import {unique} from "@cabildo-abierto/utils";


export class RecordProcessor<T> {
    ctx: AppContext

    constructor(ctx: AppContext) {
        this.ctx = ctx
    }

    async process(records: RefAndRecord[], reprocess: boolean = false) {
        if(records.length == 0) return
        const validatedRecords = this.parseRecords(records)
        await this.processValidated(validatedRecords, reprocess)
    }

    async processValidated(records: RefAndRecord<T>[], reprocess: boolean = false) {
        if(records.length == 0) return
        await this.addRecordsToDB(records, reprocess)
        if(!reprocess){
            await this.ctx.redisCache.onUpdateRecords(records)
        }
    }

    validateRecord(record: any): ValidationResult<T> {
        this.ctx.logger.pino.info("Warning: Validación sin implementar para este tipo de record.")
        return {
            success: false,
            error: Error("Sin implementar")
        }
    }

    async addRecordsToDB(records: RefAndRecord<T>[], reprocess: boolean = false) {
        if(records.length == 0) return
        this.ctx.logger.pino.info({uri: records[0].ref.uri}, "Warning: Validación sin implementar para este tipo de record.")
    }

    async processInBatches(records: RefAndRecord[]){
        if(records.length == 0) return

        const collection = getCollectionFromUri(records[0].ref.uri)

        const batchSize = 1000
        for (let i = 0; i < records.length; i+=batchSize) {
            const t1 = Date.now()
            const batchRecords = records.slice(i, i+batchSize)
            await this.process(batchRecords)
            const t2 = Date.now()
            this.ctx.logger.pino.info(`${collection}: processed batch ${i+1} of ${records.length} in ${t2-t1}ms`)
        }
    }

    parseRecords(records: RefAndRecord[]): {
        ref: ATProtoStrongRef,
        record: T
    }[] {
        const parsedRecords: RefAndRecord<T>[] = []
        for (const {ref, record} of records) {
            const res = this.validateRecord(record)
            if (res.success) {
                parsedRecords.push({
                    ref,
                    record: res.value
                })
            } else {
                const parsedRecord = parseRecord(this.ctx, record)
                const res = this.validateRecord(parsedRecord)
                if(res.success) {
                    parsedRecords.push({
                        ref,
                        record: res.value
                    })
                } else {
                    this.ctx.logger.pino.warn({
                        reason: res.error.message,
                        stack: res.error.stack,
                        uri: ref.uri,
                        record
                    }, "invalid record")
                }
            }
        }
        return parsedRecords
    }


    async processRecordsBatch(trx: Transaction<DB>, records: { ref: ATProtoStrongRef, record: any }[]) {
        const data: {
            uri: string,
            cid: string,
            rkey: string,
            collection: string,
            created_at?: Date,
            authorId: string
            record: string
            CAIndexedAt: Date
            CAIndexedAt_tz: Date
            lastUpdatedAt: Date
            created_at_tz?: Date
        }[] = []

        records.forEach(r => {
            const {ref, record} = r
            const {did, collection, rkey} = splitUri(ref.uri)
            data.push({
                uri: ref.uri,
                cid: ref.cid,
                rkey,
                collection,
                created_at: record.createdAt ? new Date(record.createdAt) : undefined,
                authorId: did,
                record: JSON.stringify(record),
                CAIndexedAt: new Date(),
                CAIndexedAt_tz: new Date(),
                lastUpdatedAt: new Date(),
                created_at_tz: record.createdAt ? new Date(record.createdAt) : new Date()
            })
        })

        const users = unique(records.map(r => getDidFromUri(r.ref.uri)))
        await this.createUsersBatch(trx, users)

        try {
            if(data.length > 0){
                await trx
                    .insertInto('Record')
                    .values(data)
                    .onConflict((oc) =>
                        oc.column("uri").doUpdateSet((eb) => ({
                            cid: eb.ref('excluded.cid'),
                            rkey: eb.ref('excluded.rkey'),
                            collection: eb.ref('excluded.collection'),
                            created_at: eb.ref('excluded.created_at'),
                            created_at_tz: eb.ref('excluded.created_at_tz'),
                            authorId: eb.ref('excluded.authorId'),
                            record: eb.ref('excluded.record'),
                            lastUpdatedAt: eb.ref('excluded.lastUpdatedAt'), // CAIndexedAt no se actualiza
                            editedAt: eb.case()
                                .when("Record.cid", "!=", eb.ref("excluded.cid"))
                                .then(new Date()).else(eb.ref("Record.editedAt")).end()
                        }))
                    )
                    .execute()
            }
        } catch (err) {
            console.log(err)
            console.log("Error processing records")
        }
    }


    async createUsersBatch(trx: Transaction<DB>, dids: string[]) {
        if (dids.length == 0) return
        dids = unique(dids)
        await trx
            .insertInto("User")
            .values(dids.map(did => ({did})))
            .onConflict((oc) => oc.column("did").doNothing())
            .execute()
    }


    async processDirtyRecordsBatch(trx: Transaction<DB>, refs: ATProtoStrongRef[]) {
        if (refs.length == 0) return

        const users = refs.map(r => getDidFromUri(r.uri))
        await this.createUsersBatch(trx, users)

        const data = refs.map(({uri, cid}) => ({
            uri,
            rkey: getRkeyFromUri(uri),
            collection: getCollectionFromUri(uri),
            authorId: getDidFromUri(uri),
            cid,
            record: null
        }))

        if (data.length == 0) return

        await trx
            .insertInto("Record")
            .values(data)
            .onConflict((oc) => oc.column("uri").doNothing())
            .execute()
    }
}




