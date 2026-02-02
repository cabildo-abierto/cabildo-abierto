import {
    cleanUpAfterTests,
    cleanUPTestDataFromDB,
    createTestContext, getArticleRefAndRecord,
    getPostRefAndRecord, getSuiteId, processRecordsInTest, testTimeout
} from "#/tests/test-utils.js";
import {AppContext} from "#/setup.js";
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {splitUri} from "@cabildo-abierto/utils";
import {Effect} from "effect";
import {DataPlane, makeDataPlane} from "#/services/hydration/dataplane.js";

const testSuite = getSuiteId(__filename)


describe('Edit post', {timeout: testTimeout}, () => {
    let ctx : AppContext | undefined
    beforeAll(async () => {
        ctx = await createTestContext()
        await ctx.worker?.setup(ctx)
    })

    beforeEach(async () => {
        await cleanUPTestDataFromDB(ctx!, testSuite)
        await ctx!.worker?.clear()
    })

    it("should modify the text in a post", {timeout: testTimeout}, async () => {
        const test = Effect.gen(function* () {
            const post = yield* getPostRefAndRecord(
                "hola!", new Date(), testSuite
            )

            yield* processRecordsInTest(ctx!, [post])

            const record = yield* Effect.promise(() => ctx!.kysely
                .selectFrom("Content")
                .where(
                    "uri",
                    "=",
                    post.ref.uri
                )
                .selectAll()
                .executeTakeFirst())

            expect(record).not.toBeFalsy()
            expect(record!.text).toBe(post.record.text)

            const post2 = yield* getPostRefAndRecord(
                "chau!", new Date(), testSuite, splitUri(post.ref.uri))
            yield* processRecordsInTest(ctx!, [post2])

            const record2 = yield* Effect.promise(() => ctx!.kysely
                .selectFrom("Content")
                .where(
                    "uri",
                    "=",
                    post.ref.uri
                )
                .selectAll()
                .executeTakeFirst())
            expect(record2).not.toBeNull()
            expect(record2!.text).toBe(post2.record.text)
        })

        return await Effect.runPromise(Effect.provideServiceEffect(
            test,
            DataPlane,
            makeDataPlane(ctx!)
        ))
    })

    afterAll(async () => cleanUpAfterTests(ctx!))
})


describe('Edit article', {timeout: testTimeout}, () => {
    let ctx : AppContext | undefined
    beforeAll(async () => {
        ctx = await createTestContext()
        await ctx.worker?.setup(ctx)
    }, testTimeout)

    beforeEach(async () => {
        await cleanUPTestDataFromDB(ctx!, testSuite)
        await ctx!.worker?.clear()
    }, testTimeout)

    it("should modify the text and set edited", {timeout: testTimeout}, async () => {
        const test = Effect.gen(function* () {
            const article = yield* getArticleRefAndRecord(
                ctx!, "título", "hola!", new Date(), testSuite
            )
            yield* processRecordsInTest(ctx!, [article])

            const record = yield* Effect.promise(() => ctx!.kysely
                .selectFrom("Content")
                .innerJoin("Record", "Record.uri", "Content.uri")
                .innerJoin("Article", "Article.uri", "Content.uri")
                .where(
                    "Content.uri",
                    "=",
                    article.ref.uri
                )
                .selectAll()
                .executeTakeFirst())

            expect(record).not.toBeFalsy()
            expect(record!.text).toBe("hola!")
            expect(record!.title).toBe(article.record.title)
            expect(record!.editedAt).toBeNull()

            const article2 = yield* getArticleRefAndRecord(
                ctx!,
                "otro título",
                "chau!",
                new Date(),
                testSuite,
                splitUri(article.ref.uri)
            )
            yield* processRecordsInTest(ctx!, [article2])

            const record2 = yield* Effect.promise(() => ctx!.kysely
                .selectFrom("Content")
                .innerJoin("Record", "Record.uri", "Content.uri")
                .innerJoin("Article", "Article.uri", "Content.uri")
                .where(
                    "Content.uri",
                    "=",
                    article.ref.uri
                )
                .selectAll()
                .executeTakeFirst())

            expect(record2).not.toBeNull()
            expect(record2!.text).toBe("chau!")
            expect(record2!.title).toBe(article2.record.title)
            expect(record2!.editedAt).not.toBeNull()
        })

        return await Effect.runPromise(Effect.provideServiceEffect(
            test,
            DataPlane,
            makeDataPlane(ctx!)
        ))
    })

    afterAll(async () => cleanUpAfterTests(ctx!))
})