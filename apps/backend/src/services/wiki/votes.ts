import {ATProtoStrongRef, CreatePostProps} from "@cabildo-abierto/api";
import {BaseAgent, SessionAgent} from "#/utils/session-agent.js";
import {AppContext} from "#/setup.js";
import {getCollectionFromUri, getDidFromUri, getUri, splitUri} from "@cabildo-abierto/utils";
import {CAHandler, CAHandlerNoAuth} from "#/utils/handler.js";
import {addReaction, removeReactionAT} from "#/services/reactions/reactions.js";
import {
    ArCabildoabiertoWikiVoteAccept,
    ArCabildoabiertoWikiVoteReject,
    ArCabildoabiertoWikiDefs
} from "@cabildo-abierto/api"
import {Dataplane} from "#/services/hydration/dataplane.js";
import {hydrateProfileViewBasic} from "#/services/hydration/profile.js";
import {createPost} from "#/services/write/post.js";
import {deleteRecords} from "#/services/delete.js";

export type TopicVoteType = "ar.cabildoabierto.wiki.voteAccept" | "ar.cabildoabierto.wiki.voteReject"

export function isTopicVote(collection: string): collection is TopicVoteType {
    return collection == "ar.cabildoabierto.wiki.voteAccept" || collection == "ar.cabildoabierto.wiki.voteReject"
}


export const createVoteAcceptAT = async (agent: SessionAgent, ref: ATProtoStrongRef): Promise<ATProtoStrongRef> => {
    const record: ArCabildoabiertoWikiVoteAccept.Record = {
        $type: "ar.cabildoabierto.wiki.voteAccept",
        createdAt: new Date().toISOString(),
        subject: ref
    }

    const {data} = await agent.bsky.com.atproto.repo.createRecord({
        record,
        collection: "ar.cabildoabierto.wiki.voteAccept",
        repo: agent.did
    })

    return {uri: data.uri, cid: data.cid}
}


export const createVoteRejectAT = async (agent: SessionAgent, ref: ATProtoStrongRef, voteRejectProps?: VoteRejectProps): Promise<ATProtoStrongRef> => {
    const record: ArCabildoabiertoWikiVoteReject.Record = {
        $type: "ar.cabildoabierto.wiki.voteReject",
        createdAt: new Date().toISOString(),
        subject: ref,
        ...voteRejectProps
    }

    const {data} = await agent.bsky.com.atproto.repo.createRecord({
        record,
        collection: "ar.cabildoabierto.wiki.voteReject",
        repo: agent.did
    })

    return {uri: data.uri, cid: data.cid}
}


export type VoteRejectProps = {
    reason: ATProtoStrongRef
}


export const voteEdit: CAHandler<{
    reason?: CreatePostProps,
    force?: boolean,
    params: { vote: string, rkey: string, did: string, cid: string }
}, { uri: string }> = async (
    ctx: AppContext, agent: SessionAgent, {reason, force, params}
) => {
    const {vote, rkey, did, cid} = params

    if (vote != "accept" && vote != "reject") {
        return {error: `Voto inválido: ${vote}.`}
    }

    if (vote == "accept" && reason) {
        return {error: "Por ahora no se permiten justificaciones en votos positivos."}
    }

    if(vote == "reject" && !reason) {
        return {error: "Los votos negativos requieren una justificación."}
    }

    const uri = getUri(did, "ar.cabildoabierto.wiki.topicVersion", rkey)
    const versionRef = {uri, cid}

    const type: TopicVoteType = vote == "accept" ? "ar.cabildoabierto.wiki.voteAccept" : "ar.cabildoabierto.wiki.voteReject"

    const existing = await ctx.kysely
        .selectFrom("Reaction")
        .innerJoin("Record", "Record.uri", "Reaction.uri")
        .select("Record.uri")
        .where("Reaction.subjectId", "=", uri)
        .where("Record.authorId", "=", agent.did)
        .execute()

    if(existing.length > 0) {
        // TO DO: Si llegase a haber más de una posiblemente haya que tener más cuidado.
        // si ya existe una reacción del mismo tipo no hacemos nada
        if(getCollectionFromUri(existing[0].uri) == "ar.cabildoabierto.wiki.voteAccept" && vote == "accept") {
            return {data: {uri: existing[0].uri}}
        } else if(getCollectionFromUri(existing[0].uri) == "ar.cabildoabierto.wiki.voteReject" && vote == "reject") {
            return {data: {uri: existing[0].uri}}
        } else if(vote == "reject") {
            // está pasando de aceptar a rechazar
            const {error} = await cancelEditVote(ctx, agent, {params: splitUri(existing[0].uri)})
            if(error) {
                return {error: "Ocurrió un error al cambiar el voto."}
            }
        } else if(vote == "accept") {
            // está pasando de rechazar a aceptar
            if(!force) {
                return {error: "Crear el voto de aceptación borraría la justificación del voto de rechazo."}
            }

            const {error} = await cancelEditVote(ctx, agent, {params: splitUri(existing[0].uri)})
            if(error) {
                return {error: "Ocurrió un error al cambiar el voto."}
            }
        }
    }

    if(reason) {
        const {error, data} = await createPost(ctx, agent, reason!)
        if(error || !data) {
            return {error: "Ocurrió un error al crear la justificación."}
        }
        return await addReaction(
            ctx,
            agent,
            versionRef,
            type,
            {
                reason: data[0]
            }
        )
    } else {
        return await addReaction(
            ctx,
            agent,
            versionRef,
            type
        )
    }
}

export const cancelEditVote: CAHandler<{
    params: { collection: string, rkey: string }
    force?: boolean
}> = async (ctx: AppContext, agent: SessionAgent, {params, force}) => {
    const {collection, rkey} = params
    const uri = getUri(agent.did, collection, rkey)

    if(collection == "ar.cabildoabierto.wiki.voteReject") {
        const reject = await ctx.kysely
            .selectFrom("VoteReject")
            .where("VoteReject.uri", "=", uri)
            .select("VoteReject.reasonId")
            .executeTakeFirst()
        if(!reject) {
            return {error: "No se encontró el voto a borrar."}
        } else if(reject.reasonId){
            if(!force) {
                return {error: "Borrar el voto de rechazo también borraría la justificación."}
            }
            try {
                await deleteRecords({
                    ctx,
                    agent,
                    atproto: true,
                    uris: [reject.reasonId]
                })
            } catch {
                return {error: "Ocurrió un error al borrar la justificación."}
            }
        } else {
            // hay un reject pero no tiene reasonId, continuamos con el delete
        }
    }

    return await removeReactionAT(ctx, agent, uri)
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