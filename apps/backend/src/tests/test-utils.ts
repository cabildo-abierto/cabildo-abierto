import {RedisCache} from "#/services/redis/cache.js";
import {AppContext, setupKysely, setupRedis, setupResolver} from "#/setup.js";
import {Logger} from "#/utils/logger.js";
import {AppBskyActorProfile, AppBskyFeedLike, AppBskyFeedRepost, AppBskyGraphFollow} from "@atproto/api";
import {deleteUser} from "#/services/delete.js";
import {sql} from "kysely";
import {BaseAgent, bskyPublicAPI, SessionAgent} from "#/utils/session-agent.js";
import {env} from "#/lib/env.js";
import {AppBskyFeedPost, AtpBaseClient} from "@atproto/api";
import {RefAndRecord} from "#/services/sync/types.js";
import {getRecordProcessor} from "#/services/sync/event-processing/get-record-processor.js";
import {getCollectionFromUri, getUri} from "@cabildo-abierto/utils";
import {CAWorker} from "#/jobs/worker.js";
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
import {trace} from "@opentelemetry/api";

export const testTimeout = 40000

export function generateRkey(): string {
    return `${Date.now()}${Math.random().toString(36).substring(2, 7)}`;
}


export async function generateCid(data: any) {
    const bytes = encode({data, date: new Date().toISOString()})

    const hash = await sha256.digest(bytes)

    const cid = CID.createV1(code, hash)

    return cid.toString()
}


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


function getCAProfileRefAndRecord(did: string, testSuite: string): Promise<RefAndRecord<ArCabildoabiertoActorCaProfile.Record>> {
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


async function getBskyProfileRefAndRecord(did: string, testSuite: string): Promise<RefAndRecord<AppBskyActorProfile.Record>> {
    const record: AppBskyActorProfile.Record = {
        $type: "app.bsky.actor.profile",
        displayName: "Test",
        createdAt: new Date().toISOString()
    }

    return await getRefAndRecord(
        record,
        testSuite,
        {
            did,
            collection: record.$type,
        }
    )
}


export async function createTestUser(ctx: AppContext, handle: string, testSuite: string) {
    const did = generateUserDid(testSuite)
    await ctx.redisCache.resolver.setHandle(did, handle)
    const caProfile = await getCAProfileRefAndRecord(did, testSuite)
    const bskyProfile = await getBskyProfileRefAndRecord(did, testSuite)

    await processRecordsInTest(ctx, [caProfile, bskyProfile])
    return did
}


export async function createTestContext(): Promise<AppContext> {
    const ioredis = setupRedis(1)
    const logger = new Logger("test")
    const mirrorId = "test"
    const redisCache = new RedisCache(ioredis, mirrorId, logger)
    const ctx: AppContext = {
        logger,
        kysely: setupKysely(process.env.TEST_DB, 2),
        ioredis,
        resolver: setupResolver(redisCache),
        mirrorId,
        worker: new MockCAWorker(logger),
        storage: undefined,
        oauthClient: undefined,
        redisCache,
        tracer: trace.getTracer('ca-backend')
    }

    const result = await sql<{ dbName: string }>`SELECT current_database() as "dbName"`.execute(ctx.kysely);

    if(result.rows[0].dbName != "ca-sql-dev") throw Error(`Wrong database name! ${result.rows[0].dbName}`)

    return ctx
}


export async function getRefAndRecord<T>(record: T, testSuite: string, uri: {
    did?: string
    collection: string
    rkey?: string
}) {
    const uriStr = getUri(
        uri?.did ?? generateUserDid(testSuite),
        uri.collection,
        uri?.rkey ?? generateRkey()
    )

    return {
        ref: {
            uri: uriStr,
            cid: await generateCid(record)
        },
        record
    }
}

export function getSuiteId(filename: string): string {
    return path.basename(filename, path.extname(filename))
        .replace(/[^a-zA-Z0-9]/g, '-') // Replace non-alphanumeric chars with a dash
        .toLowerCase();
}


export async function getFollowRefAndRecord(subject: string, testSuite: string, authorId?: string) {
    const record: AppBskyGraphFollow.Record = {
        $type: "app.bsky.graph.follow",
        subject,
        createdAt: new Date().toISOString()
    }

    return await getRefAndRecord(record, testSuite, {
        collection: "app.bsky.graph.follow",
        did: authorId
    })
}


export async function cleanUPTestDataFromDB(ctx: AppContext, testSuite: string) {
    const testUsers = await ctx.kysely
        .selectFrom("User")
        .select("did")
        .where("did", "ilike", `%${testSuite}%`)
        .execute()

    ctx.logger.pino.info({testUsers, testSuite}, "clearing test users")

    await deleteUsersInTest(ctx, testUsers.map(t => t.did))
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


async function getArticleRecord(ctx: AppContext, title: string, text: string, created_at: Date = new Date(), authorId: string): Promise<ArCabildoabiertoFeedArticle.Record> {
    const cid = await generateCid(text)
    const mimeType = "text/plain"
    const blob = new BlobRef(
        CID.parse(cid),
        mimeType,
        text.length
    )
    await ctx.ioredis.set(getBlobKey({cid, authorId}), text)
    return {
        $type: "ar.cabildoabierto.feed.article",
        createdAt: created_at.toISOString(),
        text: blob,
        format: "markdown",
        title
    }
}


export async function getArticleRefAndRecord(
    ctx: AppContext,
    title: string,
    text: string,
    created_at: Date = new Date(),
    testSuite: string,
    uri?: {
        did?: string
        rkey?: string
    },
) {
    const authorId = uri?.did ?? generateUserDid(testSuite)
    const record = await getArticleRecord(
        ctx,
        title,
        text,
        created_at,
        authorId
    )

    return getRefAndRecord(
        record,
        testSuite,
        {
            ...uri,
            did: authorId,
            collection: "ar.cabildoabierto.feed.article"
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




async function getTopicVersionRecord(ctx: AppContext, topicId: string, text: string, created_at: Date, authorId: string): Promise<ArCabildoabiertoWikiTopicVersion.Record> {
    const cid = await generateCid(text)
    const mimeType = "text/plain"
    const blob = new BlobRef(
        CID.parse(cid),
        mimeType,
        text.length
    )
    ctx.logger.pino.info({key: getBlobKey({cid, authorId}), text}, "setting blob key")
    await ctx.ioredis.set(getBlobKey({cid, authorId}), text)

    return {
        $type: "ar.cabildoabierto.wiki.topicVersion",
        id: topicId,
        text: blob,
        format: "markdown",
        createdAt: created_at.toISOString(),
    }
}


export async function getTopicVersionRefAndRecord(ctx: AppContext, topicId: string, text: string, created_at: Date, authorId: string, testSuite: string): Promise<RefAndRecord<ArCabildoabiertoWikiTopicVersion.Record>> {
    const record = await getTopicVersionRecord(
        ctx,
        topicId,
        text,
        created_at,
        authorId
    )

    return getRefAndRecord(
        record,
        testSuite,
        {
            did: authorId,
            collection: "ar.cabildoabierto.wiki.topicVersion"
        }
    )
}


async function getAcceptVoteRecord(ctx: AppContext, subjectRef: ATProtoStrongRef, created_at: Date): Promise<ArCabildoabiertoWikiVoteAccept.Record> {
    return {
        $type: "ar.cabildoabierto.wiki.voteAccept",
        subject: subjectRef,
        createdAt: created_at.toISOString()
    }
}


export async function getAcceptVoteRefAndRecord(ctx: AppContext, subjectRef: ATProtoStrongRef, created_at: Date, authorId: string, testSuite: string) {
    const record = await getAcceptVoteRecord(
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


export async function createTestAcceptVote(ctx: AppContext, authorId: string, topicVersion: ATProtoStrongRef, testSuite: string) {
    const vote = await getAcceptVoteRefAndRecord(
        ctx!,
        topicVersion,
        new Date(),
        authorId,
        testSuite
    )
    await processRecordsInTest(ctx!, [vote])
    return vote
}


export async function createTestTopicVersion(ctx: AppContext, authorId: string, testSuite: string) {
    const topicVersion = await getTopicVersionRefAndRecord(
        ctx!,
        "tema de prueba",
        "texto",
        new Date(),
        authorId,
        testSuite
    )
    await processRecordsInTest(ctx!, [topicVersion])
    return topicVersion
}


export async function createTestRejectVote(ctx: AppContext, authorId: string, topicVersion: ATProtoStrongRef, testSuite: string) {
    const reasonPost = await getPostRefAndRecord(
        "prueba",
        new Date(),
        testSuite,
        {did: authorId},
        topicVersion
    )
    const vote = await getRejectVoteRefAndRecord(
        ctx!,
        topicVersion,
        new Date(),
        authorId,
        reasonPost.ref,
        testSuite,
    )
    await processRecordsInTest(ctx!, [reasonPost])
    await processRecordsInTest(ctx!, [vote])
    return {reasonPost, vote}
}


async function getRejectVoteRecord(
    ctx: AppContext,
    subjectRef: ATProtoStrongRef,
    created_at: Date,
    reasonRef: ATProtoStrongRef
): Promise<ArCabildoabiertoWikiVoteReject.Record> {
    return {
        $type: "ar.cabildoabierto.wiki.voteReject",
        subject: subjectRef,
        createdAt: created_at.toISOString(),
        reason: reasonRef
    }
}


export async function getRejectVoteRefAndRecord(
    ctx: AppContext,
    subjectRef: ATProtoStrongRef,
    created_at: Date,
    authorId: string,
    reasonRef: ATProtoStrongRef,
    testSuite: string
) {
    const record = await getRejectVoteRecord(
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


export async function deleteUsersInTest(ctx: AppContext, dids: string[]) {
    for(const d of dids) {
        try {
            await deleteUser(ctx, d)
        } catch (err) {
            ctx.logger.pino.error({did: d, error: err}, "couldn't delete user")
        }
    }
    await ctx!.worker?.runAllJobs()
}


export async function processRecordsInTest(ctx: AppContext, records: RefAndRecord[]) {
    for(const r of records) {
        const processor = getRecordProcessor(ctx, getCollectionFromUri(r.ref.uri))
        await processor.process([r])
        await ctx!.worker?.runAllJobs()
    }
}


export async function deleteRecordsInTest(ctx: AppContext, records: string[]) {
    for(const r of records) {
        const processor = getDeleteProcessor(ctx, getCollectionFromUri(r))
        await processor.process([r])
    }
    await ctx!.worker?.runAllJobs()
}


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

    async addJob(name: string, data: any, priority: number = 10) {
        this.logger.pino.info({name}, "job added")

        this.queue.push({
            name,
            priority,
            data,
        })
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


export async function checkRecordExists(ctx: AppContext, uri: string) {
    return await ctx.kysely
        .selectFrom("Record")
        .where("uri", "=", uri).select("uri")
        .executeTakeFirst() != null
}


export async function checkIsFollowing(ctx: AppContext, follower: string, subject: string) {
    return await ctx!.kysely
        .selectFrom("Follow")
        .innerJoin("Record", "Record.uri", "Follow.uri")
        .where("Record.authorId", "=", follower)
        .where("Follow.userFollowedId", "=", subject)
        .selectAll()
        .executeTakeFirst() != null
}


export async function checkContentInFollowingFeed(ctx: AppContext, uri: string, follower: string) {
    return await ctx!.kysely
        .selectFrom("FollowingFeedIndex")
        .select("contentId")
        .where("contentId", "=", uri)
        .where("readerId", "=", follower)
        .executeTakeFirst() != null
}