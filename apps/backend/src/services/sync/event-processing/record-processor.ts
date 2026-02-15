import {AppContext} from "#/setup.js";
import {ATProtoStrongRef} from "@cabildo-abierto/api";
import {getCollectionFromUri, getDidFromUri, getRkeyFromUri, splitUri, sum, unique} from "@cabildo-abierto/utils";
import {ValidationResult} from "@atproto/lexicon";
import {parseRecord} from "#/services/sync/parse.js";
import {RefAndRecord} from "#/services/sync/types.js";
import {Transaction} from "kysely";
import {DB} from "prisma/generated/types.js";
import {Effect, pipe} from "effect";

import {AddJobError, InvalidValueError, UpdateRedisError} from "#/utils/errors.js";
import {CIDEncodeError} from "#/services/write/topic.js";


export class InsertRecordError {
    readonly _tag = "InsertRecordError"
    name: string | undefined
    message: string | undefined
    constructor(error?: Error) {
        this.name = error?.name
        this.message = error?.message
    }
}

export type ProcessCreateError = CIDEncodeError | InsertRecordError | InvalidValueError | UpdateRedisError | AddJobError


export type ValidationError = CIDEncodeError


export class RecordProcessor<T> {
    ctx: AppContext

    constructor(ctx: AppContext) {
        this.ctx = ctx
    }

    process(records: RefAndRecord[], reprocess: boolean = false): Effect.Effect<number, ProcessCreateError | ValidationError> {
        if(records.length == 0) return Effect.succeed(0)

        return this.parseRecords(records).pipe(Effect.flatMap(validatedRecords => {
            return this.processValidated(validatedRecords, reprocess)
        }))
    }

    processValidated(records: RefAndRecord<T>[], reprocess: boolean = false): Effect.Effect<number, ProcessCreateError> {
        if(records.length == 0) return Effect.succeed(0)

        const collection = getCollectionFromUri(records[0].ref.uri)

        return pipe(
            this.addRecordsToDB(records, reprocess),
            Effect.tap(() => {
                return !reprocess ? Effect.tryPromise({
                    try: () => this.ctx.redisCache.onUpdateRecords(records),
                    catch: () => new UpdateRedisError()
                }) : Effect.void
            }),
            Effect.flatMap(processed => Effect.succeed(processed)),
            Effect.withSpan(`processValidated ${collection}`)
        )
    }

    validateRecord(record: any): Effect.Effect<ValidationResult<T>, ValidationError> {
        this.ctx.logger.pino.info({record}, "Warning: Validación sin implementar para este tipo de record.")
        return Effect.succeed({
            success: false,
            error: Error("Sin implementar")
        })
    }

    addRecordsToDB(records: RefAndRecord<T>[], reprocess: boolean = false): Effect.Effect<number, ProcessCreateError | InvalidValueError> {
        if(records.length == 0) return Effect.succeed(0)
        return Effect.fail(new InvalidValueError(records[0].ref.uri))
    }

    processInBatches(records: RefAndRecord[]): Effect.Effect<void, ProcessCreateError | UpdateRedisError | InvalidValueError | ValidationError> {
        if(records.length == 0) return Effect.void

        const batchSize = 1000
        const batches: RefAndRecord[][] = []

        for (let i = 0; i < records.length; i+=batchSize) {
            batches.push(records.slice(i, i+batchSize))
        }

        return Effect.all(batches.map(b => this.process(b))).pipe(
            Effect.map(processResults => {
                return sum(processResults, x => x)
            })
        )
    }

    parseRecords(records: RefAndRecord[]): Effect.Effect<{
        ref: ATProtoStrongRef,
        record: T
    }[], ValidationError> {
        const ctx = this.ctx
        const validateRecord = this.validateRecord
        return Effect.all(records.map(r => Effect.gen(function* () {
            const {ref, record} = r
            const res = yield* validateRecord(record)
            if(res.success) {
                return yield* Effect.succeed({ref, record: res.value})
            } else {
                const parsedRecord = parseRecord(ctx, record)
                const res = yield* validateRecord(parsedRecord)
                if(res.success) {
                    return yield* Effect.succeed({
                        ref,
                        record: res.value
                    })
                } else {
                    // TO DO: Esto sobreescribe, habría que armar un resumen.
                    return yield* Effect.annotateCurrentSpan({
                        reason: res.error.message,
                        stack: res.error.stack,
                        uri: ref.uri,
                        record
                    }).pipe(Effect.flatMap(() => Effect.succeed(null)))
                }
            }
        }))).pipe(
            Effect.flatMap(results => Effect.succeed(results.filter(r => r != null))),
        )}

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


    async processDirtyPostsBatch(trx: Transaction<DB>, refs: ATProtoStrongRef[]) {
        refs = refs.filter(
            r => getCollectionFromUri(r.uri) == "app.bsky.feed.post"
        )
        if(refs.length == 0) return
        await this.processDirtyRecordsBatch(trx, refs)
        await trx
            .insertInto("Content")
            .values(refs.map(r => {
                return {
                    uri: r.uri,
                    collection: getCollectionFromUri(r.uri),
                    selfLabels: [],
                    embeds: []
                }
            }))
            .onConflict(oc => oc.column("uri").doNothing())
            .execute()
        await trx
            .insertInto("Post")
            .values(refs.map(r => {
                return {
                    uri: r.uri,
                    langs: []
                }
            }))
            .onConflict(oc => oc.column("uri").doNothing())
            .execute()
    }


    async processDirtyRecordsBatch(trx: Transaction<DB>, refs: {uri: string, cid?: string}[]) {
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




