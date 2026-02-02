import {AppContext} from "#/setup.js";
import {dbHandleToDid, HandleResolutionError} from "#/services/user/users.js";
import {JetstreamEvent} from "#/lib/types.js";
import {RepoReader} from "@atcute/car/v4"
import {getServiceEndpointForDid} from "#/services/blob.js";
import {getUri, shortCollectionToCollection} from "@cabildo-abierto/utils";
import {EffHandler} from "#/utils/handler.js";
import {processEventsBatch} from "#/services/sync/event-processing/event-processor.js";
import {
    batchDeleteRecords,
    getRecordProcessor,
    ProcessDeleteError
} from "#/services/sync/event-processing/get-record-processor.js";
import {RefAndRecord} from "#/services/sync/types.js";
import {env} from "#/lib/env.js";
import {ATProtoStrongRef} from "@cabildo-abierto/api";
import {Effect} from "effect";
import {handleOrDidToDid} from "#/id-resolver.js";
import {UserNotFoundError} from "#/services/user/access.js";
import {DBError} from "#/services/write/article.js";
import {RedisCacheFetchError, RedisCacheSetError} from "#/services/redis/cache.js";
import {ProcessCreateError} from "#/services/sync/event-processing/record-processor.js";

import {AddJobError} from "#/utils/errors.js";


export async function getCAUsersAndFollows(ctx: AppContext) {
    return await ctx.kysely
        .selectFrom("User")
        .innerJoin("Follow", "User.did", "Follow.userFollowedId")
        .innerJoin("Record", "Record.uri", "Follow.uri")
        .innerJoin("User as Follower", "Follower.did", "Record.authorId")
        .where("Follower.inCA", "=", true)
        .select(["User.did"])
        .distinct()
        .execute()
}


export class RepoTooLargeError {
    readonly _tag = "RepoTooLargeError"
}


type SyncError = FetchRepoError | RepoTooLargeError | ProcessDeleteError | ProcessCreateError | RedisCacheSetError | RedisCacheFetchError | ProcessEventError | DBError | UserNotFoundError | HandleResolutionError | InvalidMirrorStatus


export class InvalidMirrorStatus {
    readonly _tag = "InvalidMirrorStatus"
    constructor(readonly status?: string) {}
}


export class FetchRepoError {
    readonly _tag = "FetchRepoError"
}


export class ProcessEventError {
    readonly _tag = "ProcessEventError"
}


const maxRepoMBs = env.MAX_REPO_MBS

export const allCollections = [
    "app.bsky.feed.post",
    "app.bsky.feed.like",
    "app.bsky.feed.repost",
    "app.bsky.graph.follow",
    "app.bsky.actor.profile",
    "ar.cabildoabierto.feed.article",
    "ar.cabildoabierto.wiki.topicVersion",
    "ar.cabildoabierto.data.dataset",
    "ar.cabildoabierto.wiki.voteAccept",
    "ar.cabildoabierto.wiki.voteReject",
    "ar.cabildoabierto.actor.caProfile",
    "ar.com.cabildoabierto.profile"
]

export type UserRepo = Map<string, RefAndRecord[]>

type PresentRecords = Map<string, {cid: string | null, hasRecord: boolean}>


function getPresentRecords(
    ctx: AppContext,
    did: string,
    collections: string[]
): Effect.Effect<PresentRecords, DBError> {
    return Effect.gen(function* () {
        const refs = yield* Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("Record")
                .select([
                    "uri",
                    "cid",
                    eb => eb("record", "is not", null).as("hasRecord")
                ])
                .where("authorId", "=", did)
                .where("collection", "in", collections)
                .execute(),
            catch: () => new DBError()
        })

        const presentRecords: PresentRecords = new Map()
        for(const r of refs) {
            presentRecords.set(r.uri, {
                cid: r.cid,
                hasRecord: !!(r.hasRecord)
            })
        }

        return presentRecords
    })
}


function updateHandle(
    ctx: AppContext,
    did: string
): Effect.Effect<void, HandleResolutionError | UserNotFoundError> {
    return Effect.gen(function* () {
        const handle = yield* ctx.resolver.resolveDidToHandle(did, false)
        if(!handle) return yield* Effect.fail(new UserNotFoundError())
        yield* Effect.tryPromise({
            try: () => ctx.kysely
                .updateTable("User")
                .set("handle", handle)
                .where("did", "=", did)
                .execute(),
            catch: () => new UserNotFoundError()
        })
    })
}


function docToUrl(doc: string, did: string): string {
    return doc + "/xrpc/com.atproto.sync.getRepo?did=" + did
}


function maxRepoBytes(): number {
    return maxRepoMBs * 1024 * 1024
}


function recordRequiresUpdate(
    presentRecords: PresentRecords,
    ref: ATProtoStrongRef
): boolean {
    const res = presentRecords.get(ref.uri)
    const recordOk = !!res && res.cid == ref.cid && res.hasRecord
    return !recordOk
}


function cleanOutdatedInDB(
    ctx: AppContext,
    presentRecords: PresentRecords,
    repoSkeleton: ATProtoStrongRef[]
): Effect.Effect<void, ProcessDeleteError> {
    const repoSkeletonUris = new Set(repoSkeleton.map(x => x.uri))
    const toDelete: string[] = []

    for(const [uri] of presentRecords.entries()) {
        if(!repoSkeletonUris.has(uri)) {
            toDelete.push(uri)
        }
    }

    return batchDeleteRecords(ctx, toDelete)
}


function processRepoBatch(
    ctx: AppContext,
    collections: string[],
    batch: UserRepo
): Effect.Effect<void, ProcessCreateError> {
    return Effect.gen(function* () {
        for (const collection of collections) {
            const records: RefAndRecord[] = batch.get(collection) ?? []
            if(records.length == 0) {
                continue
            }

            yield* getRecordProcessor(ctx, collection).processInBatches(records)
        }
    })
}


function processRepo(
    ctx: AppContext,
    did: string,
    doc: string,
    collections: string[],
    presentRecords: PresentRecords
): Effect.Effect<void, FetchRepoError | ProcessCreateError | ProcessDeleteError | RepoTooLargeError> {
    const collectionsSet = new Set(collections)
    const url = docToUrl(doc, did)
    const maxBytes = maxRepoBytes()

    return Effect.gen(function* () {
        const res = yield* Effect.tryPromise({
            try: () => fetch(url),
            catch: () => new FetchRepoError()
        })

        if (!res.ok) return yield* Effect.fail(new FetchRepoError())

        const stream = res.body
        if (!stream) return yield* Effect.fail(new FetchRepoError())

        const reader = stream.getReader()
        let receivedBytes = 0;
        const limitedStream = new ReadableStream({
            async start(controller) {
                while (true) {
                    const {done, value} = await reader.read();
                    if (done) break;

                    receivedBytes += value.byteLength;
                    if (receivedBytes > maxBytes) {
                        ctx.logger.pino.info(`${did} exceeded maximum size of ${maxRepoMBs} MBs (${receivedBytes / (1024 * 1024)}mbs received)`)
                        controller.error(
                            new Error(`Repo exceeded maximum size of ${maxRepoMBs} MB`)
                        )
                        return
                    }

                    controller.enqueue(value)
                }
                controller.close()
            }
        })

        const repoSkeleton: ATProtoStrongRef[] = []
        const repoReader = RepoReader.fromStream(limitedStream);

        const iterator = repoReader[Symbol.asyncIterator]()

        let repoBatch: UserRepo = new Map(collections.map(c => ([c, []])))
        const batchSize = 5000
        let batchCount = 0

        while(true) {
            const res = yield* Effect.tryPromise({
                try: () => iterator.next(),
                catch: () => new RepoTooLargeError()
            })
            if(res.done) break
            const {collection, rkey, record, cid} = res.value

            const uri = getUri(did, collection, rkey);
            if (collectionsSet.has(collection)) {
                const cur = repoBatch.get(collection)
                const e: RefAndRecord = {ref: {uri, cid: cid.$link}, record}
                repoSkeleton.push({uri, cid: cid.$link})

                if (recordRequiresUpdate(presentRecords, e.ref)) {
                    if (!cur) {
                        repoBatch.set(collection, [e])
                    } else {
                        cur.push(e)
                    }
                    batchCount++
                }
            }

            if (batchCount == batchSize) {
                yield* processRepoBatch(ctx, collections, repoBatch)
                batchCount = 0
                for (const c of collections) {
                    const cur = repoBatch.get(c)
                    if (cur) {
                        cur.splice(0, cur.length)
                    }
                }
            }
        }

        if (batchCount > 0) {
            yield* processRepoBatch(ctx, collections, repoBatch)
        }

        yield* cleanOutdatedInDB(ctx, presentRecords, repoSkeleton)

        return
    })
}


function processPendingEvents(
    ctx: AppContext,
    did: string
): Effect.Effect<void, ProcessEventError | RedisCacheFetchError> {
    return Effect.gen(function* () {
        while(true){
            const pending = yield* getPendingEvents(ctx, did)
            if(pending.length == 0) break
            yield* Effect.tryPromise({
                try: () => processEventsBatch(ctx, pending),
                catch: () => new ProcessEventError()
            })
        }
    })
}


function isCAUser(ctx: AppContext, did: string): Effect.Effect<boolean, UserNotFoundError | DBError> {
    return Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("User")
            .select("inCA")
            .where("did", "=", did)
            .executeTakeFirst(),
        catch: () => new DBError()
    }).pipe(Effect.flatMap(res => {
        return res == null ? Effect.fail(new UserNotFoundError()) : Effect.succeed(!!(res && res.inCA))
    }))
}


export const syncUser = (
    ctx: AppContext,
    did: string,
    collections?: string[]
): Effect.Effect<void, SyncError> => {
    const normalizedCollections = collections
        ? collections.map(shortCollectionToCollection)
        : allCollections

    return Effect.gen(function* () {
        const inCA = yield* isCAUser(ctx, did)

        const mirrorStatus = yield* ctx.redisCache.mirrorStatus.get(did, inCA)
        yield* Effect.annotateCurrentSpan({inCA, mirrorStatus})

        if(mirrorStatus != "InProcess") return yield* Effect.fail(new InvalidMirrorStatus(mirrorStatus))

        const doc = yield* getServiceEndpointForDid(ctx, did)

        const presentRecords = yield* getPresentRecords(ctx, did, normalizedCollections)

        yield* processRepo(ctx, did, doc, normalizedCollections, presentRecords)

        yield* processPendingEvents(ctx, did)

        yield* updateHandle(ctx, did)

        yield* ctx.redisCache.mirrorStatus.set(did, "Sync", inCA)
    }).pipe(
        Effect.catchAll(error => {
            return isCAUser(ctx, did).pipe(
                Effect.flatMap(inCA => ctx.redisCache.mirrorStatus.set(did, "Failed", inCA).pipe(Effect.flatMap(() => Effect.void)))
            ).pipe(Effect.tap(Effect.annotateCurrentSpan({result: "failed", errorTag: error._tag})))
        }),
        Effect.withSpan("runSync", {
            attributes: {
                did
            }
        })
    )
}


export async function getUserRepo(ctx: AppContext, did: string, doc: string, collections: string[]): Promise<{repo?: UserRepo, error?: string}> {
    const url = doc + "/xrpc/com.atproto.sync.getRepo?did=" + did

    ctx.logger.pino.info(`${did} fetch started from ${url}`)
    const res = await fetch(url)

    const collectionsSet = new Set(collections)

    if (res.ok) {
        const stream = res.body
        if(!stream){
            return { error: 'no body in response' }
        }

        const reader = stream.getReader()
        let receivedBytes = 0;
        const maxBytes = maxRepoMBs * 1024 * 1024; // convert MB -> bytes

        const limitedStream = new ReadableStream({
            async start(controller) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    receivedBytes += value.byteLength;
                    if (receivedBytes > maxBytes) {
                        controller.error(
                            new Error(`Repo exceeded maximum size of ${maxRepoMBs} MB`)
                        );
                        return;
                    }

                    controller.enqueue(value);
                }
                controller.close();
            },
        });

        const repo: UserRepo = new Map()
        try {
            const repoReader = RepoReader.fromStream(limitedStream);

            for await (const { collection, rkey, record, cid } of repoReader) {
                const uri = getUri(did, collection, rkey);
                if (collectionsSet.has(collection)) {
                    const cur = repo.get(collection)
                    const e = { ref: {uri, cid: cid.$link}, record }
                    if(!cur) {
                        repo.set(collection, [e])
                    } else {
                        cur.push(e)
                    }
                }
            }

            ctx.logger.pino.info({receivedBytes, did}, `finished fetching repo`)

            return { repo };
        } catch {
            ctx.logger.pino.error("Error reading repo (probably too large)");
            return { error: "too large" }
        }
    } else {
        ctx.logger.pino.error(`${did} repo fetch error`)
        return {error: "fetch error"}
    }
}


function getPendingEvents(ctx: AppContext, did: string): Effect.Effect<JetstreamEvent[], RedisCacheFetchError> {
    const redis = ctx.ioredis
    const key = pendingSyncEventsKey(ctx, did)

    return Effect.gen(function* () {
        const res = yield* Effect.tryPromise({
            try: () => redis
                .multi()
                .lrange(key, 0, -1)
                .del(key)
                .exec(),
            catch: () => new RedisCacheFetchError()
        })

        if(!res) return []

        const items = res[0]

        return (items[1] as string[]).map(item => {
            try {
                return JSON.parse(item) as JetstreamEvent
            } catch {
                return null
            }
        }).filter((x): x is JetstreamEvent => x !== null)
    })
}


function pendingSyncEventsKey(ctx: AppContext, did: string) {
    return `${ctx.mirrorId}:pending-sync-events:${did}`
}


export async function addPendingEvent(ctx: AppContext, did: string, e: JetstreamEvent) {
    const key = pendingSyncEventsKey(ctx, did)
    await ctx.ioredis.rpush(key, JSON.stringify(e))
}


export function syncUserJobHandler(ctx: AppContext, data: {
    handleOrDid?: string
    did?: string
    collectionsMustUpdate?: string[]
}): Effect.Effect<void, UserNotFoundError | SyncError> {
    const handleOrDid = data.handleOrDid ?? data.did
    return Effect.gen(function* () {
        if (!handleOrDid) return yield* Effect.fail(new UserNotFoundError())
        const did = yield* dbHandleToDid(ctx, handleOrDid)
        if (did) {
            yield* syncUser(ctx, did, data.collectionsMustUpdate)
        } else {
            return yield* Effect.fail(new UserNotFoundError())
        }
    }).pipe(Effect.withSpan("syncUserJobHandler", {
        attributes: {handleOrDid: handleOrDid ?? ""}
    }))
}


export const syncUserHandler: EffHandler<{
    params: { handleOrDid: string },
    query: { c: string[] | string | undefined }
}, {}> = (ctx, agent, {params, query}) => {
    const {handleOrDid} = params
    const {c} = query

    return Effect.gen(function* () {
        const did = yield* handleOrDidToDid(ctx, handleOrDid)

        const inCA = yield* isCAUser(ctx, did)
        yield* Effect.annotateCurrentSpan({inCA})

        yield* ctx.redisCache.mirrorStatus.set(did, "InProcess", inCA)

        if(ctx.worker) {
            yield* ctx.worker.addJob("sync-user", {
                handleOrDid,
                collectionsMustUpdate: c ? (typeof c == "string" ? [c] : c) : undefined
            })
        }

        return {}
    }).pipe(
        Effect.catchTag("AddJobsError", () => Effect.fail("Ocurrió un error al agregar un trabajo.")),
        Effect.catchTag("HandleResolutionError", () => Effect.fail("Ocurrió un error al resolver el handle.")),
        Effect.catchTag("DBError", () => Effect.fail("Ocurrió un error en la base de datos.")),
        Effect.catchTag("UserNotFoundError", () => Effect.fail("No se encontró el usuario.")),
        Effect.catchTag("RedisCacheSetError", () => Effect.fail("Ocurrió un error con la cache.")),
        Effect.withSpan("syncUserHandler", {
            attributes: {handleOrDid}
        })
    )
}


export const syncHandler: EffHandler<{}, {}> = (ctx, agent) => {
    const did = agent.did

    return Effect.gen(function* () {
        const status = yield* ctx.redisCache.mirrorStatus.get(did, true)
        if(status == "Failed - Too Large") {
            return yield* Effect.fail("Tu repositorio es demasiado grande. Escribinos a @cabildoabierto.ar.")
        } else if(status != "Failed") {
            return {}
        }

        yield* ctx.redisCache.mirrorStatus.set(did, "InProcess", true)

        if(!ctx.worker) return yield* Effect.fail(new AddJobError())

        yield* ctx.worker.addJob("sync-user", {
            did,
            collectionsMustUpdate: undefined
        })

        return {}
    }).pipe(
        Effect.catchAll( () => {
            return Effect.fail("Ocurrió un error al sincronizar la cuenta.")
        })
    )
}


export async function updateRecordsCreatedAt(ctx: AppContext) {
    let offset = 0
    const bs = 10000
    while(true){
        ctx.logger.pino.info({offset}, "updating records created at batch")

        const t1 = Date.now()
        const res = await ctx.kysely
            .selectFrom("Record")
            .select([
                "uri",
                "record"
            ])
            .limit(bs)
            .offset(offset)
            .orderBy("uri desc")
            .execute()
        const t2 = Date.now()

        const values: {uri: string, created_at: Date}[] = []
        res.forEach(r => {
            if(r.record){
                const record = JSON.parse(r.record)
                if(record.created_at){
                    values.push({
                        uri: r.uri,
                        created_at: record.created_at
                    })
                }
            }
        })

        ctx.logger.pino.info(`got ${res.length} results and ${values.length} values to update`)
        if(values.length > 0){
            await ctx.kysely
                .insertInto("Record")
                .values(values.map(v => ({
                    ...v,
                    collection: "",
                    rkey: "",
                    authorId: ""
                })))
                .onConflict(oc => oc.column("uri").doUpdateSet(eb => ({
                    created_at: eb.ref("excluded.created_at")
                })))
                .execute()
        }
        const t3 = Date.now()
        ctx.logger.logTimes("batch done in", [t1, t2, t3])

        offset += bs
        if(res.length < bs) break
    }
}