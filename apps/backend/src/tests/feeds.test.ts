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
        const follower = await createTestUser(ctx!, "follower", testSuite)
        const notFollower = await createTestUser(ctx!, "notFollower", testSuite)
        const poster = await createTestUser(ctx!, "poster", testSuite)

        const post = await getPostRefAndRecord(
            "hola!",
            new Date(),
            testSuite,
            {
                did: poster
            }
        )

        const follow = await getFollowRefAndRecord(
            poster,
            testSuite,
            follower
        )

        await processRecordsInTest(ctx!, [follow])

        const recordExists = await checkRecordExists(ctx!, follow.ref.uri)
        const isFollowing = await checkIsFollowing(ctx!, follower, poster)
        expect(recordExists).toEqual(true)
        expect(isFollowing).toEqual(true)

        await processRecordsInTest(ctx!, [post])

        const followerHasContent = await checkContentInFollowingFeed(ctx!, post.ref.uri, follower)
        expect(followerHasContent).toEqual(true)

        const notFollowerHasContent = await checkContentInFollowingFeed(ctx!, post.ref.uri, notFollower)
        expect(notFollowerHasContent).toEqual(false)

        const authorHasContent = await checkContentInFollowingFeed(ctx!, post.ref.uri, poster)
        expect(authorHasContent).toEqual(true)
    }, {timeout: testTimeout})


    it("should include new article and repost", async () => {
        const follower = await createTestUser(ctx!, "follower", testSuite)
        const notFollower = await createTestUser(ctx!, "notFollower", testSuite)
        const reposterFollower = await createTestUser(ctx!, "reposterFollower", testSuite)
        const bothFollower = await createTestUser(ctx!, "bothFollower", testSuite)
        const poster = await createTestUser(ctx!, "poster", testSuite)
        const reposter = await createTestUser(ctx!, "reposter", testSuite)

        const article = await getArticleRefAndRecord(
            ctx!,
            "hola!",
            "texto",
            new Date(Date.now()),
            testSuite,
            {
                did: poster
            }
        )

        const repost = await getRepostRefAndRecord(article.ref, new Date(Date.now()+1), testSuite, reposter)

        const followFollowerPoster = await getFollowRefAndRecord(
            poster,
            testSuite,
            follower
        )
        const followReposterFollowerReposter = await getFollowRefAndRecord(
            reposter,
            testSuite,
            reposterFollower
        )
        const followBothFollowerReposter = await getFollowRefAndRecord(
            reposter,
            testSuite,
            bothFollower
        )
        const followBothFollowerPoster = await getFollowRefAndRecord(
            poster,
            testSuite,
            bothFollower
        )

        await processRecordsInTest(ctx!, [followFollowerPoster, followReposterFollowerReposter, followBothFollowerReposter, followBothFollowerPoster, article, repost])

        const feedElements = new Set<string>()
        for(const user of [follower, notFollower, bothFollower, reposterFollower]) {
            for(const uri of [article.ref.uri, repost.ref.uri]) {
                const present = await checkContentInFollowingFeed(ctx!, uri, user)
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
    }, {timeout: testTimeout})


    it("should include reply", async () => {
        const posterFollower = await createTestUser(ctx!, "posterFollower", testSuite)
        const bothFollower = await createTestUser(ctx!, "bothFollower", testSuite)
        const replierFollower = await createTestUser(ctx!, "replierFollower", testSuite)
        const poster = await createTestUser(ctx!, "poster", testSuite)
        const replier = await createTestUser(ctx!, "replier", testSuite)

        const post = await getPostRefAndRecord(
            "hola!",
            new Date(Date.now()),
            testSuite,
            {
                did: poster
            }
        )
        const reply = await getPostRefAndRecord(
            "hola!",
            new Date(Date.now()+1),
            testSuite,
            {
                did: replier
            },
            post.ref
        )

        await processRecordsInTest(ctx!, [
            await getFollowRefAndRecord(
                poster,
                testSuite,
                posterFollower
            ),
            await getFollowRefAndRecord(
                poster,
                testSuite,
                bothFollower
            ),
            await getFollowRefAndRecord(
                replier,
                testSuite,
                bothFollower
            ),
            await getFollowRefAndRecord(
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
                const present = await checkContentInFollowingFeed(ctx!, uri, user)
                if(present) feedElements.add(`${uri}:${user}`)
            }
        }
        expect(feedElements.has(`${post.ref.uri}:${posterFollower}`)).toEqual(true)
        expect(feedElements.has(`${reply.ref.uri}:${posterFollower}`)).toEqual(false)

        expect(feedElements.has(`${post.ref.uri}:${replierFollower}`)).toEqual(false)
        expect(feedElements.has(`${reply.ref.uri}:${replierFollower}`)).toEqual(false)

        expect(feedElements.has(`${reply.ref.uri}:${bothFollower}`)).toEqual(true)
        expect(feedElements.has(`${post.ref.uri}:${bothFollower}`)).toEqual(true)
    }, {timeout: testTimeout})


    it("should include repost of own post", async () => {
        const poster = await createTestUser(ctx!, "poster", testSuite)

        const post = await getPostRefAndRecord(
            "hola!",
            new Date(Date.now()),
            testSuite,
            {
                did: poster
            }
        )

        const repost = await getRepostRefAndRecord(post.ref, new Date(Date.now()+1), testSuite, poster)

        await processRecordsInTest(ctx!, [
            post,
            repost
        ])
        const postInFeed = await checkContentInFollowingFeed(ctx!, post.ref.uri, poster)
        expect(postInFeed).toEqual(true)

        const repostInFeed = await checkContentInFollowingFeed(ctx!, repost.ref.uri, poster)
        expect(repostInFeed).toEqual(true)
    }, {timeout: testTimeout})


    afterAll(async () => cleanUpAfterTests(ctx!))
})
