import {Agent, BaseAgent, cookieOptions, SessionAgent} from "#/utils/session-agent.js";
import {AppContext} from "#/setup.js";
import {isValidHandle} from "@atproto/syntax";
import {CAHandler, CAHandlerNoAuth, EffHandler, EffHandlerNoAuth} from "#/utils/handler.js";
import {v4 as uuidv4} from "uuid";
import {customAlphabet} from "nanoid";
import {range} from "@cabildo-abierto/utils";
import {BskyProfileRecordProcessor, CAProfileRecordProcessor} from "#/services/sync/event-processing/profile.js";
import {AppBskyActorProfile, AtpBaseClient} from "@atproto/api"
import {
    ArCabildoabiertoActorCaProfile,
    LoginOutput,
    LoginParams,
    Session, SignupOutput,
    SignupParams
} from "@cabildo-abierto/api"
import {createMailingListSubscription} from "#/services/emails/subscriptions.js";
import {Effect, Exit} from "effect";
import {DBInsertError, DBSelectError, InvalidValueError} from "#/utils/errors.js";
import {ATCreateRecordError} from "#/services/wiki/votes.js";
import {ProcessCreateError} from "#/services/sync/event-processing/record-processor.js";
import {getIronSession} from "iron-session";
import {env} from "#/lib/env.js";
import {Request, Response} from "express";
import {ComAtprotoServerCreateAccount} from "@atproto/api";


function getCAStatus(ctx: AppContext, did: string): Effect.Effect<{
    inCA: boolean,
    hasAccess: boolean
} | undefined, DBSelectError> {
    return Effect.tryPromise({
        try: () => {
            return ctx.kysely
                .selectFrom("User")
                .select(["inCA", "hasAccess"])
                .where("did", "=", did)
                .executeTakeFirst()
        },
        catch: (error) => new DBSelectError(error)
    })
}


export class OAuthAuthorizationError {
    readonly _tag = "OAuthAuthorizationError"
}


/***
 acá empieza el proceso de login
 ***/
export const loginHandler: EffHandlerNoAuth<LoginParams, LoginOutput> = (
    ctx,
    agent,
    {handle, code}
) => login(ctx, agent, handle, code).pipe(
    Effect.catchTag("InvalidValueError", () => Effect.fail("El nombre de usuario es inválido.")),
    Effect.catchTag("InvalidCodeError", () => Effect.fail("El código de invitación es inválido.")),
    Effect.catchTag("UsedCodeError", () => Effect.fail("El código de invitación ya fue usado.")),
    Effect.catchTag("DBSelectError", () => Effect.fail("Ocurrió un error al iniciar sesión.")),
    Effect.catchTag("HandleResolutionError", () => Effect.fail("Ocurrió un error al iniciar sesión.")),
    Effect.catchTag("OAuthAuthorizationError", () => Effect.fail("Ocurrió un error en la conexión con ATProtocol.")),
    Effect.catchTag("AlreadyLoggedInError", () => Effect.fail("Hay una sesión activa.")),
    Effect.catchTag("NoInviteCodeError", () => Effect.fail("Necesitás un código de invitación para crear una cuenta."))
)


export class AlreadyLoggedInError {
    readonly _tag = "AlreadyLoggedInError"
}


export class NoInviteCodeError {
    readonly _tag = "NoInviteCodeError"
}


const login = (
    ctx: AppContext,
    agent: Agent,
    handle: string,
    code?: string
) => Effect.gen(function* () {

    if (agent.hasSession()) {
        return yield* Effect.fail(new AlreadyLoggedInError())
    }

    if (!isValidHandle(handle.trim())) {
        return yield* Effect.fail(new InvalidValueError("Nombre de usuario inválido."))
    }

    handle = handle.trim()

    const did = yield* ctx.resolver.resolveHandleToDid(handle)

    const status = yield* getCAStatus(ctx, did)

    if (!status || !status.inCA || !status.hasAccess) {
        if (code) {
            yield* checkValidCode(ctx, code, did)
        } else {
            return yield* Effect.fail(new NoInviteCodeError())
        }
    }

    const oauthCli = ctx.oauthClient

    if (!oauthCli) return yield* Effect.fail("Ocurrió un error al iniciar sesión.")

    const url = yield* Effect.tryPromise({
        try: () => oauthCli.authorize(handle, {
            scope: 'atproto transition:generic transition:chat.bsky transition:email',
        }),
        catch: () => new OAuthAuthorizationError()
    })

    return {url: url.href}
}).pipe(Effect.withSpan("login", {attributes: {handle, code}}))


export class OAuthError {
    readonly _tag = "OAuthError"
    name: string | undefined
    message: string | undefined

    constructor(error?: unknown) {
        if (error && error instanceof Error) {
            this.name = error?.name
            this.message = error?.message
        }
    }
}


export const oauthCallbackHandler = (
    ctx: AppContext
) => async (req: Request, res: Response) => {
    const oauthClient = ctx.oauthClient
    if (!oauthClient) return

    const exit = await Effect.runPromiseExit(
        Effect.tryPromise({
            try: async () => {
                const params = new URLSearchParams(req.originalUrl.split('?')[1])
                const {session} = await oauthClient.callback(params)
                const clientSession = await getIronSession<Session>(req, res, cookieOptions)
                clientSession.did = session.did
                await clientSession.save()
            },
            catch: error => {
                return Effect.fail(new OAuthError(error))
            }
        }).pipe(Effect.withSpan("oauth-callback"))
    )

    return Exit.match(exit, {
        onSuccess: () => {
            return res.redirect(env.FRONTEND_URL + '/login/ok')
        },
        onFailure: () => {
            ctx.logger.pino.info("redirecting to error")
            return res.redirect(env.FRONTEND_URL + '/login/error')
        }
    })
}


export class InvalidCodeError {
    readonly _tag = "InvalidCodeError"
}


const checkValidCode = (
    ctx: AppContext,
    code: string,
    did: string
): Effect.Effect<void, DBSelectError | InvalidCodeError | UsedCodeError> => Effect.gen(function* () {
    const res = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("InviteCode")
            .select(["code", "usedByDid"])
            .where("code", "=", code)
            .executeTakeFirst(),
        catch: (error) => new DBSelectError(error)
    })
    if (!res) return yield* Effect.fail(new InvalidCodeError())
    if (res.usedByDid && res.usedByDid != did) return yield* Effect.fail(new UsedCodeError())
})


export class CreateAccountError {
    readonly _tag = "CreateAccountError"
}


export class GetInviteCodeError {
    readonly _tag = "GetInviteCodeError"
    constructor(readonly message?: string) {}
}


const signup = (
    ctx: AppContext,
    agent: BaseAgent,
    data: SignupParams
): Effect.Effect<SignupOutput, CreateAccountError | GetInviteCodeError> => Effect.gen(function* () {
    ctx.logger.pino.info({data}, "signup")
    if (agent.hasSession()) {
        return {did: agent.did}
    } else {
        const CAPdsAgent = new AtpBaseClient("https://cabildo.ar")

        const inviteCode = ""

        const params: ComAtprotoServerCreateAccount.InputSchema = {
            email: data.email,
            handle: data.handle,
            inviteCode,
            password: data.password
        }

        const res = yield* Effect.tryPromise({
            try: () => CAPdsAgent.com.atproto.server.createAccount(params),
            catch: () => new CreateAccountError()
        })

        if (!res.success) {
            return yield* Effect.fail(new CreateAccountError())
        }

        const did = res.data.did
        return {did}
    }
}).pipe(Effect.withSpan("signup", {attributes: {data}}))


export const signupHandler: EffHandlerNoAuth<SignupParams, SignupOutput> = (
    ctx, agent, data
) =>
    signup(ctx, agent, data).pipe(
        Effect.catchTag("CreateAccountError", () => Effect.fail("Ocurrió un error al crear la cuenta")),
        Effect.catchTag("GetInviteCodeError", () => Effect.fail("Ocurrió un error al crear la cuenta"))
    )


export const backfillInviteCodes: EffHandler<{}, {}> = (ctx, agent) => Effect.gen(function* () {
    const codes = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("InviteCode")
            .select("code")
            .where("InviteCode.pdsInvite", "is", null)
            .limit(5)
            .execute(),
        catch: (error) => new DBSelectError(error)
    })

    const basicAuth = Buffer.from(`admin:${env.PDS_PASSWORD}`).toString("base64");

    const resCode = yield* Effect.tryPromise({
        try: () => fetch("https://cabildo.ar/xrpc/com.atproto.server.createInviteCodes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${basicAuth}`,
            },
            body: JSON.stringify({
                codeCount: codes.length,
                useCount: 1,
            }),
        }),
        catch: (error) => new GetInviteCodeError(error instanceof Error ? `${error.name}:${error.message}` : undefined)
    })

    if(resCode.ok) {
        const data = (yield* Effect.tryPromise({
            try: () => resCode.json(),
            catch: () => new GetInviteCodeError("json failed")
        })) as {codes: {account: string, codes: string[]}[]}
        ctx.logger.pino.info({data}, "got codes")

        if(data.codes.length == 0) {
            return yield* Effect.fail("No se obtuvo la cantidad correcta de códigos.")
        }

        const pdsCodes = data.codes[0].codes

        if(pdsCodes.length != codes.length) {
            return yield* Effect.fail("No se obtuvo la cantidad correcta de códigos.")
        }

        yield* Effect.tryPromise({
            try: () => ctx.kysely
                .insertInto("InviteCode")
                .values(pdsCodes.map((c, i) => ({
                    pdsInvite: c,
                    code: codes[i].code
                })))
                .onConflict(oc => oc.column("code").doNothing())
                .execute(),
            catch: (error) => new DBInsertError(error)
        })
    } else {
        return yield* Effect.fail(new GetInviteCodeError())
    }

    return {}
}).pipe(
    Effect.withSpan("backfillInviteCodes")
).pipe(
    Effect.catchAll(() => Effect.fail("Ocurrió un error al obtener los códigos de invitación."))
)


export function createCAUser(
    ctx: AppContext,
    agent: SessionAgent,
    code?: string
): Effect.Effect<void, DBInsertError | AssignInviteCodeError | ProcessCreateError | ATCreateRecordError> {
    const did = agent.did

    return Effect.gen(function* () {
        yield* Effect.tryPromise({
            try: () => ctx.kysely
                .insertInto("User")
                .values([{did}])
                .onConflict(oc => oc.column("did").doNothing())
                .execute(),
            catch: (error) => new DBInsertError(error)
        })

        if (code) {
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
        const refAndRecordBsky = {
            ref: {uri: bskyProfile.uri, cid: bskyProfile.cid!},
            record: bskyProfile.value as AppBskyActorProfile.Record
        }
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


export const createInviteCodesHandler: CAHandler<{ query: { c: number } }, {
    inviteCodes: string[]
}> = async (ctx, agent, {query}) => {
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

        if (user.code != null && user.inCA && user.hasAccess) {
            return
        }

        if (code.usedByDid != null) {
            return yield* Effect.fail(new UsedCodeError())
        }

        yield* Effect.tryPromise({
            try: () => ctx.kysely.transaction().execute(async trx => {
                if (!user.code) {
                    await trx
                        .updateTable("InviteCode")
                        .set("usedAt", new Date())
                        .set("usedByDid", did)
                        .where("code", "=", inviteCode)
                        .execute()
                }

                if (!user.hasAccess) {
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


export const createAccessRequest: CAHandlerNoAuth<{
    email: string,
    comment: string
}, {}> = async (ctx, agent, params) => {

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

export const getUnsentAccessRequestsCount: CAHandler<{}, { count: number }> = async (ctx, agent, {}) => {
    const result = await ctx.kysely
        .selectFrom("AccessRequest")
        .select(eb => eb.fn.count<number>("id").as("count"))
        .where("sentInviteAt", "is", null)
        .where("markedIgnored", "=", false)
        .executeTakeFirst()

    return {data: {count: result?.count ?? 0}}
}


export const markAccessRequestSent: CAHandler<{ params: { id: string } }, {}> = async (ctx, agent, {params}) => {
    await ctx.kysely
        .updateTable("AccessRequest")
        .set("sentInviteAt", new Date())
        .set("sentInviteAt_tz", new Date())
        .where("id", "=", params.id)
        .execute()

    return {data: {}}
}

export const markAccessRequestIgnored: CAHandler<{ params: { id: string } }, {}> = async (ctx, agent, {params}) => {
    await ctx.kysely
        .updateTable("AccessRequest")
        .set("markedIgnored", true)
        .where("id", "=", params.id)
        .execute()

    return {data: {}}
}


export const getInviteCodesToShare: CAHandler<{}, { code: string }[]> = async (ctx, agent, {}) => {
    const codes = await ctx.kysely
        .selectFrom("InviteCode")
        .select("code")
        .where("recommenderId", "=", agent.did)
        .where("usedByDid", "is", null)
        .execute()

    if (codes.length == 0) {
        const allCodes = await ctx.kysely
            .selectFrom("InviteCode")
            .select("code")
            .where("recommenderId", "=", agent.did)
            .execute()
        if (allCodes.length < 3) {
            const values: {
                code: string
                recommenderId: string
                created_at: Date
            }[] = []
            for (let i = 0; i < 3 - allCodes.length; i++) {
                const code = uuidv4()
                values.push({
                    code,
                    recommenderId: agent.did,
                    created_at: new Date()
                })
            }
            if (values.length > 0) {
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
            for (let i = 0; i < 3 - u.codeCount; i++) {
                const code = uuidv4()
                values.push({
                    code,
                    recommenderId: u.did,
                    created_at: new Date()
                })
            }
        })
        if (values.length > 0) {
            await db
                .insertInto("InviteCode")
                .values(values)
                .execute()
        }
    })
}