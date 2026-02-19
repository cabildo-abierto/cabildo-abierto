import {AppContext} from "#/setup.js";
import {ArCabildoabiertoWikiVoteAccept, ArCabildoabiertoWikiVoteReject, ATProtoStrongRef} from "@cabildo-abierto/api";
import {EffHandler} from "#/utils/handler.js";
import {getCollectionFromUri, getUri} from "@cabildo-abierto/utils";
import {$Typed, AppBskyFeedLike, AppBskyFeedRepost} from "@atproto/api"
import {SessionAgent} from "#/utils/session-agent.js";
import {ATCreateRecordError, createVoteAcceptAT, createVoteRejectAT, VoteRejectProps} from "#/services/wiki/votes.js";
import {ATDeleteRecordError, deleteRecordAT} from "#/services/delete.js";
import {ReactionRecordProcessor} from "#/services/sync/event-processing/reaction.js";
import {Effect} from "effect";
import {ProcessCreateError} from "#/services/sync/event-processing/record-processor.js";
import {InvalidValueError} from "#/utils/errors.js";
import {ProcessDeleteError, processDeletes} from "#/services/sync/event-processing/delete-processor.js";


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


export class ATCreateLikeError {
    readonly _tag = "ATCreateLikeError"
}


export class ATCreateRepostError {
    readonly _tag = "ATCreateRepostError"
}


type ATCreateReactionError = ATCreateLikeError | ATCreateRepostError | InvalidValueError | ATCreateRecordError


const addReactionAT = (agent: SessionAgent, ref: ATProtoStrongRef, type: ReactionType, voteRejectProps?: VoteRejectProps): Effect.Effect<ATProtoStrongRef, ATCreateReactionError> => {

    if (type == "app.bsky.feed.like") {
        return Effect.tryPromise({
            try: () => agent.bsky.like(ref.uri, ref.cid),
            catch: () => new ATCreateLikeError()
        })
    } else if (type == "ar.cabildoabierto.wiki.voteAccept") {
        return createVoteAcceptAT(agent, ref)
    } else if (type == "ar.cabildoabierto.wiki.voteReject") {
        return createVoteRejectAT(agent, ref, voteRejectProps)
    } else if (type == "app.bsky.feed.repost") {
        return Effect.tryPromise({
            try: () => agent.bsky.repost(ref.uri, ref.cid),
            catch: () => new ATCreateRepostError()
        })
    } else {
        return Effect.fail(new InvalidValueError(type))
    }
}


export const addReaction = (ctx: AppContext, agent: SessionAgent, ref: ATProtoStrongRef, type: ReactionType, voteRejectProps?: VoteRejectProps): Effect.Effect<{uri: string}, ProcessCreateError | ATCreateReactionError> => {

    return Effect.gen(function* () {
        const res = yield* addReactionAT(agent, ref, type, voteRejectProps)

        const record: ReactionRecord = {
            $type: type,
            subject: ref,
            createdAt: new Date().toISOString(),
            reason: voteRejectProps ? voteRejectProps.reason : undefined
        }

        const processor = new ReactionRecordProcessor(ctx)
        yield* processor.processValidated([{ref: res, record}])
        return {uri: res.uri}
    })
}


export const addLike: EffHandler<ATProtoStrongRef, { uri: string }> = (ctx, agent, ref) => {
    return addReaction(ctx, agent, ref, "app.bsky.feed.like").pipe(
        Effect.catchAll(() => {
            return Effect.fail("Ocurrió un error al dar me gusta.")
        })
    )
}


export const repost: EffHandler<ATProtoStrongRef, { uri: string }> = (ctx, agent, ref) => {
    return addReaction(ctx, agent, ref, "app.bsky.feed.repost").pipe(
        Effect.catchAll(() => {
            return Effect.fail("Ocurrió un error al republicar.")
        })
    )
}


export const removeReactionAT = (
    ctx: AppContext,
    agent: SessionAgent,
    uri: string
): Effect.Effect<void, ATDeleteRecordError | ProcessDeleteError> => {
    return Effect.gen(function* () {
        const collection = getCollectionFromUri(uri)
        if (collection == "app.bsky.feed.like") {
            yield* Effect.tryPromise({
                try: () => agent.bsky.deleteLike(uri),
                catch: () => new ATDeleteRecordError()
            })
        } else if (collection == "app.bsky.feed.repost") {
            yield* Effect.tryPromise({
                try: () => agent.bsky.deleteRepost(uri),
                catch: () => new ATDeleteRecordError()
            })
        } else if (collection == "ar.cabildoabierto.wiki.voteAccept") {
            yield* deleteRecordAT(agent, uri)
        } else if (collection == "ar.cabildoabierto.wiki.voteReject") {
            yield* deleteRecordAT(agent, uri)
        }
        yield* processDeletes(ctx, [uri])
    })
}


type RemoveReactionProps = {
    params: {
        did: string
        collection: string
        rkey: string
    }
}


export const removeLike: EffHandler<RemoveReactionProps> = (ctx, agent, {params}) => {
    const {rkey} = params
    const uri = getUri(agent.did, "app.bsky.feed.like", rkey)
    return removeReactionAT(ctx, agent, uri).pipe(
        Effect.catchAll(() => Effect.fail("Ocurrió un error al remover el me gusta.")),
        Effect.flatMap(() => Effect.succeed({}))
    )
}


export const removeRepost: EffHandler<RemoveReactionProps> = (ctx, agent, {params}) => {
    const {rkey} = params
    const uri = getUri(agent.did, "app.bsky.feed.repost", rkey)
    return removeReactionAT(ctx, agent, uri).pipe(
        Effect.catchAll(() => Effect.fail("Ocurrió un error al remover el me gusta.")),
        Effect.flatMap(() => Effect.succeed({}))
    )
}










