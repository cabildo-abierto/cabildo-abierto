import {
    checkContentInFollowingFeed,
    checkIsFollowing,
    checkRecordExists,
    cleanUpAfterTests,
    cleanUPTestDataFromDB,
    createTestContext, createTestUser, getArticleRefAndRecord, getFollowRefAndRecord, getPostRefAndRecord,
    getRepostRefAndRecord,
    getSuiteId, processRecordsInTest, testTimeout
} from "#/tests/test-utils.js";
import {AppContext} from "#/setup.js";
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {Effect} from "effect";
import {DataPlane, makeDataPlane} from "#/services/hydration/dataplane.js";

const testSuite = getSuiteId(__filename)


describe('Following feed index', { timeout: testTimeout }, () => {
    let ctx : AppContext | undefined
    beforeAll(async () => {
        ctx = await createTestContext()
        await ctx.worker?.setup(ctx)
    }, testTimeout)

    beforeEach(async () => {
        await cleanUPTestDataFromDB(ctx!, testSuite)
        await ctx!.worker?.clear()
    }, testTimeout)

    it("should include new post", async () => {
        const test = Effect.gen(function* () {
            const follower = yield* createTestUser(ctx!, "follower", testSuite)
            const notFollower = yield* createTestUser(ctx!, "notFollower", testSuite)
            const poster = yield* createTestUser(ctx!, "poster", testSuite)

            const post = yield* getPostRefAndRecord(
                "hola!",
                new Date(),
                testSuite,
                {
                    did: poster
                }
            )

            const follow = yield* getFollowRefAndRecord(
                poster,
                testSuite,
                follower
            )

            yield* processRecordsInTest(ctx!, [follow])

            const recordExists = yield* checkRecordExists(ctx!, follow.ref.uri)
            const isFollowing = yield* checkIsFollowing(ctx!, follower, poster)
            expect(recordExists).toEqual(true)
            expect(isFollowing).toEqual(true)

            yield* processRecordsInTest(ctx!, [post])

            const followerHasContent = yield* checkContentInFollowingFeed(ctx!, post.ref.uri, follower)
            expect(followerHasContent).toEqual(true)

            const notFollowerHasContent = yield* checkContentInFollowingFeed(ctx!, post.ref.uri, notFollower)
            expect(notFollowerHasContent).toEqual(false)

            const authorHasContent = yield* checkContentInFollowingFeed(ctx!, post.ref.uri, poster)
            expect(authorHasContent).toEqual(true)
        })

        return await Effect.runPromise(Effect.provideServiceEffect(
            test,
            DataPlane,
            makeDataPlane(ctx!)
        ))
    }, {timeout: testTimeout})


    it("should include new article and repost", async () => {
        const test = Effect.gen(function* () {
            const follower = yield* createTestUser(ctx!, "follower", testSuite)
            const notFollower = yield* createTestUser(ctx!, "notFollower", testSuite)
            const reposterFollower = yield* createTestUser(ctx!, "reposterFollower", testSuite)
            const bothFollower = yield* createTestUser(ctx!, "bothFollower", testSuite)
            const poster = yield* createTestUser(ctx!, "poster", testSuite)
            const reposter = yield* createTestUser(ctx!, "reposter", testSuite)

            const article = yield* getArticleRefAndRecord(
                ctx!,
                "hola!",
                "texto",
                new Date(Date.now()),
                testSuite,
                {
                    did: poster
                }
            )

            const repost = yield* getRepostRefAndRecord(article.ref, new Date(Date.now()+1), testSuite, reposter)

            const followFollowerPoster = yield* getFollowRefAndRecord(
                poster,
                testSuite,
                follower
            )
            const followReposterFollowerReposter = yield* getFollowRefAndRecord(
                reposter,
                testSuite,
                reposterFollower
            )
            const followBothFollowerReposter = yield* getFollowRefAndRecord(
                reposter,
                testSuite,
                bothFollower
            )
            const followBothFollowerPoster = yield* getFollowRefAndRecord(
                poster,
                testSuite,
                bothFollower
            )

            yield* processRecordsInTest(ctx!, [followFollowerPoster, followReposterFollowerReposter, followBothFollowerReposter, followBothFollowerPoster, article, repost])

            const feedElements = new Set<string>()
            for(const user of [follower, notFollower, bothFollower, reposterFollower]) {
                for(const uri of [article.ref.uri, repost.ref.uri]) {
                    const present = yield* checkContentInFollowingFeed(ctx!, uri, user)
                    if(present) feedElements.add(`${uri}:${user}`)
                }
            }
            expect(feedElements.has(`${article.ref.uri}:${follower}`)).toEqual(true)
            expect(feedElements.has(`${article.ref.uri}:${notFollower}`)).toEqual(false)
            expect(feedElements.has(`${article.ref.uri}:${reposterFollower}`)).toEqual(false)
            expect(feedElements.has(`${article.ref.uri}:${bothFollower}`)).toEqual(true)
            expect(feedElements.has(`${repost.ref.uri}:${follower}`)).toEqual(false)
            expect(feedElements.has(`${repost.ref.uri}:${notFollower}`)).toEqual(false)
            expect(feedElements.has(`${repost.ref.uri}:${reposterFollower}`)).toEqual(true)
            expect(feedElements.has(`${repost.ref.uri}:${bothFollower}`)).toEqual(true)
        })

        return await Effect.runPromise(Effect.provideServiceEffect(
            test,
            DataPlane,
            makeDataPlane(ctx!)
        ))
    }, {timeout: testTimeout})


    it("should include reply", async () => {
        const test = Effect.gen(function* () {
            const posterFollower = yield* createTestUser(ctx!, "posterFollower", testSuite)
            const bothFollower = yield* createTestUser(ctx!, "bothFollower", testSuite)
            const replierFollower = yield* createTestUser(ctx!, "replierFollower", testSuite)
            const poster = yield* createTestUser(ctx!, "poster", testSuite)
            const replier = yield* createTestUser(ctx!, "replier", testSuite)

            const post = yield* getPostRefAndRecord(
                "hola!",
                new Date(Date.now()),
                testSuite,
                {
                    did: poster
                }
            )
            const reply = yield* getPostRefAndRecord(
                "hola!",
                new Date(Date.now()+1),
                testSuite,
                {
                    did: replier
                },
                post.ref
            )

            yield* processRecordsInTest(ctx!, [
                yield* getFollowRefAndRecord(
                    poster,
                    testSuite,
                    posterFollower
                ),
                yield* getFollowRefAndRecord(
                    poster,
                    testSuite,
                    bothFollower
                ),
                yield* getFollowRefAndRecord(
                    replier,
                    testSuite,
                    bothFollower
                ),
                yield* getFollowRefAndRecord(
                    replier,
                    testSuite,
                    replierFollower
                ),
                post,
                reply
            ])

            const feedElements = new Set<string>()
            for(const user of [posterFollower, replierFollower, bothFollower]) {
                for(const uri of [post.ref.uri, reply.ref.uri]) {
                    const present = yield* checkContentInFollowingFeed(ctx!, uri, user)
                    if(present) feedElements.add(`${uri}:${user}`)
                }
            }
            expect(feedElements.has(`${post.ref.uri}:${posterFollower}`)).toEqual(true)
            expect(feedElements.has(`${reply.ref.uri}:${posterFollower}`)).toEqual(false)

            expect(feedElements.has(`${post.ref.uri}:${replierFollower}`)).toEqual(false)
            expect(feedElements.has(`${reply.ref.uri}:${replierFollower}`)).toEqual(false)

            expect(feedElements.has(`${reply.ref.uri}:${bothFollower}`)).toEqual(true)
            expect(feedElements.has(`${post.ref.uri}:${bothFollower}`)).toEqual(true)
        })

        return await Effect.runPromise(Effect.provideServiceEffect(
            test,
            DataPlane,
            makeDataPlane(ctx!)
        ))
    }, {timeout: testTimeout})


    it("should include repost of own post", async () => {
        const test = Effect.gen(function* () {
            const poster = yield* createTestUser(ctx!, "poster", testSuite)

            const post = yield* getPostRefAndRecord(
                "hola!",
                new Date(Date.now()),
                testSuite,
                {
                    did: poster
                }
            )

            const repost = yield* getRepostRefAndRecord(post.ref, new Date(Date.now()+1), testSuite, poster)

            yield* processRecordsInTest(ctx!, [
                post,
                repost
            ])
            const postInFeed = yield* checkContentInFollowingFeed(ctx!, post.ref.uri, poster)
            expect(postInFeed).toEqual(true)

            const repostInFeed = yield* checkContentInFollowingFeed(ctx!, repost.ref.uri, poster)
            expect(repostInFeed).toEqual(true)
        })

        return await Effect.runPromise(Effect.provideServiceEffect(
            test,
            DataPlane,
            makeDataPlane(ctx!)
        ))
    }, {timeout: testTimeout})


    afterAll(async () => cleanUpAfterTests(ctx!))
})