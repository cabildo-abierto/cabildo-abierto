import {SessionAgent} from "#/utils/session-agent.js";
import {AppContext} from "#/setup.js";
import {isValidHandle} from "@atproto/syntax";
import {CAHandler, CAHandlerNoAuth} from "#/utils/handler.js";
import {v4 as uuidv4} from "uuid";
import { customAlphabet } from "nanoid";

import {range} from "@cabildo-abierto/utils";
import {BskyProfileRecordProcessor, CAProfileRecordProcessor} from "#/services/sync/event-processing/profile.js";
import {AppBskyActorProfile} from "@atproto/api"
import {ArCabildoabiertoActorCaProfile} from "@cabildo-abierto/api"
import {createMailingListSubscription} from "#/services/emails/subscriptions.js";
import {Effect} from "effect";
import {DBError} from "#/services/write/article.js";
import {ATCreateRecordError} from "#/services/wiki/votes.js";

import {ProcessCreateError} from "#/services/sync/event-processing/record-processor.js";

async function getCAStatus(ctx: AppContext, did: string): Promise<{inCA: boolean, hasAccess: boolean} | null> {
    return await ctx.kysely
        .selectFrom("User")
        .select(["inCA", "hasAccess"])
        .where("did", "=", did)
        .executeTakeFirst() ?? null
}


export const login: CAHandlerNoAuth<{handle?: string, code?: string}> = async (ctx, agent, {handle, code}) => {

    if (!handle || !isValidHandle(handle.trim())) {
        return {error: "Nombre de usuario inválido."}
    }

    handle = handle.trim()

    const did = await Effect.runPromise(ctx.resolver.resolveHandleToDid(handle))
    if(!did) return {error: "No se encontró el usuario."}

    const status = await getCAStatus(ctx, did)

    if(!status || !status.inCA || !status.hasAccess){
        if(code){
            const {error} = await checkValidCode(ctx, code, did)
            if(error){
                return {error}
            } else {
                // continuamos con el login y usamos el código si el login termina bien
            }
        } else {
            return {error: "Necesitás un código de invitación para crear un usuario nuevo."}
        }
    }

    try {
        const url = await ctx.oauthClient?.authorize(handle, {
            scope: 'atproto transition:generic transition:chat.bsky transition:email',
        })
        return {data: {url}}
    } catch (err) {
        console.error(`Error authorizing ${handle}`, err)
        return {error: "Ocurrió un error al iniciar sesión."}
    }
}


export async function checkValidCode(ctx: AppContext, code: string, did: string){
    const res = await ctx.kysely
        .selectFrom("InviteCode")
        .select(["code", "usedByDid"])
        .where("code", "=", code)
        .executeTakeFirst()
    if(!res) return {error: "El código de invitación es inválido."}
    if(res.usedByDid && res.usedByDid != did) return {error: "El código de invitación ya fue usado."}
    return {}
}


export function createCAUser(ctx: AppContext, agent: SessionAgent, code?: string): Effect.Effect<void, DBError | AssignInviteCodeError | ProcessCreateError | ATCreateRecordError> {
    const did = agent.did

    return Effect.gen(function* () {
        yield* Effect.tryPromise({
            try: () => ctx.kysely
                .insertInto("User")
                .values([{did}])
                .onConflict(oc => oc.column("did").doNothing())
                .execute(),
            catch: () => new DBError()
        })

        if(code){
            yield* assignInviteCode(ctx, agent, code)
        }

        const caProfileRecord: ArCabildoabiertoActorCaProfile.Record = {
            $type: "ar.cabildoabierto.actor.caProfile",
            createdAt: new Date().toISOString()
        }

        const [{data}, {data: bskyProfile}] = yield* Effect.all([
            Effect.tryPromise({
                try: () => agent.bsky.com.atproto.repo.putRecord({
                    repo: did,
                    collection: "ar.cabildoabierto.actor.caProfile",
                    rkey: "self",
                    record: caProfileRecord
                }),
                catch: () => new ATCreateRecordError()
            }),
            Effect.tryPromise({
                try: () => agent.bsky.com.atproto.repo.getRecord({
                    repo: did,
                    collection: "app.bsky.actor.profile",
                    rkey: "self"
                }),
                catch: () => new ATCreateRecordError()
            })
        ], {concurrency: "unbounded"})

        const refAndRecordCA = {ref: {uri: data.uri, cid: data.cid}, record: caProfileRecord}
        const refAndRecordBsky = {ref: {uri: bskyProfile.uri, cid: bskyProfile.cid!}, record: bskyProfile.value as AppBskyActorProfile.Record}
        yield* Effect.all([
            new CAProfileRecordProcessor(ctx)
                .processValidated([refAndRecordCA]),
            new BskyProfileRecordProcessor(ctx)
                .processValidated([refAndRecordBsky])
        ], {concurrency: "unbounded"})
    })
}


export async function createInviteCodes(ctx: AppContext, count: number) {
    ctx.logger.pino.info(`creating ${count} invite codes.`)
    try {
        const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".toLowerCase();
        const generateInviteCode = customAlphabet(alphabet, 8)

        const values = range(count).map(i => {
            return {
                code: generateInviteCode()
            }
        })

        await ctx.kysely
            .insertInto("InviteCode")
            .values(values)
            .execute()

        return {data: {inviteCodes: values.map(c => c.code)}}
    } catch (err) {
        ctx.logger.pino.error({error: err}, `error creating invite codes`)
        return {error: "Ocurrió un error al crear los códigos de invitación"}
    }
}


export const createInviteCodesHandler: CAHandler<{query: {c: number}}, { inviteCodes: string[] }> = async (ctx, agent, {query}) => {
    return await createInviteCodes(ctx, query.c)
}


export class CodeNotFoundError {
    readonly _tag = "CodeNotFoundError"
}


export class UserNotFoundError {
    readonly _tag = "UserNotFoundError"
}


export class UsedCodeError {
    readonly _tag = "UsedCodeError"
}


export class GrantAccessError {
    readonly _tag = "GrantAccessError"
}


export type AssignInviteCodeError = CodeNotFoundError | UserNotFoundError | UsedCodeError | GrantAccessError


export function assignInviteCode(ctx: AppContext, agent: SessionAgent, inviteCode: string): Effect.Effect<void, AssignInviteCodeError> {
    const did = agent.did

    return Effect.gen(function* () {
        const [code, user] = yield* Effect.all([
            Effect.tryPromise({
                try: () => ctx.kysely
                    .selectFrom("InviteCode")
                    .select(["usedByDid"])
                    .where("code", "=", inviteCode)
                    .executeTakeFirstOrThrow(),
                catch: () => new CodeNotFoundError()
            }),
            Effect.tryPromise({
                try: () => ctx.kysely
                    .selectFrom("User")
                    .leftJoin("InviteCode", "InviteCode.usedByDid", "User.did")
                    .select([
                        "inCA",
                        "hasAccess",
                        "code"
                    ])
                    .where("User.did", "=", did)
                    .executeTakeFirstOrThrow(),
                catch: () => new UserNotFoundError()
            }),
        ], {concurrency: "unbounded"})

        if(user.code != null && user.inCA && user.hasAccess){
            return
        }

        if(code.usedByDid != null){
            return yield* Effect.fail(new UsedCodeError())
        }

        yield* Effect.tryPromise({
            try: () => ctx.kysely.transaction().execute(async trx => {
                if(!user.code) {
                    await trx
                        .updateTable("InviteCode")
                        .set("usedAt", new Date())
                        .set("usedByDid", did)
                        .where("code", "=", inviteCode)
                        .execute()
                }

                if(!user.hasAccess){
                    await trx
                        .updateTable("User")
                        .set("hasAccess", true)
                        .set("inCA", true)
                        .where("did", "=", did)
                        .execute()
                }
            }),
            catch: () => new GrantAccessError()
        })
    })

}


export const createAccessRequest: CAHandlerNoAuth<{email: string, comment: string}, {}> = async (ctx, agent, params) => {

    try {
        await ctx.kysely.insertInto("AccessRequest").values([{
            email: params.email,
            comment: params.comment,
            id: uuidv4()
        }]).execute()

        await createMailingListSubscription(ctx, params.email)
    } catch {
        return {error: "Ocurrió un error al crear la solicitud :("}
    }

    return {data: {}}
}

type AccessRequest = {
    id: string
    email: string
    comment: string
    createdAt: Date
    sentInviteAt: Date | null
    markedIgnored: boolean
}

export const getAccessRequests: CAHandler<{}, AccessRequest[]> = async (ctx, agent, {}) => {
    const requests: AccessRequest[] = await ctx.kysely
        .selectFrom("AccessRequest")
        .select([
            "email",
            "comment",
            "created_at as createdAt",
            "sentInviteAt",
            "id",
            "markedIgnored"
        ])
        .execute()

    return {data: requests}
}

export const getUnsentAccessRequestsCount: CAHandler<{}, {count: number}> = async (ctx, agent, {}) => {
    const result = await ctx.kysely
        .selectFrom("AccessRequest")
        .select(eb => eb.fn.count<number>("id").as("count"))
        .where("sentInviteAt", "is", null)
        .where("markedIgnored", "=", false)
        .executeTakeFirst()

    return {data: {count: result?.count ?? 0}}
}


export const markAccessRequestSent: CAHandler<{params: {id: string}}, {}> = async (ctx, agent, {params} ) => {
    await ctx.kysely
        .updateTable("AccessRequest")
        .set("sentInviteAt", new Date())
        .set("sentInviteAt_tz", new Date())
        .where("id", "=", params.id)
        .execute()

    return {data: {}}
}

export const markAccessRequestIgnored: CAHandler<{params: {id: string}}, {}> = async (ctx, agent, {params} ) => {
    await ctx.kysely
        .updateTable("AccessRequest")
        .set("markedIgnored", true)
        .where("id", "=", params.id)
        .execute()

    return {data: {}}
}


export const getInviteCodesToShare: CAHandler<{}, {code: string}[]> = async (ctx, agent, {}) => {
    const codes = await ctx.kysely
        .selectFrom("InviteCode")
        .select("code")
        .where("recommenderId", "=", agent.did)
        .where("usedByDid", "is", null)
        .execute()

    if(codes.length == 0){
        const allCodes = await ctx.kysely
            .selectFrom("InviteCode")
            .select("code")
            .where("recommenderId", "=", agent.did)
            .execute()
        if(allCodes.length < 3){
            const values: {
                code: string
                recommenderId: string
                created_at: Date
            }[] = []
            for(let i = 0; i < 3 - allCodes.length; i++){
                const code = uuidv4()
                values.push({
                    code,
                    recommenderId: agent.did,
                    created_at: new Date()
                })
            }
            if(values.length > 0){
                await ctx.kysely
                    .insertInto("InviteCode")
                    .values(values)
                    .execute()
            }
            return {
                data: values.map(c => ({code: c.code}))
            }
        }
    }

    return {
        data: codes
    }
}


export const assignInviteCodesToUsers = async (ctx: AppContext) => {

    await ctx.kysely.transaction().execute(async (db) => {
        const users = await db
            .selectFrom("User")
            .leftJoin("InviteCode", "InviteCode.recommenderId", "User.did")
            .select([
                "User.did",
                (eb) => eb.fn.count<number>("InviteCode.code").as("codeCount"),
            ])
            .where("inCA", "=", true)
            .groupBy("User.did")
            .execute()

        const values: {
            code: string
            recommenderId: string
            created_at: Date
        }[] = []
        users.forEach(u => {
            for(let i = 0; i < 3 - u.codeCount; i++){
                const code = uuidv4()
                values.push({
                    code,
                    recommenderId: u.did,
                    created_at: new Date()
                })
            }
        })
        if(values.length > 0){
            await db
                .insertInto("InviteCode")
                .values(values)
                .execute()
        }
    })
}