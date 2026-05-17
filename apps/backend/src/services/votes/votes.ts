import {deleteRecordAT} from "#/services/delete.js";
import {reactionRecordProcessor} from "#/services/sync/event-processing/reaction.js";
import {processValidatedRecords} from "#/services/record/processing.js";
import {ProcessCreateError} from "#/services/record/processing.js";
import {ArCabildoabiertoWikiTopic, ArCabildoabiertoWikiVote, ATProtoStrongRef, CreatePostProps} from "@cabildo-abierto/api";
import {BaseAgent, SessionAgent} from "#/utils/session-agent.js";
import {AppContext} from "#/setup.js";
import {getCollectionFromUri, getDidFromUri, getUri, isTopicVersion} from "@cabildo-abierto/utils";
import {EffHandler, EffHandlerNoAuth} from "#/utils/handler.js";
import {
    ArCabildoabiertoWikiDefs
} from "@cabildo-abierto/api"
import {DataPlane, FetchFromBskyError, makeDataPlane} from "#/services/hydration/dataplane.js";
import {hydrateProfileViewBasic} from "#/services/hydration/profile.js";
import {ATDeleteRecordError} from "#/services/delete.js";
import {Effect} from "effect";
import {DBSelectError} from "#/utils/errors.js";
import {InsertRecordError} from "#/services/record/processing.js";
import {AddJobError, InvalidValueError, UpdateRedisError} from "#/utils/errors.js";
import {CIDEncodeError} from "#/services/write/topic.js";
import {ProcessDeleteError, processDeletes} from "#/services/sync/event-processing/delete-processor.js";
import {NotImplementedError} from "#/services/discussion/thread.js";


type ATCreateReactionError = InvalidValueError | ATCreateRecordError | NotImplementedError


export function getTopicVersionStatusFromReactions(
    ctx: AppContext,
    reactions: { uri: string, editorStatus: string }[]
): ArCabildoabiertoWikiTopic.TopicVersionStatus {
    const byEditorStatus = new Map<string, string[]>()
    reactions.forEach(r => {
        const cur = byEditorStatus.get(r.editorStatus)
        if (cur) {
            cur.push(r.uri)
        } else {
            byEditorStatus.set(r.editorStatus, [r.uri])
        }
    })

    const voteCounts: ArCabildoabiertoWikiTopic.TopicVersionStatus["voteCounts"] = Array.from(byEditorStatus.entries()).map(([k, v]) => {
        return {
            $type: "ar.cabildoabierto.wiki.topic#categoryVotes",
            accepts: new Set(v
                .filter(v => getCollectionFromUri(v) == "ar.cabildoabierto.wiki.voteAccept")
                .map(getDidFromUri))
                .size,
            rejects: new Set(v
                .filter(v => getCollectionFromUri(v) == "ar.cabildoabierto.wiki.voteReject")
                .map(getDidFromUri))
                .size,
            category: k
        }
    })

    return {
        voteCounts,
        accepted: isVersionAccepted(
            ctx,
            voteCounts
        )
    }
}


const createWikiVoteAT = (
    agent: SessionAgent,
    subject: ATProtoStrongRef,
    label: string
): Effect.Effect<ATProtoStrongRef, ATCreateReactionError> => {
    const c = getCollectionFromUri(subject.uri)
    if(isTopicVersion(c)) {
        return createTopicVersionVote(agent, subject, label)
    } else {
        return Effect.fail(new NotImplementedError())
    }
}


export const createWikiVote = (
    ctx: AppContext,
    agent: SessionAgent,
    ref: ATProtoStrongRef,
    label: string
): Effect.Effect<{uri: string}, ProcessCreateError | ATCreateReactionError> => {

    return Effect.gen(function* () {
        const res = yield* createWikiVoteAT(
            agent,
            ref,
            label
        )

        const record: ArCabildoabiertoWikiVote.Record = {
            $type: "ar.cabildoabierto.wiki.vote",
            subject: ref,
            createdAt: new Date().toISOString()
        }

        yield* processValidatedRecords(ctx, [{ref: res, record}], reactionRecordProcessor)
        return {uri: res.uri}
    })
}


export const removeWikiVoteAT = (
    ctx: AppContext,
    agent: SessionAgent,
    uri: string
): Effect.Effect<void, ATDeleteRecordError | ProcessDeleteError> => {
    return Effect.gen(function* () {
        yield* deleteRecordAT(agent, uri)
        yield* processDeletes(ctx, [uri])
    })
}

export function isWikiVote(collection: string): collection is "ar.cabildoabierto.wiki.vote" {
    return collection == "ar.cabildoabierto.wiki.vote"
}

export class ATCreateRecordError {
    readonly _tag = "ATCreateRecordError"
    name: string | undefined
    message: string | undefined
    constructor(error?: unknown) {
        if(error && error instanceof Error) {
            this.name = error?.name
            this.message = error?.message
        }
    }
}


export class ATGetRecordError {
    readonly _tag = "ATGetRecordError"
    name: string | undefined
    message: string | undefined
    constructor(error?: unknown) {
        if(error && error instanceof Error) {
            this.name = error?.name
            this.message = error?.message
        }
    }
}


export const createTopicVersionVote = (agent: SessionAgent, ref: ATProtoStrongRef, label: string): Effect.Effect<ATProtoStrongRef, ATCreateRecordError> => {
    const record: ArCabildoabiertoWikiVote.Record = {
        $type: "ar.cabildoabierto.wiki.vote",
        createdAt: new Date().toISOString(),
        subject: ref,
        label
    }

    return Effect.tryPromise({
        try: () => agent.bsky.com.atproto.repo.createRecord({
            record,
            collection: "ar.cabildoabierto.wiki.vote",
            repo: agent.did
        }),
        catch: () => new ATCreateRecordError()
    }).pipe(Effect.flatMap(({data}) => {
        return Effect.succeed({uri: data.uri, cid: data.cid})
    }))

}


export const wikiVoteHandler: EffHandler<{
    reason?: CreatePostProps,
    force?: boolean,
    params: { vote: string, rkey: string, did: string, cid: string }
}, { uri: string }> = (
    ctx: AppContext, agent: SessionAgent, {reason, force, params}
) => {
    const {vote, rkey, did, cid} = params
    const uri = getUri(did, "ar.cabildoabierto.wiki.topicVersion", rkey)
    const ref = {uri, cid}

    if (vote != "accept" && vote != "reject") {
        return Effect.fail(`Voto inválido: ${vote}.`)
    }

    return voteEdit(ctx, agent, vote, ref, reason, force).pipe(
        Effect.catchAll(error => {
            if(typeof error == "string") return Effect.fail(error)
            if(error._tag == "NeedToDeleteReasonError") {
                return Effect.fail("Agregar un voto positivo eliminaría la justificación del voto de rechazo.")
            } else if(error._tag == "InvalidValueError") {
                return Effect.fail("Reacción inválida.")
            } else {
                return Effect.fail("Ocurrió un error al crear el voto.")
            }
        })
    )
}


export const voteEdit = (
    ctx: AppContext,
    agent: SessionAgent,
    vote: "accept" | "reject",
    ref: ATProtoStrongRef,
    reason?: CreatePostProps,
    force: boolean = false
): Effect.Effect<{ uri: string },
    string |
    NeedToDeleteReasonError |
    ATCreateRecordError |
    InsertRecordError |
    InvalidValueError |
    UpdateRedisError |
    AddJobError |
    CIDEncodeError
> => Effect.gen(function* () {
    const {uri} = ref

    yield* Effect.annotateCurrentSpan({
        uri,
        vote
    })

    return yield* Effect.fail("Sin implmenetar.")

    /*const type = "ar.cabildoabierto.wiki.vote"

    if (vote == "accept" && reason) {
        return yield* Effect.fail("Por ahora no se permiten justificaciones en votos positivos.")
    }

    if (vote == "reject" && !reason) {
        return yield* Effect.fail("Los votos negativos requieren una justificación.")
    }

    const existing = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("Reaction")
            .innerJoin("Record", "Record.uri", "Reaction.uri")
            .select("Record.uri")
            .where("Reaction.subjectId", "=", uri)
            .where("Record.authorId", "=", agent.did)
            .execute(),
        catch: () => "Ocurrió un error al crear el voto."
    })

    yield* Effect.annotateCurrentSpan({existing})

    if (existing.length > 0) {
        // TO DO: Si llegase a haber más de una posiblemente haya que tener más cuidado.
        // si ya existe una reacción del mismo tipo no hacemos nada
        if (getCollectionFromUri(existing[0].uri) == "ar.cabildoabierto.wiki.voteAccept" && vote == "accept") {
            return {uri: existing[0].uri}
        } else if (getCollectionFromUri(existing[0].uri) == "ar.cabildoabierto.wiki.voteReject" && vote == "reject") {
            return {uri: existing[0].uri}
        } else if (vote == "reject") {
            // está pasando de aceptar a rechazar
            yield* cancelEditVote(ctx, agent, existing[0].uri, force).pipe(Effect.catchAll(() => {
                return Effect.fail("Ocurrió un error al cambiar el voto.")
            }))

        } else if (vote == "accept") {
            // está pasando de rechazar a aceptar
            if (!force) {
                return yield* Effect.fail(new NeedToDeleteReasonError())
            }

            yield* cancelEditVote(ctx, agent, existing[0].uri, force).pipe(Effect.catchAll(() => {
                return Effect.fail("Ocurrió un error al cambiar el voto.")
            }))
        }
    }

    return yield* createWikiVote(
        ctx,
        agent,
        ref,
        type
    )*/
}).pipe(
    Effect.withSpan("voteEdit")
)



export const cancelEditVoteHandler: EffHandler<{
    params: { collection: string, rkey: string }
    force?: boolean
}> = (ctx: AppContext, agent: SessionAgent, {params, force}) => {
    const {collection, rkey} = params
    const uri = getUri(agent.did, collection, rkey)
    return cancelEditVote(ctx, agent, uri, force).pipe(
        Effect.catchAll(error => {
            if(error._tag == "NeedToDeleteReasonError") {
                return Effect.fail("Cancelar este voto eliminaría la justificación de tu voto negativo.")
            } else if(error._tag == "VoteNotFoundError") {
                return Effect.fail("No se encontró el voto a cancelar.")
            } else {
                return Effect.fail("Ocurrió un error al cancelar el voto.")
            }
        })
    ).pipe(Effect.flatMap(() => Effect.succeed({})))
}


export class VoteNotFoundError {
    readonly _tag = "VoteNotFoundError"
}

export class NeedToDeleteReasonError {
    readonly _tag = "NeedToDeleteReasonError"
}


export class DeleteVoteReasonError {
    readonly _tag = "DeleteVoteReasonError"
}


export function cancelEditVote(ctx: AppContext, agent: SessionAgent, uri: string, force: boolean = false): Effect.Effect<void, VoteNotFoundError | NeedToDeleteReasonError | DeleteVoteReasonError | ATDeleteRecordError | ProcessDeleteError> {
    return Effect.void
    /*return Effect.gen(function* () {
        const collection = getCollectionFromUri(uri)
        if(collection == "ar.cabildoabierto.wiki.voteReject") {
            const reject = yield* Effect.tryPromise({
                try: () => ctx.kysely
                    .selectFrom("VoteReject")
                    .where("VoteReject.uri", "=", uri)
                    .select("VoteReject.reasonId")
                    .executeTakeFirstOrThrow(),
                catch: () => new VoteNotFoundError()
            })
            yield* Effect.annotateCurrentSpan({reason: reject.reasonId ?? "no reason"})
            if(reject.reasonId){
                if(!force) {
                    return yield* Effect.fail(new NeedToDeleteReasonError())
                }
                yield* deleteRecords({
                    ctx,
                    agent,
                    atproto: true,
                    uris: [reject.reasonId]
                }).pipe(Effect.catchAll(() => {
                    return Effect.fail(new DeleteVoteReasonError())
                }))
            } else {
                // hay un reject pero no tiene reasonId, continuamos con el delete
            }
        }

        return yield* removeWikiVoteAT(ctx, agent, uri)
    }).pipe(Effect.withSpan("cancelEditVote", {attributes: {uri, force}}))*/
}


export const getTopicVersionVotes = (
    ctx: AppContext,
    agent: BaseAgent,
    uri: string
): Effect.Effect<ArCabildoabiertoWikiDefs.VoteView[], DBSelectError | FetchFromBskyError, DataPlane> => Effect.gen(function* () {

    const reactions = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("Reaction")
            .innerJoin("Record", "Record.uri", "Reaction.uri")
            .where("Reaction.subjectId","=", uri)
            .where("Record.collection", "in", [
                "ar.cabildoabierto.wiki.voteAccept",
                "ar.cabildoabierto.wiki.voteReject"
            ])
            .select([
                "Reaction.uri",
                "Record.cid",
                "Reaction.subjectId",
                "Reaction.subjectCid"
            ])
            .orderBy("Record.authorId")
            .orderBy("Record.createdAt desc")
            .distinctOn(["Record.authorId"])
            .execute(),
        catch: (error) => new DBSelectError(error)
    })

    const votes = reactions
        .filter(r => isWikiVote(getCollectionFromUri(r.uri)))
        .map(r => r.cid && r.subjectCid && r.subjectId ? {...r, subjectId: r.subjectId, subjectCid: r.subjectCid, cid: r.cid} : null)
        .filter(r => r != null)

    const users = votes.map(v => getDidFromUri(v.uri))
    const dataplane = yield* DataPlane
    yield* dataplane.fetchProfileViewBasicHydrationData(users)

    const voteViews: (ArCabildoabiertoWikiDefs.VoteView | null)[] = yield* Effect.all(votes.map(v => Effect.gen(function* () {
        const author = yield* hydrateProfileViewBasic(ctx, getDidFromUri(v.uri))
        if(!author) {
            return null
        }
        const vote: ArCabildoabiertoWikiDefs.VoteView = {
            $type: "ar.cabildoabierto.wiki.defs#voteView",
            uri: v.uri,
            cid: v.cid,
            subject: {
                uri: v.subjectId,
                cid: v.subjectCid
            },
            author
        }
        return vote
    })))

    return voteViews.filter(v => v != null)
})


export const getTopicVersionVotesHandler: EffHandlerNoAuth<{params: {did: string, rkey: string}}, ArCabildoabiertoWikiDefs.VoteView[]> = (
    ctx,
    agent,
    {params}
) => {
    const uri = getUri(params.did, "ar.cabildoabierto.wiki.topicVersion", params.rkey)
    return Effect.provideServiceEffect(
        getTopicVersionVotes(ctx, agent, uri).pipe(Effect.catchAll(() => Effect.fail("Ocurrió un error al obtener los votos."))),
        DataPlane,
        makeDataPlane(ctx, agent)
    )
}






