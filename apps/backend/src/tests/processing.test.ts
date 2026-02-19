import {AppContext} from "#/setup.js";
import {getDidFromUri, getRkeyFromUri} from "@cabildo-abierto/utils";
import {
    ReadChunks,
    ReadSession,
    storeReadSession
} from "#/services/monetization/read-tracking.js";
import {
    cleanUpAfterTests,
    cleanUPTestDataFromDB,
    createTestContext,
    generateUserDid, getFollowRefAndRecord, getLikeRefAndRecord,
    getPostRefAndRecord,
    getSuiteId,
    MockSessionAgent,
    processRecordsInTest, testTimeout
} from "./test-utils.js";
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {Effect} from "effect";
import {DataPlane, makeDataPlane} from "#/services/hydration/dataplane.js";


const testSuite = getSuiteId(__filename);


describe('Process follow', {timeout: testTimeout}, () => {
    let ctx : AppContext | undefined

    beforeAll(async () => {
        ctx = await createTestContext()

        await cleanUPTestDataFromDB(ctx, testSuite)
    }, testTimeout)

    it("should create a record", async () => {
        const test = Effect.gen(function* () {
            const did = generateUserDid(testSuite)
            const follow = yield* getFollowRefAndRecord(did, testSuite)
            yield* processRecordsInTest(ctx!, [follow])

            expect(ctx).not.toBeFalsy()

            const record = yield* Effect.promise(() => ctx!.kysely
                .selectFrom("Record")
                .where(
                    "uri",
                    "=",
                    follow.ref.uri
                )
                .selectAll()
                .executeTakeFirst())

            expect(record).not.toBeFalsy()
            expect(record!.uri).toBe(follow.ref.uri)
            expect(record!.cid).toBe(follow.ref.cid)
            expect(record!.rkey).toBe(getRkeyFromUri(follow.ref.uri))
            expect(record!.authorId).toBe(getDidFromUri(follow.ref.uri))
            expect(record!.created_at_tz!.toISOString())
                .toBe(new Date(follow.record.createdAt).toISOString())
            expect(record!.CAIndexedAt_tz).not.toBeNull()
        })

        return await Effect.runPromise(Effect.provideServiceEffect(
            test,
            DataPlane,
            makeDataPlane(ctx!)
        ))
    })

    afterAll(async () => cleanUpAfterTests(ctx!))
})


describe('Create read session', {timeout: testTimeout}, () => {
    const agent = new MockSessionAgent(generateUserDid(testSuite))

    let ctx : AppContext | undefined
    beforeAll(async () => {
        ctx = await createTestContext()
    }, testTimeout)

    beforeEach(async () => {
        await cleanUPTestDataFromDB(ctx!, testSuite)
    }, testTimeout)

    it("should create a read session", {timeout: testTimeout}, async () => {
        const test = Effect.gen(function* () {
            expect(ctx).not.toBeFalsy()

            const post = yield* getPostRefAndRecord(
                "hola!",
                new Date(),
                testSuite,
                {
                    did: agent.did
                }
            )

            yield* processRecordsInTest(ctx!, [post])

            const user = yield* Effect.promise(() => ctx!.kysely
                .selectFrom("User")
                .select("did")
                .where("User.did", "=", getDidFromUri(post.ref.uri))
                .executeTakeFirst()
            )
            const post_db = yield* Effect.promise(() => ctx!.kysely
                .selectFrom("Post")
                .select("uri")
                .where("Post.uri", "=", post.ref.uri)
                .executeTakeFirst())

            expect(user).not.toBeFalsy()
            expect(post_db).not.toBeFalsy()
            let created_at = new Date()

            const chunks: ReadChunks = []
            const rs: ReadSession = {
                contentUri: post.ref.uri,
                chunks,
                totalChunks: 10
            }

            const id = yield* storeReadSession(ctx!, agent, rs, created_at)

            expect(id).not.toBeFalsy()

            const db_rs = yield* Effect.promise(() => ctx!.kysely
                .selectFrom("ReadSession")
                .where(
                    "id",
                    "=",
                    id!
                )
                .selectAll()
                .executeTakeFirst())

            expect(db_rs).not.toBeFalsy()
            expect(db_rs!.created_at_tz?.toISOString()).toEqual(created_at.toISOString())
            expect(db_rs!.readChunks).toEqual({chunks: rs.chunks, totalChunks: rs.totalChunks})
            expect(db_rs!.contentAuthorId).toEqual(getDidFromUri(post.ref.uri))
            expect(db_rs!.readContentId).toEqual(post.ref.uri)
            expect(db_rs!.userId).toEqual(getDidFromUri(post.ref.uri))
            expect(db_rs!.topicId).toBeNull()
        })

        return await Effect.runPromise(Effect.provideServiceEffect(
            test,
            DataPlane,
            makeDataPlane(ctx!)
        ))
    })

    it("should get liked if created before", {timeout: testTimeout}, async () => {
        const test = Effect.gen(function* () {
            expect(ctx).not.toBeFalsy()

            const post = yield* getPostRefAndRecord("hola!", new Date(), testSuite)
            const like = yield* getLikeRefAndRecord(post.ref, new Date(), testSuite)

            yield* processRecordsInTest(ctx!, [post, like])

            const record = yield* Effect.promise(() => ctx!.kysely
                .selectFrom("Record")
                .where("Record.uri", "=", post.ref.uri)
                .select("uniqueLikesCount")
                .executeTakeFirst())

            expect(record).not.toBeFalsy()
            expect(record!.uniqueLikesCount).toEqual(1)
        })

        return await Effect.runPromise(Effect.provideServiceEffect(
            test,
            DataPlane,
            makeDataPlane(ctx!)
        ))
    })

    it("should get liked if created later", {timeout: testTimeout}, async () => {
        const test = Effect.gen(function* () {
            expect(ctx).not.toBeFalsy()

            const post = yield* getPostRefAndRecord(
                "hola!",
                new Date(),
                testSuite
            )

            const like = yield* getLikeRefAndRecord(
                post.ref, new Date(), testSuite
            )

            yield* processRecordsInTest(ctx!, [like, post])

            const record = yield* Effect.promise(() => ctx!.kysely
                .selectFrom("Record")
                .where("Record.uri", "=", post.ref.uri)
                .select("uniqueLikesCount")
                .executeTakeFirst())

            expect(record).not.toBeFalsy()
            expect(record!.uniqueLikesCount).toEqual(1)
        })

        return await Effect.runPromise(Effect.provideServiceEffect(
            test,
            DataPlane,
            makeDataPlane(ctx!)
        ))
    })

    afterAll(async () => cleanUpAfterTests(ctx!))
})