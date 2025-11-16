import {
    cleanUpAfterTests,
    cleanUPTestDataFromDB,
    createTestContext,
    getSuiteId
} from "#/tests/test-utils.js";
import {AppContext} from "#/setup.js";
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {findMentionsInText} from "#/services/wiki/references/references.js";

const testSuite = getSuiteId(__filename)


describe('Detect mention notifications', { timeout: 20000 }, () => {
    let ctx : AppContext | undefined
    beforeAll(async () => {
        ctx = await createTestContext()
        await ctx.worker?.setup(ctx)
    }, 20000)

    beforeEach(async () => {
        await cleanUPTestDataFromDB(ctx!, testSuite)
        await ctx!.worker?.clear()
    }, 20000)

    it("should find mention", async () => {
        const text = "[@cabildoabierto.ar](/perfil/cabildoabierto.ar)"
        const mentions = findMentionsInText(text)
        expect(mentions.length).toEqual(1)
        expect(mentions[0]).toEqual("cabildoabierto.ar")
    })

    it("should find two mentions", async () => {
        const text = "[@cabildoabierto.ar](/perfil/cabildoabierto.ar) test [@tomas.cabildo.ar](/perfil/tomas.cabildo.ar)"
        const mentions = findMentionsInText(text)
        expect(mentions.length).toEqual(2)
        expect(mentions[0]).toEqual("cabildoabierto.ar")
        expect(mentions[1]).toEqual("tomas.cabildo.ar")
    })

    it("should not find invalid mention", async () => {
        const text = "[@cabildoabierto.ar](/perfil/tomas.cabildo.ar)"
        const mentions = findMentionsInText(text)
        expect(mentions.length).toEqual(0)
    })

    it("should not count handle as mention", async () => {
        const text = "@cabildoabierto.ar"
        const mentions = findMentionsInText(text)
        expect(mentions.length).toEqual(0)
    })

    afterAll(async () => cleanUpAfterTests(ctx!))
})
