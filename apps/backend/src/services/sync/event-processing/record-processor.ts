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


type RecordValidator<T> = (ctx: AppContext, record: T) => Effect.Effect<ValidationResult<T>, ValidationError>


export type RecordProcessor<T = any> = {
    validator: RecordValidator<T>
    addRecordsToDB: (ctx: AppContext, records: RefAndRecord<T>[], reprocess?: boolean) => Effect.Effect<number, ProcessCreateError>
}


export const processRecords = <T>(
    ctx: AppContext,
    records: RefAndRecord[],
    processor: RecordProcessor<T>,
    reprocess: boolean = false,
): Effect.Effect<number, ProcessCreateError | ValidationError> => {
    if(records.length == 0) return Effect.succeed(0)

    return parseRecords(
        ctx,
        records,
        processor.validator
    ).pipe(Effect.flatMap(validatedRecords => {
        return processValidatedRecords(
            ctx,
            validatedRecords,
            processor,
            reprocess
        )
    }))
}


export const processInBatches = <T>(
    ctx: AppContext,
    records: RefAndRecord[],
    processor: RecordProcessor<T>,
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
    processor: RecordProcessor<T>,
    reprocess: boolean = false
): Effect.Effect<number, ProcessCreateError> => {
    if(records.length == 0) return Effect.succeed(0)

    const collection = getCollectionFromUri(records[0].ref.uri)

    return pipe(
        processor.addRecordsToDB(ctx, records, reprocess),
        Effect.tap(() => {
            return !reprocess ? Effect.tryPromise({
                try: () => ctx.redisCache.onUpdateRecords(records),
                catch: () => new UpdateRedisError()
            }) : Effect.void
        }),
        Effect.flatMap(processed => Effect.succeed(processed)),
        Effect.withSpan(`processValidated ${collection}`)
    )
}


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



export async function addRecordsToDBBatch(trx: Transaction<DB>, records: { ref: ATProtoStrongRef, record: any }[]) {
    const data: {
        uri: string,
        cid: string,
        rkey: string,
        collection: string,
        authorId: string
        record: string
        CAIndexedAt_tz: Date
        lastUpdatedAt_tz: Date
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
            authorId: did,
            record: JSON.stringify(record),
            CAIndexedAt_tz: new Date(),
            lastUpdatedAt_tz: new Date(),
            created_at_tz: record.createdAt ? new Date(record.createdAt) : new Date()
        })
    })

    const users = unique(records.map(r => getDidFromUri(r.ref.uri)))
    await createUsersBatch(trx, users)

    try {
        if(data.length > 0){
            await trx
                .insertInto("Record")
                .values(data)
                .onConflict((oc) =>
                    oc.column("uri").doUpdateSet((eb) => ({
                        cid: eb.ref('excluded.cid'),
                        rkey: eb.ref('excluded.rkey'),
                        collection: eb.ref('excluded.collection'),
                        created_at_tz: eb.ref('excluded.created_at_tz'),
                        authorId: eb.ref('excluded.authorId'),
                        record: eb.ref('excluded.record'),
                        lastUpdatedAt_tz: eb.ref('excluded.lastUpdatedAt_tz'), // CAIndexedAt no se actualiza
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


export async function createUsersBatch(trx: Transaction<DB>, dids: string[]) {
    if (dids.length == 0) return
    dids = unique(dids)
    await trx
        .insertInto("User")
        .values(dids.map(did => ({did, created_at_tz: new Date()})))
        .onConflict((oc) => oc.column("did").doNothing())
        .execute()
}


export async function processDirtyPostsBatch(trx: Transaction<DB>, refs: ATProtoStrongRef[]) {
    refs = refs.filter(
        r => getCollectionFromUri(r.uri) == "app.bsky.feed.post"
    )
    if(refs.length == 0) return
    await processDirtyRecordsBatch(trx, refs)
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


export async function processDirtyRecordsBatch(trx: Transaction<DB>, refs: {uri: string, cid?: string}[]) {
    if (refs.length == 0) return

    const users = refs.map(r => getDidFromUri(r.uri))
    await createUsersBatch(trx, users)

    const data = refs.map(({uri, cid}) => ({
        uri,
        rkey: getRkeyFromUri(uri),
        collection: getCollectionFromUri(uri),
        authorId: getDidFromUri(uri),
        cid,
        record: null,
        created_at_tz: new Date()
    }))

    if (data.length == 0) return

    await trx
        .insertInto("Record")
        .values(data)
        .onConflict((oc) => oc.column("uri").doNothing())
        .execute()
}




