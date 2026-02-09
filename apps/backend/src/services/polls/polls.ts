import {EffHandler} from "#/utils/handler.js";
import {ArCabildoabiertoEmbedPoll, ArCabildoabiertoEmbedPollVote } from "@cabildo-abierto/api";
import {Effect} from "effect";
import {DBSelectError} from "#/utils/errors.js";
import {
    count,
    getCollectionFromUri,
    getDidFromUri,
    getPollContainerFromId,
    getPollKeyFromId,
    splitUri, sum,
    unique
} from "@cabildo-abierto/utils";
import {NotFoundError} from "#/services/dataset/read.js";
import {AppContext} from "#/setup.js";
import {Agent, SessionAgent} from "#/utils/session-agent.js";
import {CIDEncodeError, getPollKey, PollIdMismatchError} from "#/services/write/topic.js";
import {ATCreateRecordError} from "#/services/wiki/votes.js";
import {RefAndRecord} from "#/services/sync/types.js";
import {getRecordProcessor} from "#/services/sync/event-processing/get-record-processor.js";
import {$Typed} from "@atproto/api";
import {deleteRecords} from "#/services/delete.js";
import {getTopicIdFromTopicVersionUri} from "#/services/wiki/current-version.js";
import {InsufficientParamsError} from "#/services/wiki/topics.js";
import {DataPlane, makeDataPlane} from "#/services/hydration/dataplane.js";
import {hydrateProfileViewBasic} from "#/services/hydration/profile.js";


export const getPollHandler: EffHandler<{params: {id: string}}, ArCabildoabiertoEmbedPoll.View> = (
    ctx,
    agent,
    {params}
) => Effect.provideServiceEffect(Effect.gen(function* () {
    const {id} = params
    return yield* getPoll(ctx, agent, id)
}).pipe(
    Effect.catchTag("HydrationDataUnavailableError", () => Effect.fail("Ocurrió un error al obtener la encuesta.")),
    Effect.catchTag("NotFoundError", () => Effect.fail("No se encontró la encuesta.")),
    Effect.catchTag("DBSelectError", () => Effect.fail("Ocurrió un error al obtener la encuesta."))
), DataPlane, makeDataPlane(ctx, agent))



const normalizePollId = (
    ctx: AppContext,
    id: string
): Effect.Effect<string, DBSelectError | NotFoundError> => Effect.gen(function* () {
    const container = getPollContainerFromId(id)
    if(container.uri) {
        const {did, collection, rkey} = splitUri(container.uri)
        if(collection == "ar.cabildoabierto.wiki.topicVersion") {
            const topicId = yield* getTopicIdFromTopicVersionUri(ctx, did, rkey)
            return `ca://${topicId}`
        }
    }
    return id
})



const getPoll = (
    ctx: AppContext,
    agent: Agent,
    id: string
): Effect.Effect<ArCabildoabiertoEmbedPoll.View, DBSelectError | NotFoundError | HydrationDataUnavailableError, DataPlane> => Effect.gen(function* () {
    const dataplane = yield* DataPlane

    id = yield* normalizePollId(ctx, id)

    yield* dataplane.fetchPollsHydrationData([id])

    return yield* hydratePollView(ctx, agent, id)
}).pipe(Effect.withSpan("getPoll", {attributes: {id}}))


export function pollViewToMain(view: ArCabildoabiertoEmbedPoll.View): Effect.Effect<$Typed<ArCabildoabiertoEmbedPoll.Main>, CIDEncodeError | PollIdMismatchError> {
    return getPollKey(view.poll).pipe(Effect.flatMap(key => {
        if(view.key != "unpublished" && view.key != key) {
            return Effect.fail(new PollIdMismatchError())
        }

        return Effect.succeed({
            $type: "ar.cabildoabierto.embed.poll",
            poll: view.poll,
            key
        })
    }))
}


const createPollVoteAT = (
    ctx: AppContext,
    agent: SessionAgent,
    pollId: string,
    choiceIdx: number
): Effect.Effect<
    RefAndRecord<ArCabildoabiertoEmbedPollVote.Record>,
    DBSelectError | NotFoundError | CIDEncodeError | PollIdMismatchError | ATCreateRecordError | HydrationDataUnavailableError,
    DataPlane
> => Effect.gen(function* () {

    const poll = yield* getPoll(ctx, agent, pollId)
    const choice = poll.poll.choices[choiceIdx].label

    const vote: ArCabildoabiertoEmbedPollVote.Record = {
        $type: "ar.cabildoabierto.embed.pollVote",
        subjectId: pollId,
        subjectPoll: poll.poll,
        choice,
        createdAt: new Date().toISOString()
    }

    const res = yield* Effect.tryPromise({
        try: () => agent.bsky.com.atproto.repo.createRecord({
            repo: agent.did,
            collection: "ar.cabildoabierto.embed.pollVote",
            record: vote
        }),
        catch: () => new ATCreateRecordError()
    })

    if(res.success) {
        return {
            ref: {cid: res.data.cid, uri: res.data.uri},
            record: vote
        }
    } else {
        return yield* Effect.fail(new ATCreateRecordError())
    }
}).pipe(Effect.withSpan("createPollAT", {attributes: {pollId, choiceIdx}}))


const deletePollVotes = (
    ctx: AppContext,
    agent: SessionAgent,
    pollId: string
) => Effect.gen(function* () {
    const curVotes = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("PollVote")
            .where("pollId", "=", pollId)
            .innerJoin("Record", "Record.uri", "PollVote.uri")
            .where("Record.authorId", "=", agent.did)
            .select(["PollVote.uri"])
            .execute(),
        catch: error => new DBSelectError(error)
    })

    if(curVotes.length > 0){
        yield* deleteRecords({ctx, agent, uris: curVotes.map(u => u.uri), atproto: true})
    }
}).pipe(Effect.withSpan("deletePollVotes", {attributes: {pollId}}))


export const votePollHandler: EffHandler<{pollId: string, choiceIdx: number}, void> = (
    ctx,
    agent,
    params
) => Effect.provideServiceEffect(Effect.gen(function* () {
    const {pollId, choiceIdx} = params

    yield* deletePollVotes(ctx, agent, pollId)

    const refAndRecord = yield* createPollVoteAT(ctx, agent, pollId, choiceIdx)

    yield* getRecordProcessor(ctx, getCollectionFromUri(refAndRecord.ref.uri)).processValidated(
        [refAndRecord]
    )

    return {}
}).pipe(
    Effect.catchAll(() => {
        return Effect.fail("Ocurrió un error al crear el voto.")
    })
), DataPlane, makeDataPlane(ctx, agent))


export const cancelVotePollHandler: EffHandler<{pollId: string}, void> = (ctx, agent, params) => Effect.gen(function* () {
    const {pollId} = params

    yield* deletePollVotes(ctx, agent, pollId)

    return {}
}).pipe(
    Effect.catchAll(() => {
        return Effect.fail("Ocurrió un error al cancelar el voto.")
    })
)


export const getTopicPolls: EffHandler<
    {query: {did?: string, rkey?: string, topicId?: string}},
    ArCabildoabiertoEmbedPoll.View[]
> = (ctx, agent, {query}) => Effect.provideServiceEffect(Effect.gen(function* () {
    let {topicId, did, rkey} = query

    if(!topicId) {
        if(!did || !rkey) {
            return yield* Effect.fail(new InsufficientParamsError())
        }
        topicId = yield* getTopicIdFromTopicVersionUri(ctx, did, rkey)
    }

    const polls = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("Poll")
            .where("topicId", "=", topicId)
            .select(["id"])
            .orderBy("createdAt desc")
            .execute(),
        catch: () => new DBSelectError()
    })

    const dataplane = yield* DataPlane

    yield* dataplane.fetchPollsHydrationData(polls.map(p => p.id))

    return (yield* Effect.all(
        polls.map(p => hydratePollView(ctx, agent, p.id))
    )).filter(x => sum(x.votes, x => x) > 0)
}).pipe(Effect.catchAll(() => {
    return Effect.fail("Ocurrió un error al obtener las encuestas.")
})), DataPlane, makeDataPlane(ctx, agent))


export class HydrationDataUnavailableError {
    readonly _tag = "HydrationDataUnavailableError"
}


const hydratePollView = (ctx: AppContext, agent: Agent, pollId: string): Effect.Effect<ArCabildoabiertoEmbedPoll.View, HydrationDataUnavailableError, DataPlane> => Effect.gen(function* () {
    const dataplane = yield* DataPlane
    const data = dataplane.getState().polls.get(pollId)
    if(!data) {
        return yield* Effect.fail(new HydrationDataUnavailableError())
    }

    const uniqueVotes = unique(data.votes, v => getDidFromUri(v.uri))

    const votes = data.choices.map(c => count(uniqueVotes, v => v.choice == c))

    const userVote = agent.hasSession() ? uniqueVotes.find(v => getDidFromUri(v.uri) == agent.did) : undefined
    const viewer: ArCabildoabiertoEmbedPoll.PollViewer = {
        $type: "ar.cabildoabierto.embed.poll#pollViewer",
        choice: userVote?.choice,
        voteUri: userVote?.uri
    }

    const poll: ArCabildoabiertoEmbedPoll.View = {
        $type: "ar.cabildoabierto.embed.poll#view",
        key: getPollKeyFromId(pollId),
        poll: {
            $type: "ar.cabildoabierto.embed.poll#poll",
            choices: data.choices.map(c => ({label: c})),
            description: data.description ?? undefined
        },
        votes,
        viewer
    }
    return poll
}).pipe(Effect.withSpan("hydratePollView", {attributes: {pollId}}))


export const getPollVotes: EffHandler<
    {params: {id: string}},
    ArCabildoabiertoEmbedPollVote.View[]
> = (
    ctx,
    agent,
    {params}
) => Effect.provideServiceEffect(Effect.gen(function* () {
    const votes = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("PollVote")
            .where("PollVote.pollId", "=", params.id)
            .select(["uri", "choice"])
            .execute(),
        catch: () => new DBSelectError()
    })

    const dataplane = yield* DataPlane

    yield* dataplane.fetchProfileViewBasicHydrationData(votes.map(v => getDidFromUri(v.uri)))

    return (yield* Effect.all(votes.map(v => Effect.gen(function* () {
        const author = yield* hydrateProfileViewBasic(ctx, getDidFromUri(v.uri))
        if(!author) return null
        return {
            author,
            choice: v.choice
        }
    })))).filter(x => x != null)
}).pipe(Effect.withSpan("getPollVotes")).pipe(Effect.catchAll(() => Effect.fail("Ocurrió un error al obtener los votos."))), DataPlane, makeDataPlane(ctx, agent))