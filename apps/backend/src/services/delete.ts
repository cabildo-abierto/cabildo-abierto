import {collectionToDisplay, getCollectionFromUri, getRkeyFromUri, getUri, isPost} from "@cabildo-abierto/utils";
import {AppContext} from "#/setup.js";
import {SessionAgent} from "#/utils/session-agent.js";
import {CAHandler, EffHandler} from "#/utils/handler.js";
import {deleteDraft} from "#/services/write/drafts.js";
import {Effect} from "effect";
import {handleOrDidToDid} from "#/id-resolver.js";
import {DBDeleteError, DBSelectError} from "#/utils/errors.js";
import {ProcessDeleteError, processDeletes} from "#/services/sync/event-processing/delete-processor.js";


export function deleteRecordsForAuthor({ctx, agent, did, collections, atproto}: {
    ctx: AppContext,
    agent?: SessionAgent,
    did: string,
    collections?: string[],
    atproto: boolean
}): Effect.Effect<void, DBSelectError | ProcessDeleteError | ATDeleteRecordError> {
    return Effect.gen(function* () {
        const uris = yield* Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("Record")
                .select("uri")
                .where("authorId", "=", did)
                .$if(collections != null && collections.length > 0, qb => qb.where("collection", "in", collections!))
                .execute(),
            catch: () => new DBSelectError()
        })

        return yield* deleteRecords({
            ctx,
            agent,
            uris: uris.map((r) => (r.uri)),
            atproto
        })
    })
}


export const deleteRecordsHandler: EffHandler<{ uris: string[], atproto: boolean }> = (ctx, agent, {uris, atproto}) => {
    return deleteRecords({ctx, agent, uris, atproto})
        .pipe(
            Effect.catchAll(error => {
                if(error._tag == "ATDeleteRecordError") {
                    return Effect.fail("Ocurrió un error al borrar los registros de ATProtocol.")
                } else {
                    return Effect.fail("Ocurrió un error al borrar los registros de nuestra base de datos.")
                }
            }),
            Effect.flatMap(() => Effect.succeed({}))
        )
}


export const deleteCollectionHandler: EffHandler<{
    params: { collection: string }
}, {}> = (ctx, agent, {params}) => Effect.gen(function* () {
    const {collection} = params
    yield* ctx.worker.addJob("delete-collection", {collection})
    return {}
}).pipe(Effect.catchTag("AddJobsError", () => Effect.fail("Ocurrió un error al borrar la colección.")))


export const deleteCollection = (
    ctx: AppContext,
    collection: string
) => Effect.gen(function* () {
    const uris = yield* Effect.tryPromise({
        try: () => ctx.kysely.selectFrom("Record")
            .select(["uri"])
            .where("collection", "=", collection)
            .execute(),
        catch: (error) => new DBSelectError(error)
    })

    yield* processDeletes(ctx, uris.map(u => u.uri))
})

type DeleteRecordsProps = { ctx: AppContext, agent?: SessionAgent, uris: string[], atproto: boolean }

export function deleteRecords({
                                  ctx,
                                  agent,
                                  uris,
                                  atproto
                              }: DeleteRecordsProps): Effect.Effect<void, ATDeleteRecordError | ProcessDeleteError> {
    return Effect.gen(function* () {
        if (atproto && agent) {
            for (let i = 0; i < uris.length; i++) {
                yield* deleteRecordAT(agent, uris[i])
            }
        }

        yield* processDeletes(ctx, uris)
    })
}


export const deleteUserHandler: EffHandler<{ params: { handleOrDid: string } }> = (ctx, agent, {params}) => {
    return Effect.gen(function* () {
        const {handleOrDid} = params
        const did = yield* handleOrDidToDid(ctx, handleOrDid)
        yield* deleteUser(ctx, did)
        return {}
    }).pipe(
        Effect.catchTag("HandleResolutionError", () => Effect.fail("Usuario no encontrado.")),
        Effect.catchAll(() => Effect.fail("Ocurrió un error al borrar el usuario."))
    )
}


export class DeleteUserError {
    readonly _tag = "DeleteUserError"
}


export function deleteUser(ctx: AppContext, did: string): Effect.Effect<void, ATDeleteRecordError | DBSelectError | ProcessDeleteError | DBDeleteError> {
    return Effect.gen(function* () {
        yield* deleteRecordsForAuthor({ctx, did: did, atproto: false})

        yield* Effect.tryPromise({
            try: () => ctx.kysely.transaction().execute(async trx => {
                const id = await trx.selectFrom("MailingListSubscription").select("id").where("userId", "=", did).executeTakeFirst()
                if(id) await trx.deleteFrom("EmailSent").where("recipientId", "=", id.id).execute()
                await trx.deleteFrom("MailingListSubscription").where("userId", "=", did).execute()
                await trx.deleteFrom("ReadSession").where("userId", "=", did).execute()
                await trx.deleteFrom("Notification").where("userNotifiedId", "=", did).execute()
                await trx.deleteFrom("Blob").where("authorId", "=", did).execute()
                await trx.deleteFrom("MailingListSubscription").where("userId", "=", did).execute()
                await trx.deleteFrom("HasReacted").where("userId", "=", did).execute()
                await trx.deleteFrom("UserMonth").where("userId", "=", did).execute()
                await trx.deleteFrom("FollowingFeedIndex").where("readerId", "=", did).execute()
                await trx.deleteFrom("FollowingFeedIndex").where("authorId", "=", did).execute()
                await trx.deleteFrom("ModerationAction").where("userAffectedId", "=", did).execute()
                await trx.deleteFrom("User").where("did", "=", did).execute()
            }),
            catch: (error) => new DBDeleteError(error)
        })
    })
    // TO DO: Revisar que cache hace falta actualizar
}


export const deleteCAProfile: CAHandler<{}, {}> = async (ctx, agent, {}) => {
    ctx.logger.pino.info({did: agent.did}, "Deleting CA profile")
    const res1 = await agent.bsky.com.atproto.repo.deleteRecord({
        rkey: "self",
        collection: "ar.com.cabildoabierto.profile",
        repo: agent.did
    })
    ctx.logger.pino.info({commit: res1.data.commit}, "Commit 1")
    const res2 = await agent.bsky.com.atproto.repo.deleteRecord({
        rkey: "self",
        collection: "ar.cabildoabierto.actor.caProfile",
        repo: agent.did
    })
    ctx.logger.pino.info({commit: res2.data.commit}, "Commit 2")
    return {}
}


export class ATDeleteRecordError {
    readonly _tag = "ATDeleteRecordError"
}


export function deleteRecordAT(agent: SessionAgent, uri: string): Effect.Effect<void, ATDeleteRecordError> {
    return Effect.tryPromise({
        try: () => agent.bsky.com.atproto.repo.deleteRecord({
            repo: agent.did,
            rkey: getRkeyFromUri(uri),
            collection: getCollectionFromUri(uri)
        }),
        catch: () => new ATDeleteRecordError()
    }).pipe(Effect.withSpan("deleteRecordAT", {attributes: {uri}}))
}


export function deleteAssociatedVotes(ctx: AppContext, agent: SessionAgent, uri: string) {
    return Effect.gen(function* () {
        const votes = yield* Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("VoteReject")
                .where("VoteReject.reasonId", "=", uri)
                .select("VoteReject.uri")
                .execute(),
            catch: () => new DBSelectError()
        })
        if(votes.length > 0) {
            yield* Effect.all(votes.map(vote => deleteRecord(ctx, agent, vote.uri)))
        }
    }).pipe(Effect.withSpan("deleteAssociatedVotes", {
        attributes: {
            uri
        }
    }))
}


function deleteRecord(ctx: AppContext, agent: SessionAgent, uri: string): Effect.Effect<
    void,
    ATDeleteRecordError | ProcessDeleteError | DBSelectError
> {
    const collection = getCollectionFromUri(uri)
    return Effect.gen(function* () {
        if (isPost(collection)) {
            yield* deleteAssociatedVotes(ctx, agent, uri)
        }
        yield* deleteRecordAT(agent, uri)
        yield* processDeletes(ctx, [uri])
    }).pipe(Effect.withSpan("deleteRecord", {
        attributes: {uri}
    }))

}


export const deleteRecordHandler: EffHandler<{
    params: { rkey: string, collection: string }
}> = (ctx, agent, {params}) => {
    const {rkey, collection} = params

    if (collection == "draft") {
        return Effect.tryPromise({
            try: () => deleteDraft(ctx, agent, rkey),
            catch: () => "Ocurrió un error al borrar el borrador."
        }).pipe(Effect.flatMap(() => Effect.succeed({})))
    } else {
        const uri = getUri(agent.did, collection, rkey)

        return deleteRecord(ctx, agent, uri).pipe(
            Effect.flatMap(() => Effect.succeed({})),
        Effect.catchAll(() => Effect.fail(`Ocurrió un error al borrar ${collectionToDisplay(collection, "el-la")}.`))
        )
    }

}
