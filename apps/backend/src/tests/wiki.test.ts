import {
    cleanUpAfterTests,
    cleanUPTestDataFromDB,
    createTestAcceptVote,
    createTestContext,
    createTestTopicVersion,
    createTestUser,
    deleteRecordsInTest,
    getPostRefAndRecord,
    getSuiteId,
    getTopicVersionRefAndRecord, MockSessionAgent,
    processRecordsInTest
} from "#/tests/test-utils.js";
import {AppContext} from "#/setup.js";
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {getTopicVersion} from "#/services/wiki/topics.js";
import {getTopicVersionVotes} from "#/services/wiki/votes.js";
import {getTopicFeed} from "#/services/feed/topic.js";
import {ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api"

const testSuite = getSuiteId(__filename)


// Creación de votos

// A nivel App
// TO DO: Voto positivo remueve voto negativo y justificación.
// TO DO: Voto negativo remueve voto positivo y justificación.
// TO DO: Remover justificación también remueve voto negativo.
// TO DO: Remover voto negativo también remueve justificación.

// Actualización de versión
// TO DO: Nuevo tema de alguien sin permisos suficientes es versión actual pero no aceptada
// TO DO: Nueva versión de alguien sin permisos no es versión actual
// TO DO: Voto de aceptación con permisos altos a una versión no aceptada la vuelve actual
// TO DO: Voto de aceptación sin permisos a una versión aceptada no hace nada
// TO DO: Voto de rechazo sin suficientes permisos a una versión aceptada no hace nada
// TO DO: Voto de rechazo con suficientes permisos a una versión aceptada, incluso si tiene votos de aceptación del mismo nivel
// TO DO: Voto de rechazo a una versión no hace nada si hay un voto de rechazo de aceptación de mayor nivel
// TO DO: Voto de aceptación a una versión no hace nada si hay un voto de aceptación de mayor nivel
// TO DO: Eliminaciones de votos...
// Probablemente no haga falta testear todos estos

describe('Create topic vote', { timeout: 30000 }, () => {
    let ctx : AppContext | undefined
    beforeAll(async () => {
        ctx = await createTestContext()
        await ctx.worker?.setup(ctx)
    }, 20000)

    beforeEach(async () => {
        await cleanUPTestDataFromDB(ctx!, testSuite)
        await ctx!.worker?.clear()
    }, 20000)

    it("should add one to the counter", async () => {
        const user = await createTestUser(ctx!, "test.cabildo.ar", testSuite)
        const topicVersion = await createTestTopicVersion(ctx!, user, testSuite)

        await processRecordsInTest(ctx!, [topicVersion])

        const {data: topicView1} = await getTopicVersion(
            ctx!, topicVersion.ref.uri, user)

        expect(topicView1).not.toBeFalsy()
        expect(topicView1!.currentVersion).toEqual(topicVersion.ref.uri)

        const vote = await createTestAcceptVote(ctx!, user, topicVersion.ref, testSuite)

        const {data: topicView2} = await getTopicVersion(ctx!, topicVersion.ref.uri, user)

        expect(topicView2).not.toBeFalsy()
        expect(topicView2!.status).not.toBeFalsy()
        expect(topicView2!.status!.accepted).toEqual(true)
        expect(topicView2!.status!.voteCounts.length).toEqual(1)
        expect(topicView2!.status!.voteCounts[0].accepts).toEqual(1)
        expect(topicView2!.status!.voteCounts[0].rejects).toEqual(0)

        // un segundo voto positivo
        const vote2 = await createTestAcceptVote(ctx!, user, topicVersion.ref, testSuite)

        const {data: topicView3} = await getTopicVersion(ctx!, topicVersion.ref.uri, user)
        expect(topicView3).not.toBeFalsy()
        expect(topicView3!.status).not.toBeFalsy()
        expect(topicView3!.status!.accepted).toEqual(true)
        expect(topicView3!.status!.voteCounts.length).toEqual(1)
        expect(topicView3!.status!.voteCounts[0].accepts).toEqual(1)
        expect(topicView3!.status!.voteCounts[0].rejects).toEqual(0)

        const agent = new MockSessionAgent(user)
        const votes = await getTopicVersionVotes(ctx!, agent, topicVersion.ref.uri)
        expect(votes).not.toBeFalsy()
        expect(votes!.length).toEqual(1)

        await deleteRecordsInTest(ctx!, [vote.ref.uri])

        const {data: topicView4} = await getTopicVersion(ctx!, topicVersion.ref.uri, user)

        expect(topicView4).not.toBeFalsy()
        expect(topicView4!.status).not.toBeFalsy()
        expect(topicView4!.status!.accepted).toEqual(true)
        expect(topicView4!.status!.voteCounts.length).toEqual(1)
        expect(topicView4!.status!.voteCounts[0].accepts).toEqual(1)
        expect(topicView4!.status!.voteCounts[0].rejects).toEqual(0)

        await deleteRecordsInTest(ctx!, [vote2.ref.uri])

        const votes2 = await getTopicVersionVotes(ctx!, agent, topicVersion.ref.uri)
        expect(votes2).not.toBeFalsy()
        expect(votes2!.length).toEqual(0)
    }, {timeout: 20000})

    afterAll(async () => cleanUpAfterTests(ctx!))
})


describe('Create topic version', { timeout: 20000 }, () => {
    let ctx : AppContext | undefined
    beforeAll(async () => {
        ctx = await createTestContext()
        await ctx.worker?.setup(ctx)
    }, 20000)

    beforeEach(async () => {
        await cleanUPTestDataFromDB(ctx!, testSuite)
        await ctx!.worker?.clear()
    }, 20000)

    it("should be created with the text", async () => {
        const user = await createTestUser(ctx!, "test.cabildo.ar", testSuite)
        const topicVersion = await getTopicVersionRefAndRecord(
            ctx!,
            "tema de prueba",
            "texto",
            new Date(),
            user,
            testSuite
        )

        await processRecordsInTest(ctx!, [topicVersion])

        const {data: topicView1} = await getTopicVersion(
            ctx!, topicVersion.ref.uri, user)

        expect(topicView1).not.toBeFalsy()
        expect(topicView1!.currentVersion).toEqual(topicVersion.ref.uri)
        expect(topicView1!.text).toEqual("texto")
    })

    afterAll(async () => cleanUpAfterTests(ctx!))
})


describe('Get discussion', { timeout: 20000 }, () => {
    let ctx : AppContext | undefined
    beforeAll(async () => {
        ctx = await createTestContext()
        await ctx.worker?.setup(ctx)
    }, 20000)

    beforeEach(async () => {
        await cleanUPTestDataFromDB(ctx!, testSuite)
        await ctx!.worker?.clear()
    }, 20000)

    it("should return a post", async () => {
        const user = await createTestUser(ctx!, "test.cabildo.ar", testSuite)
        const topicVersion = await getTopicVersionRefAndRecord(
            ctx!,
            "tema de prueba",
            "texto",
            new Date(),
            user,
            testSuite
        )

        await processRecordsInTest(ctx!, [topicVersion])

        const {data: topicView1} = await getTopicVersion(
            ctx!, topicVersion.ref.uri, user)

        expect(topicView1).not.toBeFalsy()
        expect(topicView1!.currentVersion).toEqual(topicVersion.ref.uri)

        const post = await getPostRefAndRecord(
            "prueba 2",
            new Date(),
            testSuite,
            {did: user},
            topicVersion.ref
        )
        await processRecordsInTest(ctx!, [post])

        const agent = new MockSessionAgent(user)

        const feed = await getTopicFeed(
            ctx!,
            agent,
            {
                params: {kind: "discussion"},
                query: {
                    i: "tema de prueba"
                }
            }
        )
        expect(feed.data).not.toBeFalsy()

        const postOnFeed = feed.data!.feed
            .find(e => ArCabildoabiertoFeedDefs.isPostView(e.content) &&
                e.content.uri == post.ref.uri)

        expect(postOnFeed).not.toBeFalsy()
    })

    afterAll(async () => cleanUpAfterTests(ctx!))
})


/*describe('Create reject vote', { timeout: 20000 }, () => {
    let ctx : AppContext | undefined
    beforeAll(async () => {
        ctx = await createTestContext()
        await ctx.worker?.setup(ctx)
    }, 20000)

    beforeEach(async () => {
        await cleanUPTestDataFromDB(ctx!, testSuite)
        await ctx!.worker?.clear()
    }, 20000)


    it("should have ref to reason and add one to the counter", async () => {
        const user = await createTestUser(ctx!, "test.cabildo.ar", testSuite)
        const topicVersion = await getTopicVersionRefAndRecord(
            ctx!,
            "tema de prueba",
            "texto",
            new Date(),
            user,
            testSuite
        )

        await processRecordsInTest(ctx!, [topicVersion])

        const {data: topicView1} = await getTopicVersion(
            ctx!, topicVersion.ref.uri, user)

        expect(topicView1).not.toBeFalsy()
        expect(topicView1!.currentVersion).toEqual(topicVersion.ref.uri)

        const reasonPost = await getPostRefAndRecord(
            "prueba",
            new Date(),
            testSuite,
            {did: user},
            topicVersion.ref
        )

        await processRecordsInTest(ctx!, [reasonPost])

        const vote = await getRejectVoteRefAndRecord(
            ctx!,
            topicVersion.ref,
            new Date(),
            user,
            reasonPost.ref,
            testSuite,
        )
        await processRecordsInTest(ctx!, [vote])

        const agent = new MockSessionAgent(user)
        const votes = await getTopicVersionVotes(ctx!, agent, topicVersion.ref.uri)

        expect(votes.length).toEqual(1)
        expect(getCollectionFromUri(votes[0].uri)).toEqual("ar.cabildoabierto.wiki.voteReject")

        const {data: topicView2} = await getTopicVersion(
            ctx!,
            topicVersion.ref.uri,
            user
        )

        expect(topicView2).not.toBeFalsy()
        expect(topicView2!.status).not.toBeFalsy()
        expect(topicView2!.status!.accepted).toEqual(false)
        expect(topicView2!.status!.voteCounts.length).toEqual(1)
        expect(topicView2!.status!.voteCounts[0].accepts).toEqual(0)
        expect(topicView2!.status!.voteCounts[0].rejects).toEqual(1)

        const anotherPost = await getPostRefAndRecord(
            "prueba 2",
            new Date(),
            testSuite,
            {did: user},
            topicVersion.ref
        )

        await processRecordsInTest(ctx!, [anotherPost])

        const feed = await getTopicFeed(
            ctx!,
            agent,
            {
                params: {kind: "discussion"},
                query: {
                    i: "tema de prueba"
                }
            }
        )
        expect(feed.data).not.toBeFalsy()
        expect(feed.data?.feed.length).toEqual(2)

        const reasonInFeed = feed.data!.feed
            .find(e => isPostView(e.content) &&
                e.content.uri == reasonPost.ref.uri)

        const otherPostInFeed = feed.data!.feed
            .find(e => isPostView(e.content) &&
                e.content.uri == anotherPost.ref.uri)

        expect(reasonInFeed).not.toBeFalsy()
        expect(otherPostInFeed).not.toBeFalsy()
        expect(isPostView(reasonInFeed!.content) ? reasonInFeed!.content.voteContext?.authorVotingState : "").toEqual("reject")
        expect(isPostView(otherPostInFeed!.content) ? otherPostInFeed!.content.voteContext?.authorVotingState : "").toEqual("reject")
        const voteInContext = isPostView(reasonInFeed!.content) ? reasonInFeed!.content.voteContext?.vote : null
        expect(voteInContext).not.toBeFalsy()
        expect(voteInContext!.uri).toEqual(vote.ref.uri)
    })

    afterAll(async () => cleanUpAfterTests(ctx!))
})*/