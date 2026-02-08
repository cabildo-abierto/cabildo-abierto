import {EffHandler} from "#/utils/handler.js";
import { ArCabildoabiertoEmbedPoll, ArCabildoabiertoEmbedPollVote } from "@cabildo-abierto/api";
import {Effect} from "effect";
import {DBSelectError} from "#/utils/errors.js";
import {jsonArrayFrom} from "kysely/helpers/postgres";
import {count, getCollectionFromUri, getDidFromUri, unique} from "@cabildo-abierto/utils";
import {NotFoundError} from "#/services/dataset/read.js";
import {AppContext} from "#/setup.js";
import {Agent, SessionAgent} from "#/utils/session-agent.js";
import {CIDEncodeError, getPollId, PollIdMismatchError} from "#/services/write/topic.js";
import {ATCreateRecordError} from "#/services/wiki/votes.js";
import {RefAndRecord} from "#/services/sync/types.js";
import {getRecordProcessor} from "#/services/sync/event-processing/get-record-processor.js";
import {$Typed} from "@atproto/api";
import {deleteRecords} from "#/services/delete.js";


export const getPollHandler: EffHandler<{params: {id: string}}, ArCabildoabiertoEmbedPoll.View> = (ctx, agent, {params}) => Effect.gen(function* () {
    const {id} = params
    return yield* getPoll(ctx, agent, id)
}).pipe(
    Effect.catchTag("NotFoundError", () => Effect.fail("No se encontró la encuesta.")),
    Effect.catchTag("DBSelectError", () => Effect.fail("Ocurrió un error al obtener la encuesta."))
)


const getPoll = (
    ctx: AppContext,
    agent: Agent,
    id: string
): Effect.Effect<ArCabildoabiertoEmbedPoll.View, DBSelectError | NotFoundError> => Effect.gen(function* () {
    const poll = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("Poll")
            .select([
                "id",
                "choices",
                "createdAt",
                "description",
                "topicId",
                "parentRecordId",
                eb => jsonArrayFrom(eb
                    .selectFrom("PollVote")
                    .innerJoin("Record", "Record.uri", "PollVote.uri")
                    .where("PollVote.pollId", "=", id)
                    .select(["PollVote.choice", "PollVote.uri"])
                    .orderBy("created_at_tz desc")
                ).as("votes")
            ])
            .where("id", "=", id)
            .executeTakeFirst(),
        catch: error => new DBSelectError(error)
    })

    if(!poll) {
        return yield* Effect.fail(new NotFoundError("Poll not found"))
    }

    const uniqueVotes = unique(poll.votes, v => getDidFromUri(v.uri))

    const votes = poll.choices.map(c => count(uniqueVotes, v => v.choice == c))

    const userVote = agent.hasSession() ? uniqueVotes.find(v => getDidFromUri(v.uri) == agent.did) : undefined
    const viewer: ArCabildoabiertoEmbedPoll.PollViewer = {
        $type: "ar.cabildoabierto.embed.poll#pollViewer",
        choice: userVote?.choice,
        voteUri: userVote?.uri
    }

    return {
        $type: "ar.cabildoabierto.embed.poll#view",
        poll: {
            $type: "ar.cabildoabierto.embed.poll#poll",
            choices: poll.choices.map(c => {
                return {
                    $type: "ar.cabildoabierto.embed.poll#pollChoice",
                    label: c
                }
            }),
            description: poll.description ?? undefined,
            createdAt: poll.createdAt.toISOString(),
            containerRef: {
                topicId: poll.topicId ?? undefined,
                uri: poll.parentRecordId ?? undefined
            }
        },
        id: poll.id,
        votes,
        viewer
    }
})


export function pollViewToMain(view: ArCabildoabiertoEmbedPoll.View): Effect.Effect<$Typed<ArCabildoabiertoEmbedPoll.Main>, CIDEncodeError | PollIdMismatchError> {
    return getPollId(view.poll).pipe(Effect.flatMap(cid => {
        if(view.id != "unpublished" && view.id != cid) {
            return Effect.fail(new PollIdMismatchError())
        }

        return Effect.succeed({
            $type: "ar.cabildoabierto.embed.poll",
            poll: view.poll,
            id: cid
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
    DBSelectError | NotFoundError | CIDEncodeError | PollIdMismatchError | ATCreateRecordError
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
        try: () => agent.bsky.com.atproto.repo.putRecord({
            repo: agent.did,
            collection: "ar.cabildoabierto.embed.pollVote",
            rkey: pollId,
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
            .select(["PollVote.uri"])
            .execute(),
        catch: error => new DBSelectError(error)
    })

    if(curVotes.length > 0){
        yield* deleteRecords({ctx, agent, uris: curVotes.map(u => u.uri), atproto: true})
    }
}).pipe(Effect.withSpan("deletePollVotes", {attributes: {pollId}}))


export const votePollHandler: EffHandler<{pollId: string, choiceIdx: number}, void> = (ctx, agent, params) => Effect.gen(function* () {
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
)


export const cancelVotePollHandler: EffHandler<{pollId: string}, void> = (ctx, agent, params) => Effect.gen(function* () {
    const {pollId} = params

    yield* deletePollVotes(ctx, agent, pollId)

    return {}
}).pipe(
    Effect.catchAll(() => {
        return Effect.fail("Ocurrió un error al cancelar el voto.")
    })
)