import {AppContext} from "#/setup.js";
import {dbHandleToDid, getCAUsersDids, handleToDid} from "#/services/user/users.js";
import {ATProtoStrongRef, JetstreamEvent} from "#/lib/types.js";
import {RepoReader} from "@atcute/car/v4"
import {getServiceEndpointForDid} from "#/services/blob.js";
import {getUri, shortCollectionToCollection} from "@cabildo-abierto/utils";
import {CAHandler} from "#/utils/handler.js";
import {processEventsBatch} from "#/services/sync/event-processing/event-processor.js";
import {batchDeleteRecords, getRecordProcessor} from "#/services/sync/event-processing/get-record-processor.js";
import {RefAndRecord} from "#/services/sync/types.js";
import {env} from "#/lib/env.js";


export async function syncAllUsers(ctx: AppContext, mustUpdateCollections?: string[]) {
    let users = await getCAUsersDids(ctx)

    for (let i = 0; i < users.length; i++) {
        ctx.logger.pino.info(`Syncing user ${i+1} of ${users.length} (did: ${users[i]})`)
        await ctx.redisCache.mirrorStatus.set(users[i], "InProcess", true)
        await syncUser(ctx, users[i], mustUpdateCollections)
    }
}


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


export class RepoSync {
    did: string
    ctx: AppContext
    collections: string[]
    presentRecords: Map<string, {cid: string | null, hasRecord: boolean}> = new Map()

    constructor(ctx: AppContext, did: string, collections?: string[]) {
        this.ctx = ctx
        this.did = did
        this.collections = collections ? collections.map(shortCollectionToCollection) : allCollections
    }

    async run() {
        const did = this.did
        const ctx = this.ctx
        ctx.logger.pino.info(`${did} sync started ***************`)

        const t1 = Date.now()
        const inCA = await isCAUser(ctx, did)
        ctx.logger.pino.info(`${did} inCA: ${inCA}`)

        const t2 = Date.now()
        const mirrorStatus = await ctx.redisCache.mirrorStatus.get(did, inCA)
        if(mirrorStatus != "InProcess") {
            ctx.logger.pino.info(`${did} status is not InProcess: ${mirrorStatus}. Not syncing.`)
            return
        }

        ctx.logger.pino.info(`${did} collections to sync: ${this.collections.join(", ")}`)

        const t3 = Date.now()
        const doc = await getServiceEndpointForDid(ctx, did)
        if (typeof doc != "string") {
            await ctx.redisCache.mirrorStatus.set(did, "Failed", inCA)
            return
        }

        const t4 = Date.now()
        await this.getPresentRecords()
        const t5 = Date.now()

        const {error} = await this.processRepo(doc)
        if(error) {
            ctx.logger.pino.info(`${did} process repo failed`)
            if(error == "too large"){
                await ctx.redisCache.mirrorStatus.set(did, "Failed - Too Large", inCA)
            } else {
                await ctx.redisCache.mirrorStatus.set(did, "Failed", inCA)
            }
            return
        }

        const t6 = Date.now()
        await this.processPendingEvents()

        await this.updateHandle()

        const t7 = Date.now()
        await ctx.redisCache.mirrorStatus.set(did, "Sync", inCA)
        ctx.logger.logTimes(`${did} sync done`, [t1, t2, t3, t4, t5, t6, t7])
    }

    async updateHandle() {
        const handle = await this.ctx.resolver.resolveDidToHandle(this.did, false)
        await this.ctx.kysely
            .updateTable("User")
            .set("handle", handle)
            .where("did", "=", this.did)
            .execute()
    }

    async getPresentRecords() {
        const refs = await this.ctx.kysely
            .selectFrom("Record")
            .select([
                "uri",
                "cid",
                eb => eb("record", "is not", null).as("hasRecord")
            ])
            .where("authorId", "=", this.did)
            .where("collection", "in", this.collections)
            .execute()
        for(const r of refs) {
            this.presentRecords.set(r.uri, {
                cid: r.cid,
                hasRecord: !!(r.hasRecord)
            })
        }
    }

    docToUrl(doc: string){
        return doc + "/xrpc/com.atproto.sync.getRepo?did=" + this.did
    }

    maxRepoBytes() {
        return maxRepoMBs * 1024 * 1024
    }

    async processRepo(doc: string): Promise<{error?: string}> {
        const did = this.did
        const ctx = this.ctx
        const collections = this.collections
        const collectionsSet = new Set(collections)
        const url = this.docToUrl(doc)

        ctx.logger.pino.info(`${did} fetch started from ${url}`)
        const res = await fetch(url)

        if(!res.ok){
            ctx.logger.pino.error(`${did} repo fetch error`)
            return {error: "fetch error"}
        }

        const stream = res.body
        if(!stream){
            return { error: 'no body in response' }
        }

        const reader = stream.getReader()
        let receivedBytes = 0;
        const maxBytes = this.maxRepoBytes()

        const limitedStream = new ReadableStream({
            async start(controller) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    receivedBytes += value.byteLength;
                    if (receivedBytes > maxBytes) {
                        ctx.logger.pino.info(`${did} exceeded maximum size of ${maxRepoMBs} MBs (${receivedBytes / (1024 * 1024)}mbs received)`)
                        controller.error(
                            new Error(`Repo exceeded maximum size of ${maxRepoMBs} MB`)
                        );
                        return;
                    }

                    controller.enqueue(value);
                }
                controller.close();
            },
        })

        const repoSkeleton: ATProtoStrongRef[] = []
        try {
            const repoReader = RepoReader.fromStream(limitedStream);

            let repoBatch: UserRepo = new Map(this.collections.map(c => ([c, []])))
            const batchSize = 5000
            let batchCount = 0
            for await (const { collection, rkey, record, cid } of repoReader) {
                const uri = getUri(did, collection, rkey);
                if (collectionsSet.has(collection)) {
                    const cur = repoBatch.get(collection)
                    const e: RefAndRecord = { ref: {uri, cid: cid.$link}, record }
                    repoSkeleton.push({uri, cid: cid.$link})

                    if(this.recordRequiresUpdate(e.ref)){
                        if(!cur) {
                            repoBatch.set(collection, [e])
                        } else {
                            cur.push(e)
                        }
                        batchCount ++
                    }
                }

                if(batchCount == batchSize){
                    ctx.logger.pino.info({batchCount, batchSize}, "sending process batch")
                    await this.processRepoBatch(repoBatch)
                    batchCount = 0
                    for(const c of this.collections) {
                        const cur = repoBatch.get(c)
                        if(cur) {
                            cur.splice(0, cur.length)
                        }
                    }
                }
            }

            if(batchCount > 0){
                ctx.logger.pino.info({batchCount, batchSize}, "sending process batch end")
                await this.processRepoBatch(repoBatch)
            }

            ctx.logger.pino.info(`${did} finished fetching repo with size ${receivedBytes}`)
        } catch (err: any) {
            ctx.logger.pino.error(err, `Error reading repo: ${err.message}`);
            return { error: "too large" }
        }

        await this.cleanOutdatedInDB(repoSkeleton)

        return {}
    }

    async cleanOutdatedInDB(repoSkeleton: ATProtoStrongRef[]) {
        this.ctx.logger.pino.info(`${this.did} cleaning outdated in db with repo skeleton length ${repoSkeleton.length}`)
        const t1 = Date.now()

        const repoSkeletonUris = new Set(repoSkeleton.map(x => x.uri))
        const toDelete: string[] = []
        for(const [uri] of this.presentRecords.entries()) {
            if(!repoSkeletonUris.has(uri)) {
                toDelete.push(uri)
            }
        }

        this.ctx.logger.pino.info(`${this.did} db records to delete ${toDelete.length}`)

        const t2 = Date.now()
        await batchDeleteRecords(
            this.ctx,
            toDelete)
        const t3 = Date.now()
        this.ctx.logger.logTimes(`${this.did} cleaning outdated in db done:`, [t1, t2, t3])
    }

    recordRequiresUpdate(ref: ATProtoStrongRef) {
        const res = this.presentRecords.get(ref.uri)
        const recordOk = !!res && res.cid == ref.cid && res.hasRecord
        return !recordOk
    }

    async processRepoBatch(batch: UserRepo) {
        const t1 = Date.now()
        this.ctx.logger.pino.info({size: batch.size}, "processing repo batch")

        for (const collection of this.collections) {
            const records: RefAndRecord[] = batch.get(collection) ?? []
            if(records.length == 0) {
                this.ctx.logger.pino.info({collection}, "empty collection")
                continue
            }

            this.ctx.logger.pino.info(`${this.did} processing collection ${collection} (${records.length} records).`)
            const t1 = Date.now()
            await getRecordProcessor(this.ctx, collection).processInBatches(records)
            this.ctx.logger.pino.info(`${collection} done after ${Date.now() - t1} ms.`)
        }
        const t2 = Date.now()

        this.ctx.logger.logTimes(`${this.did} process batch done`, [t1, t2])
        return {}
    }

    async processPendingEvents() {
        const ctx = this.ctx
        const did = this.did
        while(true){
            const pending = await getPendingEvents(ctx, did)
            if(pending.length == 0) break
            this.ctx.logger.pino.info({did, total: pending.length}, `processing pending events`)
            await processEventsBatch(ctx, pending)
        }
    }
}

const maxRepoMBs = env.MAX_REPO_MBS


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


async function getPendingEvents(ctx: AppContext, did: string): Promise<JetstreamEvent[]> {
    const redis = ctx.ioredis
    const key = pendingSyncEventsKey(ctx, did)

    const res = await redis
        .multi()
        .lrange(key, 0, -1)
        .del(key)
        .exec()

    if(!res) return []

    const items = res[0]

    return (items[1] as string[]).map(item => {
        try {
            return JSON.parse(item) as JetstreamEvent
        } catch (err) {
            ctx.logger.pino.warn({ err, item }, 'Failed to parse pending event')
            return null
        }
    }).filter((x): x is JetstreamEvent => x !== null)
}


function pendingSyncEventsKey(ctx: AppContext, did: string) {
    return `${ctx.mirrorId}:pending-sync-events:${did}`
}


export async function addPendingEvent(ctx: AppContext, did: string, e: JetstreamEvent) {
    const key = pendingSyncEventsKey(ctx, did)
    await ctx.ioredis.rpush(key, JSON.stringify(e))
}


async function isCAUser(ctx: AppContext, did: string) {
    const res = await ctx.kysely
        .selectFrom("User")
        .select("inCA")
        .where("did", "=", did)
        .executeTakeFirst()
    return !!(res && res.inCA)
}


export async function syncUser(ctx: AppContext, did: string, collections?: string[]) {
    const sync = new RepoSync(ctx, did, collections)
    await sync.run()
}


export async function syncUserJobHandler(ctx: AppContext, data: {
    handleOrDid: string,
    collectionsMustUpdate?: string[]
}) {
    const {handleOrDid, collectionsMustUpdate} = data
    const did = await dbHandleToDid(ctx, handleOrDid)
    if (did) {
        await syncUser(ctx, did, collectionsMustUpdate)
    } else {
        ctx.logger.pino.warn({handleOrDid}, "user to sync not found in db")
    }
}


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


export const syncUserHandler: CAHandler<{
    params: { handleOrDid: string },
    query: { c: string[] | string | undefined }
}, {}> = async (ctx, agent, {params, query}) => {
    const {handleOrDid} = params
    const {c} = query

    const did = await handleToDid(ctx, agent, handleOrDid)
    if(!did) return {error: "No se pudo obtener el did."}

    const inCA = await isCAUser(ctx, did)

    await ctx.redisCache.mirrorStatus.set(did, "InProcess", inCA)

    await ctx.worker?.addJob("sync-user", {
        handleOrDid,
        collectionsMustUpdate: c ? (typeof c == "string" ? [c] : c) : undefined
    })

    return {data: {}}
}



export const syncHandler: CAHandler<{}, {}> = async (ctx, agent) => {
    const did = agent.did

    const status = await ctx.redisCache.mirrorStatus.get(did, true)
    if(status == "Failed - Too Large") {
        return {error: "Tu repositorio es demasiado grande. Escribinos a @cabildoabierto.ar."}
    } else if(status != "Failed") {
        return {data: {}}
    }

    await ctx.redisCache.mirrorStatus.set(did, "InProcess", true)

    await ctx.worker?.addJob("sync-user", {
        did,
        collectionsMustUpdate: undefined
    })

    return {data: {}}
}


export const syncAllUsersHandler: CAHandler<{
    query: { c: string | string[] | undefined }
}, {}> = async (ctx, agent, {query}) => {
    const data = {collectionsMustUpdate: query.c ? (typeof query.c == "string" ? [query.c] : query.c) : []}
    await ctx.worker?.addJob("sync-all-users", data)
    ctx.logger.pino.info({data}, "Added sync all users to queue")
    return {data: {}}
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