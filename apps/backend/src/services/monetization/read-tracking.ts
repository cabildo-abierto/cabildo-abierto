import {EffHandlerNoAuth} from "#/utils/handler.js";
import {getDidFromUri, getUri, isTopicVersion, splitUri} from "@cabildo-abierto/utils";
import {getTopicIdFromTopicVersionUri} from "#/services/wiki/current-version.js";
import {v4 as uuidv4} from "uuid";
import {AppContext} from "#/setup.js";
import {Agent} from "#/utils/session-agent.js";
import {Effect} from "effect";

import {DBInsertError} from "#/utils/errors.js";

export type ReadChunk = {
    chunk: number
    duration: number
}

export type ReadChunks = ReadChunk[]

export type ReadChunksAttr = {
    chunks: ReadChunks,
    totalChunks: number
}

export const storeReadSessionHandler: EffHandlerNoAuth<{
    chunks: ReadChunks
    totalChunks: number
    params: { did: string, collection: string, rkey: string }
}> = (ctx, agent, params) => {
    const {did, collection, rkey} = params.params;
    const uri = getUri(did, collection, rkey);

    return storeReadSession(ctx, agent, {
        contentUri: uri,
        chunks: params.chunks,
        totalChunks: params.totalChunks
    }, new Date()).pipe(
        Effect.catchAll(() => Effect.fail("Ocurrió un error la guardar la lectura."))
    )
}


export type ReadSession = {
    contentUri: string
    chunks: ReadChunks
    totalChunks: number
}


export const storeReadSession = (
    ctx: AppContext,
    agent: Agent,
    readSession: ReadSession,
    created_at: Date) => Effect.gen(function* () {
    const {did, collection, rkey} = splitUri(readSession.contentUri)
    let topicId: string | null = null
    if(isTopicVersion(collection)){
        topicId = yield* getTopicIdFromTopicVersionUri(ctx, did, rkey)
    }

    const id = uuidv4()

    const rs = {
        id,
        readChunks: {
            chunks: readSession.chunks,
            totalChunks: readSession.totalChunks
        },
        userId: agent.hasSession() ? agent.did : "did:plc:2semihha42b7efhu4ywv7whi",
        readContentId: readSession.contentUri,
        contentAuthorId: getDidFromUri(readSession.contentUri),
        topicId: topicId ?? undefined,
        created_at,
        created_at_tz: created_at
    }

    yield* Effect.tryPromise({
        try: () => ctx.kysely
            .insertInto("ReadSession")
            .values([rs])
            .execute(),
        catch: () => new DBInsertError("ReadSession")
    })

    return id
})