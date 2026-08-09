import {AppContext} from "#/setup.js";
import {ATProtoStrongRef} from "@cabildo-abierto/api";
import {getCollectionFromUri, getRkeyFromUri, sum, unique} from "@cabildo-abierto/utils";
import {ValidationResult} from "@atproto/lexicon";
import {parseRecord} from "#/services/sync/parse.js";
import {RefAndRecord} from "#/services/sync/types.js";
import {Effect} from "effect";
import {AddJobError, DBInsertError, InvalidValueError, UpdateRedisError} from "#/utils/errors.js";
import {CIDEncodeError} from "#/services/write/topic.js";
import {Transaction} from "kysely";
import {getDidFromUri, splitUri} from "@cabildo-abierto/utils";
import {createUsersBatch} from "#/services/user/creation.js";
import {DB} from "../../../../prisma/generated/types.js";


export class InsertRecordError {
    readonly _tag = "InsertRecordError"
    name: string | undefined
    message: string | undefined
    constructor(error?: unknown) {
        if(error && error instanceof Error) {
            this.name = error?.name
            this.message = error?.message
        }
    }
}

export type ProcessCreateError = CIDEncodeError | InsertRecordError | InvalidValueError | UpdateRedisError | AddJobError | DBInsertError


export type ValidationError = CIDEncodeError


type RecordValidator<T> = (ctx: AppContext, record: T) => Effect.Effect<ValidationResult<T>, ValidationError>


export type Processor<T = any> = {
    validator: RecordValidator<T>
    addRecordsToDB: (ctx: AppContext, records: RefAndRecord<T>[], trx: Transaction<DB>, reprocess?: boolean) =>
        Effect.Effect<number, ProcessCreateError>
}


export const processRecords = <T>(
    ctx: AppContext,
    records: RefAndRecord[],
    processor: Processor<T>,
    reprocess: boolean = false,
): Effect.Effect<number, ProcessCreateError | ValidationError> => Effect.gen(function* () {
    if(records.length == 0) return 0

    const validatedRecords = yield* parseRecords(
        ctx,
        records,
        processor.validator
    )
    ctx.logger.pino.info({count: records.length, collection: getCollectionFromUri(records[0].ref.uri), valid: validatedRecords.length}, "processing records")
    return yield* processValidatedRecords(
        ctx,
        validatedRecords,
        processor,
        reprocess
    )
})


export const processInBatches = <T>(
    ctx: AppContext,
    records: RefAndRecord[],
    processor: Processor<T>,
    reprocess: boolean = false
): Effect.Effect<void, ProcessCreateError | UpdateRedisError | InvalidValueError | ValidationError> => {
    if(records.length == 0) return Effect.void

    const batchSize = 1000
    const batches: RefAndRecord[][] = []

    for (let i = 0; i < records.length; i+=batchSize) {
        batches.push(records.slice(i, i+batchSize))
    }

    return Effect.all(batches.map(b => processRecords(ctx, b, processor, reprocess))).pipe(
        Effect.map(processResults => {
            return sum(processResults, x => x)
        })
    )
}


export const processValidatedRecords = <T>(
    ctx: AppContext,
    records: RefAndRecord<T>[],
    processor: Processor<T>,
    reprocess: boolean = false
): Effect.Effect<number, ProcessCreateError> => Effect.gen(function* () {
    if(records.length == 0) return 0

    const collection = getCollectionFromUri(records[0].ref.uri)

    const trx = yield* Effect.tryPromise({
        try: () => ctx.kysely.startTransaction().execute(),
        catch: (e) => new DBInsertError(e)
    })

    const processed = yield* Effect.gen(function* () {
        yield* addRecordsToDBBatch(trx, records)

        return yield* processor
            .addRecordsToDB(ctx, records, trx, reprocess)
            .pipe(Effect.withSpan(`addRecordsToDB ${collection}`))
    }).pipe(
        Effect.tap(() => Effect.tryPromise({
            try: () => trx.commit().execute(),
            catch: (e) => new DBInsertError(e)
        })),
        Effect.tapError(() => Effect.tryPromise({
            try: () => trx.rollback().execute(),
            catch: () => new DBInsertError()
        }).pipe(Effect.ignore)),
        Effect.withSpan(`processValidated ${collection}`)
    )

    if(!reprocess) {
        yield* Effect.tryPromise({
            try: () => ctx.redisCache.onUpdateRecords(records),
            catch: () => new UpdateRedisError()
        })
    }

    return processed
})

const parseRecords = <T>(
    ctx: AppContext,
    records: RefAndRecord[],
    validator: RecordValidator<T>
): Effect.Effect<{
    ref: ATProtoStrongRef,
    record: T
}[], ValidationError> => {
    return Effect.all(records.map(r => Effect.gen(function* () {
        const {ref, record} = r
        const res = yield* validator(ctx, record)
        if(res.success) {
            return yield* Effect.succeed({ref, record: res.value})
        } else {
            const parsedRecord = parseRecord(ctx, record)
            const res = yield* validator(ctx, parsedRecord)
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



export const addRecordsToDBBatch = (
    trx: Transaction<DB>,
    records: { ref: ATProtoStrongRef, record: any }[]
) => Effect.gen(function* () {
    const data: {
        uri: string,
        cid: string,
        rkey: string,
        collection: string,
        authorId: string
        record: string
        caIndexedAt: Date
        lastUpdatedAt: Date
        createdAt?: Date
    }[] = []

    records.forEach(r => {
        const {ref, record} = r
        const {did, collection, rkey} = splitUri(ref.uri)
        data.push({
            uri: ref.uri,
            cid: ref.cid,
            rkey,
            collection,
            authorId: did,
            record: JSON.stringify(record),
            caIndexedAt: new Date(),
            lastUpdatedAt: new Date(),
            createdAt: record.createdAt ? new Date(record.createdAt) : new Date()
        })
    })

    const users = unique(records.map(r => getDidFromUri(r.ref.uri)))
    yield* createUsersBatch(trx, users)

    if(data.length > 0){
        yield* Effect.tryPromise({
            try: () => trx
                .insertInto("Record")
                .values(data)
                .onConflict((oc) =>
                    oc.column("uri").doUpdateSet((eb) => ({
                        cid: eb.ref('excluded.cid'),
                        rkey: eb.ref('excluded.rkey'),
                        collection: eb.ref('excluded.collection'),
                        createdAt: eb.ref('excluded.createdAt'),
                        authorId: eb.ref('excluded.authorId'),
                        record: eb.ref('excluded.record')
                    }))
                )
                .execute(),
            catch: (e) => new DBInsertError(e)
        })
    }
})


export const processDirtyPostsBatch = (
    trx: Transaction<DB>,
    refs: ATProtoStrongRef[]
) => Effect.gen(function* () {
    refs = refs.filter(
        r => getCollectionFromUri(r.uri) == "app.bsky.feed.post"
    )
    if(refs.length == 0) return
    yield* processDirtyRecordsBatch(trx, refs)
    yield* Effect.tryPromise({
        try: () => trx
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
            .execute(),
        catch: (e) => new DBInsertError(e)
    })
    yield* Effect.tryPromise({
        try: () => trx
            .insertInto("Post")
            .values(refs.map(r => {
                return {
                    uri: r.uri,
                    langs: []
                }
            }))
            .onConflict(oc => oc.column("uri").doNothing())
            .execute(),
        catch: (e) => new DBInsertError(e)
    })
})


export const processDirtyRecordsBatch = (
    trx: Transaction<DB>,
    refs: {uri: string, cid?: string}[]
) => Effect.gen(function* () {
    if (refs.length == 0) return

    const users = refs.map(r => getDidFromUri(r.uri))
    yield* createUsersBatch(trx, users)

    const data = refs.map(({uri, cid}) => ({
        uri,
        rkey: getRkeyFromUri(uri),
        collection: getCollectionFromUri(uri),
        authorId: getDidFromUri(uri),
        cid,
        record: null,
        createdAt: new Date()
    }))

    if (data.length == 0) return

    yield* Effect.tryPromise({
        try: () => trx
            .insertInto("Record")
            .values(data)
            .onConflict((oc) => oc.column("uri").doNothing())
            .execute(),
        catch: (e) => new DBInsertError(e)
    })
})


