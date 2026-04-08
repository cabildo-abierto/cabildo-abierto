import {
    cleanUpAfterTests,
    cleanUpTestDataFromDB,
    createTestContext,
    createTestUser,
    deleteRecordsInTest,
    getFollowRefAndRecord,
    getSuiteId,
    processRecordsInTest,
    testTimeout
} from "./test-utils.js";
import {AppContext} from "#/setup.js";
import {describe, it, expect, beforeAll, afterAll, beforeEach} from "vitest";
import {Effect} from "effect";
import {DataPlane, makeDataPlane} from "#/services/hydration/dataplane.js";
import {DBSelectError} from "#/utils/errors.js";

const testSuite = getSuiteId(__filename);

function getUserFollowCounts(
    ctx: AppContext,
    did: string
): Effect.Effect<{caFollowingCount: number; caFollowersCount: number}, DBSelectError> {
    return Effect.tryPromise({
        try: () =>
            ctx.kysely
                .selectFrom("User")
                .where("did", "=", did)
                .select(["caFollowingCount", "caFollowersCount"])
                .executeTakeFirst()
                .then((row) => row ?? {caFollowingCount: 0, caFollowersCount: 0}),
        catch: (error) => new DBSelectError(error),
    });
}

describe("Follow counters", {timeout: testTimeout}, () => {
    let ctx: AppContext | undefined;

    beforeAll(async () => {
        ctx = await createTestContext();
        await ctx.worker?.setup(ctx);
    }, testTimeout);

    beforeEach(async () => {
        await cleanUpTestDataFromDB(ctx!, testSuite);
        await ctx!.worker?.clear();
    }, testTimeout);

    it("should increment follow counters when processing a follow record", async () => {
        const test = Effect.gen(function* () {
            const follower = yield* createTestUser(ctx!, "follower", testSuite);
            const followed = yield* createTestUser(ctx!, "followed", testSuite);

            const follow = yield* getFollowRefAndRecord(followed, testSuite, follower);

            const followerCountsBefore = yield* getUserFollowCounts(ctx!, follower);
            const followedCountsBefore = yield* getUserFollowCounts(ctx!, followed);

            yield* processRecordsInTest(ctx!, [follow]);

            const followerCountsAfter = yield* getUserFollowCounts(ctx!, follower);
            const followedCountsAfter = yield* getUserFollowCounts(ctx!, followed);

            expect(followerCountsBefore.caFollowingCount).toBe(0);
            expect(followerCountsBefore.caFollowersCount).toBe(0);
            expect(followedCountsBefore.caFollowingCount).toBe(0);
            expect(followedCountsBefore.caFollowersCount).toBe(0);

            expect(followerCountsAfter.caFollowingCount).toBe(1);
            expect(followerCountsAfter.caFollowersCount).toBe(0);
            expect(followedCountsAfter.caFollowingCount).toBe(0);
            expect(followedCountsAfter.caFollowersCount).toBe(1);
        });

        return await Effect.runPromise(
            Effect.provideServiceEffect(test, DataPlane, makeDataPlane(ctx!))
        );
    }, {timeout: testTimeout});

    it("should decrement follow counters when deleting a follow record", async () => {
        const test = Effect.gen(function* () {
            const follower = yield* createTestUser(ctx!, "follower", testSuite);
            const followed = yield* createTestUser(ctx!, "followed", testSuite);

            const follow = yield* getFollowRefAndRecord(followed, testSuite, follower);

            yield* processRecordsInTest(ctx!, [follow]);

            const followerCountsAfterProcess = yield* getUserFollowCounts(ctx!, follower);
            const followedCountsAfterProcess = yield* getUserFollowCounts(ctx!, followed);

            expect(followerCountsAfterProcess.caFollowingCount).toBe(1);
            expect(followedCountsAfterProcess.caFollowersCount).toBe(1);

            yield* deleteRecordsInTest(ctx!, [follow.ref.uri]);

            const followerCountsAfterDelete = yield* getUserFollowCounts(ctx!, follower);
            const followedCountsAfterDelete = yield* getUserFollowCounts(ctx!, followed);

            expect(followerCountsAfterDelete.caFollowingCount).toBe(0);
            expect(followedCountsAfterDelete.caFollowersCount).toBe(0);
        });

        return await Effect.runPromise(
            Effect.provideServiceEffect(test, DataPlane, makeDataPlane(ctx!))
        );
    }, {timeout: testTimeout});

    afterAll(async () => cleanUpAfterTests(ctx!));
});
