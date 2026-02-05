import {RedisCache, RedisCacheSetError} from "#/services/redis/cache.js";
import {AppContext, setupKysely, setupRedis, setupResolver} from "#/setup.js";
import {Logger} from "#/utils/logger.js";
import {AppBskyActorProfile, AppBskyFeedLike, AppBskyFeedRepost, AppBskyGraphFollow} from "@atproto/api";
import {deleteUser} from "#/services/delete.js";
import {sql} from "kysely";
import {BaseAgent, bskyPublicAPI, SessionAgent} from "#/utils/session-agent.js";
import {env} from "#/lib/env.js";
import {AppBskyFeedPost, AtpBaseClient} from "@atproto/api";
import {RefAndRecord} from "#/services/sync/types.js";
import {getRecordProcessor, ProcessDeleteError} from "#/services/sync/event-processing/get-record-processor.js";
import {getCollectionFromUri, getUri} from "@cabildo-abierto/utils";
import {CAWorker, JobToAdd} from "#/jobs/worker.js";
import {randomBytes} from "crypto";
import * as path from 'path';
import { sha256 } from 'multiformats/hashes/sha2'
import { encode, code } from '@ipld/dag-cbor'
import {
    ArCabildoabiertoActorCaProfile,
    ArCabildoabiertoWikiVoteReject,
    ArCabildoabiertoFeedArticle,
    ArCabildoabiertoWikiVoteAccept,
    ArCabildoabiertoWikiTopicVersion,
    ATProtoStrongRef
} from "@cabildo-abierto/api";
import {BlobRef} from "@atproto/lexicon";
import {CID} from "multiformats/cid";
import {getBlobKey} from "#/services/hydration/dataplane.js";
import {getDeleteProcessor} from "#/services/sync/event-processing/get-delete-processor.js";
import {Effect} from "effect";
import {ProcessCreateError} from "#/services/sync/event-processing/record-processor.js";

import {DBSelectError} from "#/utils/errors.js";

export const testTimeout = 40000

export function generateRkey(): string {
    return `${Date.now()}${Math.random().toString(36).substring(2, 7)}`;
}


class GenerateCIDError {
    readonly _tag = "GenerateCIDError"
}


export const generateCid = (data: any): Effect.Effect<string, GenerateCIDError> => Effect.gen(function* () {
    const bytes = encode({data: JSON.stringify(data), date: new Date().toISOString()})

    const hash = sha256.digest(bytes)

    const cid = CID.createV1(code, hash)

    return cid.toString()
})


export function generateUserDid(testSuite: string) {
    const DID_PLC_CHARS = 'abcdefghijklmnopqrstuvwxyz234567';
    const ID_LENGTH = 24;

    const randomValues = randomBytes(ID_LENGTH);
    let idPart = '';

    for (let i = 0; i < ID_LENGTH; i++) {
        // Use the random byte to pick a character from the set.
        idPart += DID_PLC_CHARS[randomValues[i] % DID_PLC_CHARS.length];
    }

    return `did:plc:${testSuite}:${idPart}`;
}


function getCAProfileRefAndRecord(did: string, testSuite: string): Effect.Effect<RefAndRecord<ArCabildoabiertoActorCaProfile.Record>, GenerateCIDError> {
    const record: ArCabildoabiertoActorCaProfile.Record = {
        $type: "ar.cabildoabierto.actor.caProfile",
        createdAt: new Date().toISOString()
    }

    return getRefAndRecord(
        record,
        testSuite,
        {
            did,
            collection: record.$type,
        }
    )
}


function getBskyProfileRefAndRecord(did: string, testSuite: string) {
    const record: AppBskyActorProfile.Record = {
        $type: "app.bsky.actor.profile",
        displayName: "Test",
        createdAt: new Date().toISOString()
    }

    return getRefAndRecord(
        record,
        testSuite,
        {
            did,
            collection: record.$type,
        }
    )
}


class RunJobError {
    readonly _tag = "RunJobError"
}


export const createTestUser = (
    ctx: AppContext,
    handle: string,
    testSuite: string
): Effect.Effect<string, RedisCacheSetError | GenerateCIDError | ProcessCreateError | RunJobError> => Effect.gen(function* () {
    const did = generateUserDid(testSuite)
    yield* Effect.tryPromise({
        try: () => ctx.redisCache.resolver.setHandle(did, handle),
        catch: () => new RedisCacheSetError()
    })
    const caProfile = yield* getCAProfileRefAndRecord(did, testSuite)
    const bskyProfile = yield* getBskyProfileRefAndRecord(did, testSuite)

    yield* processRecordsInTest(ctx, [caProfile, bskyProfile])
    return did
})


export async function createTestContext(): Promise<AppContext> {
    const ioredis = setupRedis(1)
    const logger = new Logger("test")
    const mirrorId = "test"
    const redisCache = new RedisCache(ioredis, mirrorId, logger)
    logger.pino.info({url: process.env.TEST_DB}, "setting up test db")
    const ctx: AppContext = {
        logger,
        kysely: setupKysely(process.env.TEST_DB, 2),
        ioredis,
        mirrorId,
        resolver: setupResolver(redisCache),
        redisCache,
        worker: new MockCAWorker(logger),
        storage: undefined,
        oauthClient: undefined
    }

    const result = await sql<{ dbName: string }>`SELECT current_database() as "dbName"`.execute(ctx.kysely);

    if(result.rows[0].dbName != "ca-sql-dev") throw Error(`Los tests deberían correrse sobre la base de datos de desarrollo! ${result.rows[0].dbName}`)

    return ctx
}


export const getRefAndRecord = <T>(record: T, testSuite: string, uri: {
    did?: string
    collection: string
    rkey?: string
}): Effect.Effect<RefAndRecord<T>, GenerateCIDError> => Effect.gen(function* () {
    const uriStr = getUri(
        uri?.did ?? generateUserDid(testSuite),
        uri.collection,
        uri?.rkey ?? generateRkey()
    )

    return {
        ref: {
            uri: uriStr,
            cid: yield* generateCid(record)
        },
        record
    }
})

export function getSuiteId(filename: string): string {
    return path.basename(filename, path.extname(filename))
        .replace(/[^a-zA-Z0-9]/g, '-') // Replace non-alphanumeric chars with a dash
        .toLowerCase();
}


export const getFollowRefAndRecord = (
    subject: string,
    testSuite: string,
    authorId?: string
) => Effect.gen(function* () {
    const record: AppBskyGraphFollow.Record = {
        $type: "app.bsky.graph.follow",
        subject,
        createdAt: new Date().toISOString()
    }

    return yield* getRefAndRecord(record, testSuite, {
        collection: "app.bsky.graph.follow",
        did: authorId
    })
})


export async function cleanUPTestDataFromDB(ctx: AppContext, testSuite: string) {
    const testUsers = await ctx.kysely
        .selectFrom("User")
        .select("did")
        .where("did", "ilike", `%${testSuite}%`)
        .execute()

    ctx.logger.pino.info({testUsers, testSuite}, "clearing test users")

    await Effect.runPromise(deleteUsersInTest(ctx, testUsers.map(t => t.did)))
}

export async function cleanUpAfterTests(ctx: AppContext) {
    ctx.ioredis.disconnect()
    ctx.kysely.destroy()
}



function getPostRecord(text: string = "hola!", created_at: Date = new Date(), replyTo?: ATProtoStrongRef): AppBskyFeedPost.Record {
    if(replyTo) {
        return {
            $type: "app.bsky.feed.post",
            createdAt: created_at.toISOString(),
            text,
            reply: {
                parent: replyTo,
                root: replyTo
            }
        }
    } else {
        return {
            $type: "app.bsky.feed.post",
            createdAt: created_at.toISOString(),
            text
        }
    }
}


export function getPostRefAndRecord(
    text: string = "hola!",
    created_at: Date = new Date(),
    testSuite: string,
    uri?: {
        did?: string
        rkey?: string
    },
    replyTo?: ATProtoStrongRef
) {
    const record = getPostRecord(
        text,
        created_at,
        replyTo
    )

    return getRefAndRecord(
        record,
        testSuite,
        {
            ...uri,
            collection: "app.bsky.feed.post"
        }
    )
}


const getArticleRecord = (
    ctx: AppContext,
    title: string,
    text: string,
    created_at: Date = new Date(),
    authorId: string
): Effect.Effect<ArCabildoabiertoFeedArticle.Record, RedisCacheSetError | GenerateCIDError> => Effect.gen(function* () {
    const cid = yield* generateCid(text)
    const mimeType = "text/plain"
    const blob = new BlobRef(
        CID.parse(cid),
        mimeType,
        text.length
    )
    yield* Effect.tryPromise({
        try: () => ctx.ioredis.set(getBlobKey({cid, authorId}), text),
        catch: () => new RedisCacheSetError()
    })
    return {
        $type: "ar.cabildoabierto.feed.article",
        createdAt: created_at.toISOString(),
        text: blob,
        format: "markdown",
        title
    }
})


export const getArticleRefAndRecord = (
    ctx: AppContext,
    title: string,
    text: string,
    created_at: Date = new Date(),
    testSuite: string,
    uri?: {
        did?: string
        rkey?: string
    },
) => Effect.gen(function* () {
    const authorId = uri?.did ?? generateUserDid(testSuite)
    const record = yield* getArticleRecord(
        ctx,
        title,
        text,
        created_at,
        authorId
    )

    return yield* getRefAndRecord(
        record,
        testSuite,
        {
            ...uri,
            did: authorId,
            collection: "ar.cabildoabierto.feed.article"
        }
    )
})


function getLikeRecord(ref: ATProtoStrongRef, created_at: Date = new Date()): AppBskyFeedLike.Record {
    return {
        $type: "app.bsky.feed.like",
        createdAt: created_at.toISOString(),
        subject: ref
    }
}

function getRepostRecord(ref: ATProtoStrongRef, created_at: Date = new Date()): AppBskyFeedRepost.Record {
    return {
        $type: "app.bsky.feed.repost",
        createdAt: created_at.toISOString(),
        subject: ref
    }
}


export function getRepostRefAndRecord(ref: ATProtoStrongRef, created_at: Date = new Date(), testSuite: string, authorId?: string) {
    const record = getRepostRecord(ref, created_at)

    return getRefAndRecord(
        record,
        testSuite,
        {
            did: authorId,
            collection: "app.bsky.feed.repost"
        }
    )
}




const getTopicVersionRecord = (
    ctx: AppContext,
    topicId: string,
    text: string,
    created_at: Date,
    authorId: string
): Effect.Effect<ArCabildoabiertoWikiTopicVersion.Record, GenerateCIDError | RedisCacheSetError> => Effect.gen(function* ()  {
    const cid = yield* generateCid(text)
    const mimeType = "text/plain"
    const blob = new BlobRef(
        CID.parse(cid),
        mimeType,
        text.length
    )

    yield* Effect.tryPromise({
        try: () => ctx.ioredis.set(getBlobKey({cid, authorId}), text),
        catch: () => new RedisCacheSetError()
    })

    return {
        $type: "ar.cabildoabierto.wiki.topicVersion",
        id: topicId,
        text: blob,
        format: "markdown",
        createdAt: created_at.toISOString(),
    }
})


export function getTopicVersionRefAndRecord(ctx: AppContext, topicId: string, text: string, created_at: Date, authorId: string, testSuite: string) {
    const record = getTopicVersionRecord(
        ctx,
        topicId,
        text,
        created_at,
        authorId
    )

    return record.pipe(Effect.flatMap(record => getRefAndRecord(
        record,
        testSuite,
        {
            did: authorId,
            collection: "ar.cabildoabierto.wiki.topicVersion"
        }
    )))
}


function getAcceptVoteRecord(ctx: AppContext, subjectRef: ATProtoStrongRef, created_at: Date): ArCabildoabiertoWikiVoteAccept.Record {
    return {
        $type: "ar.cabildoabierto.wiki.voteAccept",
        subject: subjectRef,
        createdAt: created_at.toISOString()
    }
}


export const getAcceptVoteRefAndRecord = (
    ctx: AppContext,
    subjectRef: ATProtoStrongRef,
    created_at: Date,
    authorId: string,
    testSuite: string
) => {
    const record = getAcceptVoteRecord(
        ctx,
        subjectRef,
        created_at
    )

    return getRefAndRecord(
        record,
        testSuite,
        {
            did: authorId,
            collection: "ar.cabildoabierto.wiki.voteAccept"
        }
    )
}


export const createTestAcceptVote = (
    ctx: AppContext,
    authorId: string,
    topicVersion: ATProtoStrongRef,
    testSuite: string) => Effect.gen(function* () {
    const vote = yield* getAcceptVoteRefAndRecord(
        ctx,
        topicVersion,
        new Date(),
        authorId,
        testSuite
    )
    yield* processRecordsInTest(ctx!, [vote])
    return vote
})


export function createTestTopicVersion(ctx: AppContext, authorId: string, testSuite: string): Effect.Effect<RefAndRecord<ArCabildoabiertoWikiTopicVersion.Main>, GenerateCIDError | ProcessCreateError | RunJobError | RedisCacheSetError> {
    return getTopicVersionRefAndRecord(
        ctx!,
        "tema de prueba",
        "texto",
        new Date(),
        authorId,
        testSuite
    ).pipe(Effect.tap(topicVersion => {
        return processRecordsInTest(ctx!, [topicVersion])
    }))
}


export const createTestRejectVote = (
    ctx: AppContext,
    authorId: string,
    topicVersion: ATProtoStrongRef,
    testSuite: string) => Effect.gen(function* () {
    const reasonPost = yield* getPostRefAndRecord(
        "prueba",
        new Date(),
        testSuite,
        {did: authorId},
        topicVersion
    )
    const vote = yield* getRejectVoteRefAndRecord(
        ctx,
        topicVersion,
        new Date(),
        authorId,
        reasonPost.ref,
        testSuite,
    )
    yield* processRecordsInTest(ctx!, [reasonPost])
    yield* processRecordsInTest(ctx!, [vote])
    return {reasonPost, vote}
})


function getRejectVoteRecord(
    ctx: AppContext,
    subjectRef: ATProtoStrongRef,
    created_at: Date,
    reasonRef: ATProtoStrongRef
): ArCabildoabiertoWikiVoteReject.Record {
    return {
        $type: "ar.cabildoabierto.wiki.voteReject",
        subject: subjectRef,
        createdAt: created_at.toISOString(),
        reason: reasonRef
    }
}


export function getRejectVoteRefAndRecord(
    ctx: AppContext,
    subjectRef: ATProtoStrongRef,
    created_at: Date,
    authorId: string,
    reasonRef: ATProtoStrongRef,
    testSuite: string
) {
    const record = getRejectVoteRecord(
        ctx,
        subjectRef,
        created_at,
        reasonRef
    )
    return getRefAndRecord(
        record,
        testSuite,
        {
            did: authorId,
            collection: "ar.cabildoabierto.wiki.voteReject"
        }
    )
}


export function getLikeRefAndRecord(ref: ATProtoStrongRef, created_at: Date = new Date(), testSuite: string) {
    const record = getLikeRecord(ref, created_at)

    return getRefAndRecord(
        record,
        testSuite,
        {
            collection: "app.bsky.feed.like"
        }
    )
}


export function deleteUsersInTest(ctx: AppContext, dids: string[]) {
    return Effect.all(dids.map(did => deleteUser(ctx, did)),
        {concurrency: 2}).pipe(
        Effect.flatMap(() => {
            return ctx.worker ?
                Effect.tryPromise({
                    try: () => ctx.worker!.runAllJobs(),
                    catch: () => "Error al correr los trabajos."
                })
                : Effect.void
        })
    )
}


export function processRecordsInTest(ctx: AppContext, records: RefAndRecord[]) {

    return Effect.all(
        records.map(r => {
            const processor = getRecordProcessor(ctx, getCollectionFromUri(r.ref.uri))
            return processor.process([r])
        }),
        {concurrency: 4}
    ).pipe(Effect.tap(
        Effect.tryPromise({
            try: () => ctx.worker.runAllJobs(),
            catch: () => new RunJobError()
        })
    ))
}


export const deleteRecordsInTest = (ctx: AppContext, records: string[]) => Effect.gen(function* () {
    yield* Effect.all(records.map(r => {
        const c = getCollectionFromUri(r)
        const processor = getDeleteProcessor(ctx, c)
        return Effect.tryPromise({
            try: () => processor.process([r]),
            catch: () => new ProcessDeleteError(c)
        })
    }), {concurrency: 4})
    yield* Effect.tryPromise({
        try: () => ctx!.worker?.runAllJobs(), // TO DO: Pasar a Effect
        catch: () => "Error al correr los trabajos."
    })
})


export async function getRecord(ctx: AppContext, uri: string){
    return await ctx.kysely
        .selectFrom("Record")
        .where("Record.uri", "=", uri)
        .selectAll()
        .executeTakeFirst()
}


export class MockSessionAgent extends BaseAgent {
    did: string
    constructor(did: string){
        const CAAgent = new AtpBaseClient(`${env.HOST}:${env.PORT}`)
        super(CAAgent, new AtpBaseClient(bskyPublicAPI))
        this.did = did
    }

    hasSession(): this is SessionAgent {
        return true
    }
}



export class MockCAWorker extends CAWorker {
    queue: {
        name: string
        priority: number
        data: any
    }[] = []

    addJob(name: string, data: any, priority: number = 10) {
        this.logger.pino.info({name}, "job added")

        this.queue.push({
            name,
            priority,
            data,
        })

        return Effect.void
    }

    addJobs(jobs: JobToAdd[]) {
        return Effect.all(jobs.map(j => this.addJob(j.label, j.data, j.priority)), {concurrency: "unbounded"})
    }

    async runAllJobs() {
        while (this.queue.length > 0) {
            const job = this.queue.shift()
            if(job) {
                await this.runJob(job.name, job.data)
            }
        }
    }

    async batchJobs() {
    }

    async removeAllRepeatingJobs() {
    }

    async waitUntilReady() {
    }

    async logState() {
    }

    async addRepeatingJob(name: string, every: number, delay: number, priority: number = 10) {
    }

    async clear() {
        this.queue = []
    }
}


export function checkRecordExists(ctx: AppContext, uri: string) {
    return Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("Record")
            .where("uri", "=", uri).select("uri")
            .executeTakeFirst().then(x => x != null),
        catch: () => new DBSelectError("Record")
    })
}


export function checkIsFollowing(ctx: AppContext, follower: string, subject: string) {
    return Effect.tryPromise({
        try: () => ctx!.kysely
            .selectFrom("Follow")
            .innerJoin("Record", "Record.uri", "Follow.uri")
            .where("Record.authorId", "=", follower)
            .where("Follow.userFollowedId", "=", subject)
            .selectAll()
            .executeTakeFirst().then(x => x != null),
        catch: () => new DBSelectError("Follow")
    })
}


export function checkContentInFollowingFeed(ctx: AppContext, uri: string, follower: string) {
    return Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("FollowingFeedIndex")
            .select("contentId")
            .where("contentId", "=", uri)
            .where("readerId", "=", follower)
            .executeTakeFirst().then(x => x != null),
        catch: () => new DBSelectError("FollowingFeedIndex")
    })
}