import {RedisCache, RedisCacheSetError} from "#/services/redis/cache.js";
import {AppContext, setupKysely, setupRedis, setupResolver} from "#/setup.js";
import {Logger} from "#/utils/logger.js";
import {AppBskyActorProfile, AppBskyFeedLike, AppBskyFeedRepost, AppBskyGraphFollow} from "@atproto/api";
import {deleteUsers} from "#/services/delete.js";
import {sql} from "kysely";
import {BaseAgent, bskyPublicAPI, SessionAgent} from "#/utils/session-agent.js";
import {env} from "#/lib/env.js";
import {AppBskyFeedPost, AtpBaseClient} from "@atproto/api";
import {RefAndRecord} from "#/services/sync/types.js";
import {getRecordProcessor} from "#/services/sync/event-processing/get-record-processor.js";
import {getCollectionFromUri, getUri} from "@cabildo-abierto/utils";
import {CAWorker, JobToAdd} from "#/jobs/worker.js";
import {randomBytes} from "crypto";
import * as path from 'path';
import { sha256 } from 'multiformats/hashes/sha2'
import { encode, code } from '@ipld/dag-cbor'
import {
    ArCabildoabiertoActorCaProfile,
    ArCabildoabiertoWikiTopic,
    ArCabildoabiertoWikiVote,
    ATProtoStrongRef
} from "@cabildo-abierto/api";
import {BlobRef} from "@atproto/lexicon";
import {CID} from "multiformats/cid";
import {getBlobKey} from "#/services/hydration/dataplane.js";
import {Effect} from "effect";
import {ProcessCreateError, processInBatches} from "#/services/record/processing.js";

import {DBDeleteError, DBInsertError, DBSelectError} from "#/utils/errors.js";
import {CIDEncodeError} from "#/services/write/topic.js";
import {processDeletes} from "#/services/sync/event-processing/delete-processor.js";

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
): Effect.Effect<string, CIDEncodeError | DBInsertError | RedisCacheSetError | GenerateCIDError | ProcessCreateError | RunJobError> => Effect.gen(function* () {
    const did = generateUserDid(testSuite)
    yield* Effect.tryPromise({
        try: () => ctx.redisCache.resolver.setHandle(did, handle),
        catch: () => new RedisCacheSetError()
    })

    yield* Effect.tryPromise({
        try: () => ctx.kysely.insertInto("User")
            .values([{
                did,
                createdAt: new Date(),
                handle,
                hasAccess: true,
                inCA: true
            }])
            .execute(),
        catch: (error) => new DBInsertError(error)
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

    await ctx.worker.setup(ctx)

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


export async function cleanUpTestDataFromDB(ctx: AppContext, testSuite: string) {
    const [testUsers, allUsers] = await Promise.all([
        ctx.kysely
        .selectFrom("User")
        .select("did")
        .where("did", "ilike", `%${testSuite}%`)
        .execute(),
        ctx.kysely
            .selectFrom("User")
            .select("did")
            .execute()
    ])
    ctx.logger.pino.info({testUsers, allUsers}, "cleaning up test data")

    await Effect.runPromise(deleteUsersInTest(ctx, testUsers.map(t => t.did)))
    await Effect.runPromise(deleteEmptyTopics(ctx))
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
    authorId: string,
    props?: ArCabildoabiertoWikiTopic.TopicProp[]
): Effect.Effect<ArCabildoabiertoWikiTopic.Record, GenerateCIDError | RedisCacheSetError> => Effect.gen(function* ()  {
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
        $type: "ar.cabildoabierto.wiki.topic",
        id: topicId,
        text: blob,
        format: "markdown",
        createdAt: created_at.toISOString(),
        ...(props && props.length > 0 && { props }),
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


/** Creates a topic version with synonyms for testing mentions detection. */
export function getTopicVersionRefAndRecordWithSynonyms(
    ctx: AppContext,
    topicId: string,
    text: string,
    synonyms: string[],
    created_at: Date,
    authorId: string,
    testSuite: string
) {
    const props: ArCabildoabiertoWikiTopic.TopicProp[] = [
        {
            name: "Sinónimos",
            value: {
                $type: "ar.cabildoabierto.wiki.topic#stringListProp",
                value: synonyms,
            },
        },
    ]
    const record = getTopicVersionRecord(
        ctx,
        topicId,
        text,
        created_at,
        authorId,
        props
    )

    return record.pipe(Effect.flatMap(record => getRefAndRecord(
        record,
        testSuite,
        {
            did: authorId,
            collection: "ar.cabildoabierto.wiki.topic"
        }
    )))
}


function getAcceptVoteRecord(ctx: AppContext, subjectRef: ATProtoStrongRef, created_at: Date): ArCabildoabiertoWikiVote.Record {
    return {
        $type: "ar.cabildoabierto.wiki.vote",
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


export function createTestTopicVersion(ctx: AppContext, authorId: string, testSuite: string): Effect.Effect<
    RefAndRecord<ArCabildoabiertoWikiTopic.Main>,
    GenerateCIDError | ProcessCreateError | RunJobError | RedisCacheSetError | CIDEncodeError
> {
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
): ArCabildoabiertoWikiVote.Record {
    return {
        $type: "ar.cabildoabierto.wiki.vote",
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


export const deleteEmptyTopics = (
    ctx: AppContext
) => Effect.gen(function* () {

    const topics = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("Topic")
            .select("id")
            .where(eb => eb.not(eb.exists(eb.selectFrom("TopicVersion").whereRef("TopicVersion.topicId", "=", "Topic.id"))))
            .execute().then(res => res.map(t => t.id)),
        catch: (error) => new DBSelectError(error)
    })
    if(topics.length == 0) return

    yield* Effect.tryPromise({
        try: async () => {
            await ctx.kysely
                .deleteFrom("Poll")
                .where("Poll.topicId", "in", topics)
                .execute()
            await ctx.kysely
                .deleteFrom("TopicToCategory")
                .where("TopicToCategory.topicId", "in", topics)
                .execute()
            await ctx.kysely
                .deleteFrom("Topic")
                .where("Topic.id", "in", topics)
                .execute()
        },
        catch: (error) => new DBDeleteError(error)
    })
})


export const deleteUsersInTest = (ctx: AppContext, dids: string[]) => Effect.gen(function* () {
    yield* deleteUsers(ctx, dids)

    if(ctx.worker) {
        yield* Effect.tryPromise({
            try: () => ctx.worker!.runAllJobs(),
            catch: () => "Error al correr los trabajos para borrar los usuarios."
        })
    }
})


export function processRecordsInTest(ctx: AppContext, records: RefAndRecord[]) {

    return Effect.all(
        records.map(r => {
            const processor = getRecordProcessor(ctx, getCollectionFromUri(r.ref.uri))
            return processInBatches(ctx, [r], processor)
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
        return processDeletes(ctx, [r])
    }), {concurrency: 4})

    yield* Effect.tryPromise({
        try: () => ctx!.worker?.runAllJobs(), // TO DO: Pasar a Effect
        catch: () => "Error al correr los trabajos para borrar los registros."
    })
})


export async function getRecord(ctx: AppContext, uri: string){
    return await ctx.kysely
        .selectFrom("Record")
        .where("Record.uri", "=", uri)
        .selectAll()
        .executeTakeFirst()
}


export async function resetTestDB() {
    const ctx = await createTestContext()
    const users = await ctx.kysely.selectFrom("User").select("did").execute()
    await Effect.runPromise(deleteUsersInTest(ctx, users.map(u => u.did)))
    const users2 = await ctx.kysely.selectFrom("User").select("did").execute()
    ctx.logger.pino.info({users2}, "users remaining")
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