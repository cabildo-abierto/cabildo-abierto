import {AppContext} from "#/setup.js";
import {ATProtoStrongRef} from "#/lib/types.js";
import {CAHandler} from "#/utils/handler.js";
import {getCollectionFromUri, getUri} from "@cabildo-abierto/utils";
import {AppBskyFeedLike, AppBskyFeedRepost} from "@atproto/api"
import {ArCabildoabiertoWikiVoteAccept, ArCabildoabiertoWikiVoteReject} from "@cabildo-abierto/api"
import {SessionAgent} from "#/utils/session-agent.js";
import {$Typed} from "@atproto/api";
import {createVoteAcceptAT, createVoteRejectAT, VoteRejectProps} from "#/services/wiki/votes.js";
import {deleteRecordAT} from "#/services/delete.js";
import {ReactionDeleteProcessor, ReactionRecordProcessor} from "#/services/sync/event-processing/reaction.js";



export type ReactionType =
    "app.bsky.feed.like"
    | "app.bsky.feed.repost"
    | "ar.cabildoabierto.wiki.voteAccept"
    | "ar.cabildoabierto.wiki.voteReject"


export type ReactionRecord =
    $Typed<AppBskyFeedLike.Record>
    | $Typed<AppBskyFeedRepost.Record>
    | $Typed<ArCabildoabiertoWikiVoteAccept.Record>
    | $Typed<ArCabildoabiertoWikiVoteReject.Record>


const addReactionAT = async (agent: SessionAgent, ref: ATProtoStrongRef, type: ReactionType, voteRejectProps?: VoteRejectProps): Promise<ATProtoStrongRef> => {
    if (type == "app.bsky.feed.like") {
        return await agent.bsky.like(ref.uri, ref.cid)
    } else if (type == "ar.cabildoabierto.wiki.voteAccept") {
        return await createVoteAcceptAT(agent, ref)
    } else if (type == "ar.cabildoabierto.wiki.voteReject") {
        return await createVoteRejectAT(agent, ref, voteRejectProps)
    } else if (type == "app.bsky.feed.repost") {
        return await agent.bsky.repost(ref.uri, ref.cid)
    } else {
        throw Error(`Reacción desconocida: ${type}`)
    }
}


export const addReaction = async (ctx: AppContext, agent: SessionAgent, ref: ATProtoStrongRef, type: ReactionType, voteRejectProps?: VoteRejectProps): Promise<{
    data?: { uri: string },
    error?: string
}> => {
    try {
        const res = await addReactionAT(agent, ref, type, voteRejectProps)

        const record: ReactionRecord = {
            $type: type,
            subject: ref,
            createdAt: new Date().toISOString()
        }

        await new ReactionRecordProcessor(ctx).processValidated([{ref: res, record}])
        ctx.logger.pino.info("finished adding reaction")
        return {data: {uri: res.uri}}
    } catch (err) {
        ctx.logger.pino.error({error: err, ref, type}, "Error adding reaction")
        return {error: "No se pudo crear la reacción."}
    }
}


export const addLike: CAHandler<ATProtoStrongRef, { uri: string }> = async (ctx, agent, ref) => {
    return await addReaction(ctx, agent, ref, "app.bsky.feed.like")
}


export const repost: CAHandler<ATProtoStrongRef, { uri: string }> = async (ctx, agent, ref) => {
    return await addReaction(ctx, agent, ref, "app.bsky.feed.repost")
}


export const removeReactionAT = async (ctx: AppContext, agent: SessionAgent, uri: string) => {
    const collection = getCollectionFromUri(uri)
    if (collection == "app.bsky.feed.like") {
        await agent.bsky.deleteLike(uri)
    } else if (collection == "app.bsky.feed.repost") {
        await agent.bsky.deleteRepost(uri)
    } else if (collection == "ar.cabildoabierto.wiki.voteAccept") {
        await deleteRecordAT(agent, uri)
    } else if (collection == "ar.cabildoabierto.wiki.voteReject") {
        await deleteRecordAT(agent, uri)
    }
    await new ReactionDeleteProcessor(ctx).process([uri])
    return {data: {}}
}


type RemoveReactionProps = {
    params: {
        did: string
        collection: string
        rkey: string
    }
}


export const removeLike: CAHandler<RemoveReactionProps> = async (ctx, agent, {params}) => {
    const {rkey} = params
    const uri = getUri(agent.did, "app.bsky.feed.like", rkey)
    return await removeReactionAT(ctx, agent, uri)
}


export const removeRepost: CAHandler<RemoveReactionProps> = async (ctx, agent, {params}) => {
    const {rkey} = params
    const uri = getUri(agent.did, "app.bsky.feed.repost", rkey)
    return await removeReactionAT(ctx, agent, uri)
}










