import {CAHandlerNoAuth} from "#/utils/handler.js";
import {getDidFromUri, getUri, isTopicVersion, splitUri} from "@cabildo-abierto/utils";
import {getTopicIdFromTopicVersionUri} from "#/services/wiki/current-version.js";
import {v4 as uuidv4} from "uuid";
import {AppContext} from "#/setup.js";
import {Agent} from "#/utils/session-agent.js";

export type ReadChunk = {
    chunk: number
    duration: number
}

export type ReadChunks = ReadChunk[]

export type ReadChunksAttr = {
    chunks: ReadChunks,
    totalChunks: number
}

export const storeReadSessionHandler: CAHandlerNoAuth<{
    chunks: ReadChunks
    totalChunks: number
    params: { did: string, collection: string, rkey: string }
}> = async (ctx, agent, params) => {
    const {did, collection, rkey} = params.params;
    const uri = getUri(did, collection, rkey);

    const {error} =  await storeReadSession(ctx, agent, {
        contentUri: uri,
        chunks: params.chunks,
        totalChunks: params.totalChunks
    }, new Date())
    if(error) return {error}
    return {data: {}}
}


export type ReadSession = {
    contentUri: string
    chunks: ReadChunks
    totalChunks: number
}


export async function storeReadSession(ctx: AppContext, agent: Agent, readSession: ReadSession, created_at: Date) {
    const {did, collection, rkey} = splitUri(readSession.contentUri)
    ctx.logger.pino.info("storing read session")
    let topicId: string | null = null
    if(isTopicVersion(collection)){
        topicId = await getTopicIdFromTopicVersionUri(ctx, did, rkey)
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
    try {
        await ctx.kysely
            .insertInto("ReadSession")
            .values([rs])
            .execute()

    } catch (error) {
        ctx.logger.pino.error({rs, error}, "error creating a read session")
        return {error: "Ocurrió un error al actualizar la base de datos."}
    }
    return {id}
}