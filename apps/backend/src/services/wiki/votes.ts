import {ATProtoStrongRef, CreatePostProps} from "@cabildo-abierto/api";
import {BaseAgent, SessionAgent} from "#/utils/session-agent.js";
import {AppContext} from "#/setup.js";
import {getCollectionFromUri, getDidFromUri, getUri, splitUri} from "@cabildo-abierto/utils";
import {CAHandlerNoAuth, EffHandler} from "#/utils/handler.js";
import {addReaction, removeReactionAT} from "#/services/reactions/reactions.js";
import {
    ArCabildoabiertoWikiVoteAccept,
    ArCabildoabiertoWikiVoteReject,
    ArCabildoabiertoWikiDefs
} from "@cabildo-abierto/api"
import {Dataplane} from "#/services/hydration/dataplane.js";
import {hydrateProfileViewBasic} from "#/services/hydration/profile.js";
import {createPost} from "#/services/write/post.js";
import {ATDeleteRecordError, deleteRecords} from "#/services/delete.js";
import {Effect} from "effect";
import {ProcessDeleteError} from "#/services/sync/event-processing/get-record-processor.js";

export type TopicVoteType = "ar.cabildoabierto.wiki.voteAccept" | "ar.cabildoabierto.wiki.voteReject"

export function isTopicVote(collection: string): collection is TopicVoteType {
    return collection == "ar.cabildoabierto.wiki.voteAccept" || collection == "ar.cabildoabierto.wiki.voteReject"
}


export class ATCreateRecordError {
    readonly _tag = "ATCreateRecordError"
}


export const createVoteAcceptAT = (agent: SessionAgent, ref: ATProtoStrongRef): Effect.Effect<ATProtoStrongRef, ATCreateRecordError> => {
    const record: ArCabildoabiertoWikiVoteAccept.Record = {
        $type: "ar.cabildoabierto.wiki.voteAccept",
        createdAt: new Date().toISOString(),
        subject: ref
    }

    return Effect.tryPromise({
        try: () => agent.bsky.com.atproto.repo.createRecord({
            record,
            collection: "ar.cabildoabierto.wiki.voteAccept",
            repo: agent.did
        }),
        catch: () => new ATCreateRecordError()
    }).pipe(Effect.flatMap(({data}) => {
        return Effect.succeed({uri: data.uri, cid: data.cid})
    }))

}


export const createVoteRejectAT = (agent: SessionAgent, ref: ATProtoStrongRef, voteRejectProps?: VoteRejectProps): Effect.Effect<ATProtoStrongRef, ATCreateRecordError> => {
    const record: ArCabildoabiertoWikiVoteReject.Record = {
        $type: "ar.cabildoabierto.wiki.voteReject",
        createdAt: new Date().toISOString(),
        subject: ref,
        ...voteRejectProps
    }

    return Effect.tryPromise({
        try: () => agent.bsky.com.atproto.repo.createRecord({
            record,
            collection: "ar.cabildoabierto.wiki.voteReject",
            repo: agent.did
        }),
        catch: () => new ATCreateRecordError()
    }).pipe(Effect.flatMap(({data}) => {
        return Effect.succeed({uri: data.uri, cid: data.cid})
    }))
}


export type VoteRejectProps = {
    reason: ATProtoStrongRef
}


export const voteEdit: EffHandler<{
    reason?: CreatePostProps,
    force?: boolean,
    params: { vote: string, rkey: string, did: string, cid: string }
}, { uri: string }> = (
    ctx: AppContext, agent: SessionAgent, {reason, force, params}
) => {
    return Effect.gen(function* () {
        const {vote, rkey, did, cid} = params
        if (vote != "accept" && vote != "reject") {
            return yield* Effect.fail(`Voto inválido: ${vote}.`)
        }

        if (vote == "accept" && reason) {
            return yield* Effect.fail("Por ahora no se permiten justificaciones en votos positivos.")
        }

        if(vote == "reject" && !reason) {
            return yield* Effect.fail("Los votos negativos requieren una justificación.")
        }

        const uri = getUri(did, "ar.cabildoabierto.wiki.topicVersion", rkey)
        const versionRef = {uri, cid}

        const type: TopicVoteType = vote == "accept" ? "ar.cabildoabierto.wiki.voteAccept" : "ar.cabildoabierto.wiki.voteReject"

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

        if(existing.length > 0) {
            // TO DO: Si llegase a haber más de una posiblemente haya que tener más cuidado.
            // si ya existe una reacción del mismo tipo no hacemos nada
            if(getCollectionFromUri(existing[0].uri) == "ar.cabildoabierto.wiki.voteAccept" && vote == "accept") {
                return {uri: existing[0].uri}
            } else if(getCollectionFromUri(existing[0].uri) == "ar.cabildoabierto.wiki.voteReject" && vote == "reject") {
                return {uri: existing[0].uri}
            } else if(vote == "reject") {
                // está pasando de aceptar a rechazar
                yield* cancelEditVoteHandler(ctx, agent, {params: splitUri(existing[0].uri)}).pipe(Effect.catchAll(() => {
                    return Effect.fail("Ocurrió un error al cambiar el voto.")
                }))

            } else if(vote == "accept") {
                // está pasando de rechazar a aceptar
                if(!force) {
                    return yield* Effect.fail(new NeedToDeleteReasonError())
                }

                yield* cancelEditVoteHandler(ctx, agent, {params: splitUri(existing[0].uri)}).pipe(Effect.catchAll(() => {
                    return Effect.fail("Ocurrió un error al cambiar el voto.")
                }))
            }
        }

        if(reason) {
            const data = yield* createPost(ctx, agent, reason!)
                .pipe(Effect.catchAll(() => Effect.fail("Ocurrió un error al crear la justificación.")))

            return yield* addReaction(
                ctx,
                agent,
                versionRef,
                type,
                {
                    reason: data[0]
                }
            )

        } else {
            return yield* addReaction(
                ctx,
                agent,
                versionRef,
                type
            )
        }
    }).pipe(
        Effect.catchTag("NeedToDeleteReasonError", () => {
            return Effect.fail("Agregar un voto positivo eliminaría la justificación del voto de rechazo.")
        }),
        Effect.catchTag("ATCreateRecordError", () => Effect.fail("Ocurrió un error al crear el voto.")),
        Effect.catchTag("ATCreateRepostError", () => Effect.fail("Ocurrió un error al crear la republicación")), // obviamente no puede pasar esto
        Effect.catchTag("ATCreateLikeError", () => Effect.fail("Ocurrió un error al dar me gusta")),
            Effect.catchTag("InvalidValueError", () => Effect.fail("Reacción inválida")),
        Effect.catchTag("AddJobsError", () => Effect.fail("Ocurrió un error al crear el voto.")),
        Effect.catchTag("UpdateRedisError", () => Effect.fail("Ocurrió un error al crear el voto.")),
        Effect.catchTag("InsertRecordError", () => Effect.fail("Ocurrió un error al crear el voto."))
    )
}

export const cancelEditVoteHandler: EffHandler<{
    params: { collection: string, rkey: string }
    force?: boolean
}> = (ctx: AppContext, agent: SessionAgent, {params, force}) => {
    const {collection, rkey} = params
    const uri = getUri(agent.did, collection, rkey)
    return cancelEditVote(ctx, agent, uri, force).pipe(
        Effect.catchTag("NeedToDeleteReasonError", () => {
            return Effect.fail("Cancelar este voto eliminaría la justificación de tu voto negativo.")
        }),
        Effect.catchTag("VoteNotFoundError", () => {
            return Effect.fail("No se encontró el voto a cancelar.")
        }),
        Effect.catchAll(() => {
            return Effect.fail("Ocurrió un error al cancelar el voto.")
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
    return Effect.gen(function* () {
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

        return yield* removeReactionAT(ctx, agent, uri)
    })
}


export async function getTopicVersionVotes(ctx: AppContext, agent: BaseAgent, uri: string) {
    const reactions = await ctx.kysely
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
        .orderBy("Record.created_at_tz desc")
        .distinctOn(["Record.authorId"])
        .execute()

    const votes = reactions
        .filter(r => isTopicVote(getCollectionFromUri(r.uri)))
        .map(r => r.cid && r.subjectCid && r.subjectId ? {...r, subjectId: r.subjectId, subjectCid: r.subjectCid, cid: r.cid} : null)
        .filter(r => r != null)

    const users = votes.map(v => getDidFromUri(v.uri))
    const dataplane = new Dataplane(ctx, agent)
    await dataplane.fetchProfileViewBasicHydrationData(users)

    const voteViews: (ArCabildoabiertoWikiDefs.VoteView | null)[] = votes.map(v => {
        const author = hydrateProfileViewBasic(ctx, getDidFromUri(v.uri), dataplane)
        if(!author) {
            ctx.logger.pino.warn({uri: v.uri}, "author of vote not found")
            return null
        }
        return {
            $type: "ar.cabildoabierto.wiki.defs#voteView",
            uri: v.uri,
            cid: v.cid,
            subject: {
                uri: v.subjectId,
                cid: v.subjectCid
            },
            author
        }
    })

    return voteViews.filter(v => v != null)
}


export const getTopicVersionVotesHandler: CAHandlerNoAuth<{params: {did: string, rkey: string}}, ArCabildoabiertoWikiDefs.VoteView[]> = async (ctx, agent, {params}) => {
    const uri = getUri(params.did, "ar.cabildoabierto.wiki.topicVersion", params.rkey)
    const votes = await getTopicVersionVotes(ctx, agent, uri)

    return {data: votes}
}