import {getCollectionFromUri, getRkeyFromUri, getUri, isPost} from "@cabildo-abierto/utils";
import {AppContext} from "#/setup.js";
import {SessionAgent} from "#/utils/session-agent.js";
import {CAHandler} from "#/utils/handler.js";
import {handleToDid} from "#/services/user/users.js";
import {getDeleteProcessor} from "#/services/sync/event-processing/get-delete-processor.js";
import {batchDeleteRecords} from "#/services/sync/event-processing/get-record-processor.js";
import {deleteDraft} from "#/services/write/drafts.js";


export async function deleteRecordsForAuthor({ctx, agent, did, collections, atproto}: {ctx: AppContext, agent?: SessionAgent, did: string, collections?: string[], atproto: boolean}){
    const uris = await ctx.kysely
        .selectFrom("Record")
        .select("uri")
        .where("authorId", "=", did)
        .$if(collections != null && collections.length > 0, qb => qb.where("collection", "in", collections!))
        .execute()

    return await deleteRecords({
        ctx,
        agent,
        uris: uris.map((r) => (r.uri)),
        atproto
    })
}


export const deleteRecordsHandler: CAHandler<{uris: string[], atproto: boolean}> = async (ctx, agent, {uris, atproto}) => {
    return await deleteRecords({ctx, agent, uris, atproto})
}


export const deleteCollectionHandler: CAHandler<{params: {collection: string}}, {}> = async (ctx, agent, {params}) => {
    const {collection} = params
    await ctx.worker?.addJob("delete-collection", {collection})
    return {data: {}}
}


export async function deleteCollection(ctx: AppContext, collection: string){
    const uris = await ctx.kysely.selectFrom("Record")
        .select(["uri"])
        .where("collection", "=", collection)
        .execute()

    await getDeleteProcessor(ctx, collection).process(uris.map(u => u.uri))
}


export async function deleteRecords({ctx, agent, uris, atproto}: { ctx: AppContext, agent?: SessionAgent, uris: string[], atproto: boolean }): Promise<{error?: string}> {
    if (atproto && agent) {
        for (let i = 0; i < uris.length; i++) {
            await deleteRecordAT(agent, uris[i])
        }
    }

    await batchDeleteRecords(ctx, uris)

    return {}
}


export const deleteUserHandler: CAHandler<{params: {handleOrDid: string}}> = async (ctx, agent, {params}) => {
    const {handleOrDid} = params
    const did = await handleToDid(ctx, agent, handleOrDid)
    if(!did) return {error: "No se pudo resolver el handle."}
    await deleteUser(ctx, did)
    return {data: {}}
}


export async function deleteUser(ctx: AppContext, did: string) {
    try {
        await deleteRecordsForAuthor({ctx, did: did, atproto: false})

        await ctx.kysely.transaction().execute(async trx => {
            await trx.deleteFrom("ReadSession").where("userId", "=", did).execute()
            await trx.deleteFrom("Notification").where("userNotifiedId", "=", did).execute()
            await trx.deleteFrom("Blob").where("authorId", "=", did).execute()
            await trx.deleteFrom("User").where("did", "=", did).execute()
        })
    } catch (err) {
        ctx.logger.pino.info({error: err, did}, "error deleting user, getting remaining ercords")

        const records = await ctx.kysely
            .selectFrom("Record")
            .where("authorId", "=", did)
            .select("uri")
            .limit(10)
            .execute()
        ctx.logger.pino.info({error: err, did, remainingRecords: records}, "something went wrong when deleting a user")
    }
    // TO DO: Revisar que cache hace falta actualizar
}


export const deleteCAProfile: CAHandler<{}, {}> = async (ctx, agent, {}) => {
    console.log("Deleting CA profile of did:", agent.did)
    const res1 = await agent.bsky.com.atproto.repo.deleteRecord({
        rkey: "self",
        collection: "ar.com.cabildoabierto.profile",
        repo: agent.did
    })
    console.log("Commit 1:", res1.data.commit)
    const res2 = await agent.bsky.com.atproto.repo.deleteRecord({
        rkey: "self",
        collection: "ar.cabildoabierto.actor.caProfile",
        repo: agent.did
    })
    console.log("Commit 2:", res2.data.commit)
    return {}
}


export async function deleteRecordAT(agent: SessionAgent, uri: string){
    try {
        await agent.bsky.com.atproto.repo.deleteRecord({
            repo: agent.did,
            rkey: getRkeyFromUri(uri),
            collection: getCollectionFromUri(uri)
        })
    } catch {
        console.warn("No se pudo borrar de ATProto", uri)
    }
}


export async function deleteAssociatedVotes(ctx: AppContext, agent: SessionAgent, uri: string) {
    const votes = await ctx.kysely
        .selectFrom("VoteReject")
        .where("VoteReject.reasonId", "=", uri)
        .select("VoteReject.uri")
        .execute()
    for(let i = 0; i < votes.length; i++){
        const {error} = await deleteRecord(ctx, agent, votes[i].uri)
        if(error) return {error}
    }
    return {}
}


async function deleteRecord(ctx: AppContext, agent: SessionAgent, uri: string) {
    const collection = getCollectionFromUri(uri)
    try {
        if(isPost(collection)){
            await deleteAssociatedVotes(ctx, agent, uri)
        }
        await deleteRecordAT(agent, uri)
        await getDeleteProcessor(ctx, collection).process([uri])
    } catch (error) {
        ctx.logger.pino.error({error, uri}, "error deleting record")
        return {error: "Algo salió mal."}
    }
    return {data: {}}
}


export const deleteRecordHandler: CAHandler<{params: {rkey: string, collection: string}}> = async (ctx, agent, {params}) => {
    const {rkey, collection} = params

    if(collection == "draft") {
        await deleteDraft(ctx, agent, rkey)
    }

    const uri = getUri(agent.did, collection, rkey)

    return await deleteRecord(ctx, agent, uri)
}
