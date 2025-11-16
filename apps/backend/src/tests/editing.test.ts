import {
    cleanUpAfterTests,
    cleanUPTestDataFromDB,
    createTestContext, getArticleRefAndRecord,
    getPostRefAndRecord, getSuiteId, processRecordsInTest
} from "#/tests/test-utils.js";
import {AppContext} from "#/setup.js";
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {splitUri} from "@cabildo-abierto/utils";

const testSuite = getSuiteId(__filename)


describe('Edit post', {timeout: 20000}, () => {
    let ctx : AppContext | undefined
    beforeAll(async () => {
        ctx = await createTestContext()
        await ctx.worker?.setup(ctx)
    })

    beforeEach(async () => {
        await cleanUPTestDataFromDB(ctx!, testSuite)
        await ctx!.worker?.clear()
    })

    it("should modify the text in a post", {timeout: 20000}, async () => {
        const post = await getPostRefAndRecord(
            "hola!", new Date(), testSuite
        )

        await processRecordsInTest(ctx!, [post])

        const record = await ctx!.kysely
            .selectFrom("Content")
            .where(
                "uri",
                "=",
                post.ref.uri
            )
            .selectAll()
            .executeTakeFirst()

        expect(record).not.toBeFalsy()
        expect(record!.text).toBe(post.record.text)

        const post2 = await getPostRefAndRecord(
            "chau!", new Date(), testSuite, splitUri(post.ref.uri))
        await processRecordsInTest(ctx!, [post2])

        const record2 = await ctx!.kysely
            .selectFrom("Content")
            .where(
                "uri",
                "=",
                post.ref.uri
            )
            .selectAll()
            .executeTakeFirst()
        expect(record2).not.toBeNull()
        expect(record2!.text).toBe(post2.record.text)
    })

    afterAll(async () => cleanUpAfterTests(ctx!))
})



describe('Edit article', {timeout: 20000}, () => {
    let ctx : AppContext | undefined
    beforeAll(async () => {
        ctx = await createTestContext()
        await ctx.worker?.setup(ctx)
    }, 20000)

    beforeEach(async () => {
        await cleanUPTestDataFromDB(ctx!, testSuite)
        await ctx!.worker?.clear()
    }, 20000)

    it("should modify the text and set edited", {timeout: 20000}, async () => {
        const article = await getArticleRefAndRecord(
            ctx!, "título", "hola!", new Date(), testSuite
        )
        await processRecordsInTest(ctx!, [article])

        const record = await ctx!.kysely
            .selectFrom("Content")
            .innerJoin("Record", "Record.uri", "Content.uri")
            .innerJoin("Article", "Article.uri", "Content.uri")
            .where(
                "Content.uri",
                "=",
                article.ref.uri
            )
            .selectAll()
            .executeTakeFirst()

        expect(record).not.toBeFalsy()
        expect(record!.text).toBe("hola!")
        expect(record!.title).toBe(article.record.title)
        expect(record!.editedAt).toBeNull()

        const article2 = await getArticleRefAndRecord(
            ctx!,
            "otro título",
            "chau!",
            new Date(),
            testSuite,
            splitUri(article.ref.uri)
        )
        await processRecordsInTest(ctx!, [article2])

        const record2 = await ctx!.kysely
            .selectFrom("Content")
            .innerJoin("Record", "Record.uri", "Content.uri")
            .innerJoin("Article", "Article.uri", "Content.uri")
            .where(
                "Content.uri",
                "=",
                article.ref.uri
            )
            .selectAll()
            .executeTakeFirst()

        expect(record2).not.toBeNull()
        expect(record2!.text).toBe("chau!")
        expect(record2!.title).toBe(article2.record.title)
        expect(record2!.editedAt).not.toBeNull()
    })

    afterAll(async () => cleanUpAfterTests(ctx!))
})