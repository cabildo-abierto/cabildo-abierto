import {Agent, BaseAgent, cookieOptions, SessionAgent} from "#/utils/session-agent.js";
import {AppContext} from "#/setup.js";
import {isValidHandle} from "@atproto/syntax";
import {CAHandler, EffHandler, EffHandlerNoAuth} from "#/utils/handler.js";
import {v4 as uuidv4} from "uuid";
import {BskyProfileRecordProcessor, CAProfileRecordProcessor} from "#/services/sync/event-processing/profile.js";
import {AppBskyActorProfile, AtpBaseClient} from "@atproto/api"
import {
    ArCabildoabiertoActorCaProfile,
    LoginOutput,
    LoginParams,
    Session, SignupOutput,
    SignupParams
} from "@cabildo-abierto/api"
import {createMailingListSubscription, isValidEmail} from "#/services/emails/subscriptions.js";
import {Effect, Exit} from "effect";
import {DBInsertError, DBSelectError, DBUpdateError, InvalidValueError} from "#/utils/errors.js";
import {ATCreateRecordError, ATGetRecordError} from "#/services/wiki/votes.js";
import {ProcessCreateError} from "#/services/sync/event-processing/record-processor.js";
import {getIronSession} from "iron-session";
import {env} from "#/lib/env.js";
import {Request, Response} from "express";
import {ComAtprotoServerCreateAccount} from "@atproto/api";
import {RefAndRecord} from "#/services/sync/types.js";
import {HandleResolutionError} from "#/services/user/users.js";
import {RedisCacheFetchError, RedisCacheSetError} from "#/services/redis/cache.js";


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
    name: string | undefined
    message: string | undefined
    constructor(error?: unknown) {
        if(error && error instanceof Error) {
            this.name = error?.name
            this.message = error?.message
        }
    }
}


/***
 acá empieza el proceso de login
 ***/
export const loginHandler: EffHandlerNoAuth<LoginParams, LoginOutput> = (
    ctx,
    agent,
    {handle, code}
) => login(ctx, agent, handle, code).pipe(
    Effect.catchTag("UserNotFoundError", (error) => error.message == "maybe-domain" ? Effect.fail(`¿Quizás el dominio sea ${handle.includes(".cabildo.ar") ? ".bsky.social" : ".cabildo.ar"}?`) : Effect.fail("No se encontró el usuario.")),
    Effect.catchTag("RedisCacheFetchError", () => Effect.fail("Ocurrió un error al iniciar sesión.")),
    Effect.catchTag("RedisCacheSetError", () => Effect.fail("Ocurrió un error al iniciar sesión.")),
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


function getAltHandle(handle: string) {
    if(handle.includes(".cabildo.ar")){
        return handle.replace(".cabildo.ar", ".bsky.social")
    } else if(handle.includes(".bsky.social")) {
        return handle.replace(".bsky.social", ".cabildo.ar")
    } else {
        return handle
    }
}


const login = (
    ctx: AppContext,
    agent: Agent,
    handle: string,
    code?: string
) => Effect.gen(function* () {
    ctx.logger.pino.info({handle, code}, "logging in")

    if (agent.hasSession()) {
        return yield* Effect.fail(new AlreadyLoggedInError())
    }

    if (!isValidHandle(handle.trim())) {
        return yield* Effect.fail(new InvalidValueError("handle"))
    }

    handle = handle.trim()

    const did = yield* ctx.resolver.resolveHandleToDid(handle)
    if(!did) {
        const altHandle = getAltHandle(handle)
        if(altHandle != handle) {
            const did2 = yield* ctx.resolver.resolveHandleToDid(altHandle)
            if(did2) {
                return yield* Effect.fail(new UserNotFoundError("maybe-domain"))
            }
        }

        return yield* Effect.fail(new UserNotFoundError())
    }

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
        catch: (error) => new OAuthAuthorizationError(error)
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
    did?: string
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
    name: string | undefined
    message: string | undefined
    constructor(error?: unknown) {
        if(error && error instanceof Error) {
            this.name = error?.name
            this.message = error?.message
        }
    }
}


export class GetInviteCodeError {
    readonly _tag = "GetInviteCodeError"
    constructor(readonly message?: string) {}
}


const checkEmailExists = (ctx: AppContext, email: string) => Effect.gen(function* () {
    const rows = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("User")
            .leftJoin("MailingListSubscription", "MailingListSubscription.userId", "User.did")
            .where(eb => eb.or([
                eb("User.email", "=", email),
                eb("MailingListSubscription.email", "=", email)
            ]))
            .execute(),
        catch: (error) => new DBSelectError(error)
    })

    return rows.length > 0
})


const registerUserInDB = (
    ctx: AppContext,
    data: {did: string, code: string, email: string, handle: string, dateOfBirth: string}
) => Effect.gen(function* () {
    yield* Effect.tryPromise({
        try: () => ctx.kysely
            .insertInto("User")
            .values([{
                did: data.did,
                handle: data.handle,
                email: data.email,
                dateOfBirth: data.dateOfBirth
            }])
            .onConflict(oc => oc
                .column("did")
                .doUpdateSet(eb => ({
                handle: eb.ref("excluded.handle"),
                email: eb.ref("excluded.email")
            })))
            .execute(),
        catch: (error) => new DBInsertError(error)
    })

    yield* assignInviteCode(ctx, data.did, data.code)
})


const signup = (
    ctx: AppContext,
    agent: BaseAgent,
    data: SignupParams
): Effect.Effect<SignupOutput, NoInviteCodeError | InvalidCodeError | DBUpdateError | UserNotFoundError | UsedCodeError | CodeNotFoundError | DBInsertError | HandleResolutionError | RedisCacheFetchError | RedisCacheSetError | InvalidValueError | OAuthAuthorizationError | CreateAccountError | GetInviteCodeError | DBSelectError> => Effect.gen(function* () {
    if (agent.hasSession()) {
        return {did: agent.did}
    } else {
        const validHandle = isValidHandle(data.handle)
        if(!validHandle) {
            return yield* Effect.fail(new InvalidValueError("handle"))
        }

        const validEmail = isValidEmail(data.email)
        if(!validEmail) {
            return yield* Effect.fail(new InvalidValueError("email"))
        }

        const validDateOfBirth = /^\d{4}-\d{2}-\d{2}$/.test(data.dateOfBirth)
        if(!validDateOfBirth || data.dateOfBirth > new Date().toISOString().split("T")[0]) {
            return yield* Effect.fail(new InvalidValueError("dateOfBirth"))
        }

        const emailExists = yield* checkEmailExists(ctx, data.email)
        if(emailExists) {
            return yield* Effect.fail(new InvalidValueError("email-exists"))
        }

        const did = yield* ctx.resolver.resolveHandleToDid(data.handle)
        if(did) {
            return yield* Effect.fail(new InvalidValueError("handle-exists"))
        }

        const oauthClient = ctx.oauthClient
        if(!oauthClient) {
            return yield* Effect.fail(new CreateAccountError())
        }

        const CAPdsAgent = new AtpBaseClient("https://cabildo.ar")

        if(!data.code) {
            return yield* Effect.fail(new NoInviteCodeError())
        }

        yield* checkValidCode(ctx, data.code)

        const inviteCode = yield* Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("InviteCode")
                .select(["code", "pdsInvite"])
                .where("code", "=", data.code)
                .executeTakeFirst(),
            catch: (error) => new DBSelectError(error)
        })

        if(!inviteCode || !inviteCode.pdsInvite) {
            return yield* Effect.fail(new GetInviteCodeError())
        }

        const params: ComAtprotoServerCreateAccount.InputSchema = {
            email: data.email,
            handle: data.handle,
            inviteCode: inviteCode.pdsInvite,
            password: data.password
        }

        const res = yield* Effect.tryPromise({
            try: () => CAPdsAgent.com.atproto.server.createAccount(params),
            catch: (error) => new CreateAccountError(error)
        })

        if (!res.success) {
            return yield* Effect.fail(new CreateAccountError())
        }

        yield* registerUserInDB(ctx, {
            did: res.data.did,
            email: data.email,
            code: data.code,
            handle: data.handle,
            dateOfBirth: data.dateOfBirth
        })

        return {did: res.data.did}
    }
}).pipe(Effect.withSpan("signup", {attributes: {data}}))


export const signupHandler: EffHandlerNoAuth<SignupParams, SignupOutput> = (
    ctx, agent, params
) => signup(ctx, agent, params).pipe(
    Effect.catchTag("InvalidValueError", (error) => {
        if(error.message == "handle") {
            return Effect.fail("Nombre de usuario inválido.")
        } else if(error.message == "email-exists") {
            return Effect.fail("El correo ya fue usado.")
        } else if(error.message == "handle-exists") {
            return Effect.fail("El nombre de usuario ya fue usado.")
        } else if(error.message == "dateOfBirth") {
            return Effect.fail("Fecha de nacimiento inválida.")
        } else if(error.message == "email") {
            return Effect.fail("Ingresá una dirección de correo válida.")
        } else {
            return Effect.fail("Ocurrió un error al crear la cuenta.")
        }
    }),
    Effect.catchTag("InvalidCodeError", () => Effect.fail("El código de invitación es inválido.")),
    Effect.catchTag("UserNotFoundError", () => Effect.fail("Ocurrió un error al crear la cuenta.")),
    Effect.catchTag("DBUpdateError", () => Effect.fail("Ocurrió un error al crear la cuenta.")),
    Effect.catchTag("RedisCacheFetchError", () => Effect.fail("Ocurrió un error al crear la cuenta.")),
    Effect.catchTag("RedisCacheSetError", () => Effect.fail("Ocurrió un error al crear la cuenta.")),
Effect.catchTag("HandleResolutionError", () => Effect.fail("Ocurrió un error al crear la cuenta.")),
    Effect.catchTag("OAuthAuthorizationError", () => Effect.fail("Ocurrió un error al crear la cuenta.")),
    Effect.catchTag("NoInviteCodeError", () => Effect.fail("Necesitás un código de invitación.")),
    Effect.catchTag("DBSelectError", () => Effect.fail("Ocurrió un error al crear la cuenta.")),
    Effect.catchTag("CreateAccountError", (error) => {
        if(error.message == "Handle too long") {
            return Effect.fail("El nombre de usuario es demasiado largo.")
        } else {
            return Effect.fail("Ocurrió un error al crear la cuenta.")
        }
    }),
    Effect.catchTag("GetInviteCodeError", () => Effect.fail("El código de invitación es inválido.")),
    Effect.catchTag("DBInsertError", () => Effect.fail("Ocurrió un error al crear la cuenta.")),
    Effect.catchTag("UsedCodeError", () => Effect.fail("El código de invitación ya fue usado.")),
    Effect.catchTag("CodeNotFoundError", () => Effect.fail("El código de invitación es inválido.")),
)



export const backfillInviteCodes: EffHandler<{}, {}> = (
    ctx
) => Effect.gen(function* () {
    const codes = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("InviteCode")
            .select("code")
            .where("InviteCode.pdsInvite", "is", null)
            .where("InviteCode.usedByDid", "is", null)
            .limit(100)
            .execute(),
        catch: (error) => new DBSelectError(error)
    })

    ctx.logger.pino.info({codes: codes.length}, "codes to backfill")

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

        if(data.codes.length == 0) {
            return yield* Effect.fail("No se obtuvo la cantidad correcta de códigos.")
        }

        const pdsCodes = data.codes[0].codes

        if(pdsCodes.length != codes.length) {
            return yield* Effect.fail("No se obtuvo la cantidad correcta de códigos.")
        }

        const values = pdsCodes.map((c, i) => ({
            pdsInvite: c,
            code: codes[i].code
        }))

        yield* Effect.tryPromise({
            try: () => ctx.kysely
                .insertInto("InviteCode")
                .values(values)
                .onConflict(oc => oc.column("code").doUpdateSet(eb => ({
                    pdsInvite: eb.ref("excluded.pdsInvite")
                })))
                .execute(),
            catch: (error) => new DBInsertError(error)
        })
        ctx.logger.pino.info(`inserted ${pdsCodes.length} codes`)
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
): Effect.Effect<void, DBInsertError | ATGetRecordError | AssignInviteCodeError | ProcessCreateError | ATCreateRecordError> {
    const did = agent.did

    return Effect.gen(function* () {
        yield* Effect.tryPromise({
            try: () => ctx.kysely
                .insertInto("User")
                .values([{did, created_at_tz: new Date()}])
                .onConflict(oc => oc.column("did").doNothing())
                .execute(),
            catch: (error) => new DBInsertError(error)
        })

        if (code) {
            yield* assignInviteCode(ctx, agent.did, code)
        }

        const caProfileRecord: ArCabildoabiertoActorCaProfile.Record = {
            $type: "ar.cabildoabierto.actor.caProfile",
            createdAt: new Date().toISOString()
        }

        const [caProfileRes, bskyProfileRes] = yield* Effect.all([
            Effect.tryPromise({
                try: () => agent.bsky.com.atproto.repo.putRecord({
                    repo: did,
                    collection: "ar.cabildoabierto.actor.caProfile",
                    rkey: "self",
                    record: caProfileRecord
                }),
                catch: (error) => new ATCreateRecordError(error)
            }),
            Effect.tryPromise({
                try: () => agent.bsky.com.atproto.repo.getRecord({
                    repo: did,
                    collection: "app.bsky.actor.profile",
                    rkey: "self"
                }),
                catch: (error) => new ATGetRecordError(error)
            }).pipe(
                Effect.catchTag("ATGetRecordError", (error) => {
                    if(error.message?.includes("Could not locate record")) {
                        return Effect.succeed(null)
                    } else {
                        return Effect.fail(error)
                    }
                })
            )
        ], {concurrency: "unbounded"})

        if(!caProfileRes.success) {
            return yield* Effect.fail(new ATCreateRecordError())
        }

        const {data} = caProfileRes

        const refAndRecordCA = {ref: {uri: data.uri, cid: data.cid}, record: caProfileRecord}

        const effects: Effect.Effect<void, ProcessCreateError | ATCreateRecordError>[] = [
            new CAProfileRecordProcessor(ctx)
                .processValidated([refAndRecordCA])
        ]

        if(bskyProfileRes && bskyProfileRes.success) {
            const bskyProfile = bskyProfileRes.data
            const refAndRecordBsky = {
                ref: {uri: bskyProfile.uri, cid: bskyProfile.cid!},
                record: bskyProfile.value as AppBskyActorProfile.Record
            }
            effects.push(new BskyProfileRecordProcessor(ctx)
                .processValidated([refAndRecordBsky]))
        } else {
            const bskyProfile: AppBskyActorProfile.Record = {
                $type: "app.bsky.actor.profile",
                createdAt: new Date().toISOString()
            }
            const res = yield* Effect.tryPromise({
                try: () => agent.bsky.com.atproto.repo.putRecord({
                    repo: did,
                    collection: "app.bsky.actor.profile",
                    rkey: "self",
                    record: bskyProfile
                }),
                catch: (error) => new ATCreateRecordError(error)
            })
            if(res.success) {
                const refAndRecordBsky: RefAndRecord<AppBskyActorProfile.Record> = {
                    ref: {
                        uri: res.data.uri,
                        cid: res.data.cid
                    },
                    record: bskyProfile
                }
                effects.push(
                    new BskyProfileRecordProcessor(ctx)
                        .processValidated([refAndRecordBsky])
                )
            }
        }

        yield* Effect.all(effects, {concurrency: "unbounded"})
    })
}


export const createPDSInviteCodes = (
    ctx: AppContext,
    agent: SessionAgent,
    count: number
) => Effect.gen(function* () {
    const basicAuth = Buffer.from(`admin:${env.PDS_PASSWORD}`).toString("base64");

    const resCode = yield* Effect.tryPromise({
        try: () => fetch("https://cabildo.ar/xrpc/com.atproto.server.createInviteCodes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${basicAuth}`,
            },
            body: JSON.stringify({
                codeCount: Number(count),
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

        if(data.codes.length == 0) {
            return yield* Effect.fail("No se obtuvo la cantidad correcta de códigos.")
        }

        const pdsCodes = data.codes[0].codes

        if(pdsCodes.length != count) {
            return yield* Effect.fail("No se obtuvo la cantidad correcta de códigos.")
        }

        return pdsCodes
    } else {
        return yield* Effect.fail(new GetInviteCodeError("res not ok"))
    }
})


export const createInviteCodes = (
    ctx: AppContext,
    agent: SessionAgent,
    count: number) => Effect.gen(function* () {

    const values = yield* createPDSInviteCodes(ctx, agent, count)

    yield* Effect.tryPromise({
        try: () => ctx.kysely
            .insertInto("InviteCode")
            .values(values.map(v => ({
                code: v,
                pdsInvite: v
            })))
            .execute(),
        catch: (error) => new DBInsertError(error)
    })

    return values
}).pipe(Effect.withSpan("createInviteCodes"))


export const createInviteCodesHandler: EffHandler<{ query: { c: number } }, {
    inviteCodes: string[]
}> = (ctx, agent, {query}) => {
    return createInviteCodes(ctx, agent, query.c).pipe(
        Effect.map(inviteCodes => ({inviteCodes})),
        Effect.catchTag("GetInviteCodeError", () => Effect.fail("Ocurrió un error al crear los códigos de invitación.")),
        Effect.catchTag("DBInsertError", () => Effect.fail("Ocurrió un error al crear los códigos de invitación."))
    )
}


export class CodeNotFoundError {
    readonly _tag = "CodeNotFoundError"
}


export class UserNotFoundError {
    readonly _tag = "UserNotFoundError"
    constructor(readonly message?: string) {}
}


export class UsedCodeError {
    readonly _tag = "UsedCodeError"
}


export type AssignInviteCodeError = CodeNotFoundError | UserNotFoundError | UsedCodeError | DBUpdateError


const checkInviteCode = (
    ctx: AppContext,
    did: string,
    inviteCode: string
) => Effect.gen(function*  () {
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
    return {code, user}
})


export function assignInviteCode(ctx: AppContext, did: string, inviteCode: string): Effect.Effect<
    void, AssignInviteCodeError
> {

    return Effect.gen(function* () {
        const {user, code} = yield* checkInviteCode(ctx, did, inviteCode)

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
                        .set("usedAt_tz", new Date())
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
            catch: (error) => new DBUpdateError(error)
        })
    })

}


export const createAccessRequest: EffHandlerNoAuth<{
    email: string,
    comment: string
}, {}> = (ctx, agent, params) => Effect.gen(function* () {

    yield* Effect.tryPromise({
        try: () => ctx.kysely.insertInto("AccessRequest").values([{
            email: params.email,
            comment: params.comment,
            id: uuidv4()
        }]).execute(),
        catch: (error) => new DBInsertError(error)
    })

    yield* createMailingListSubscription(ctx, params.email)

    return {}
}).pipe(
    Effect.catchTag("InvalidEmailError", () => Effect.fail("Ingresá un correo electrónico válido.")),
    Effect.catchTag("UsedEmailError", () => Effect.succeed({})),
    Effect.catchTag("CreateMailingListSubscriptionError", () => Effect.fail("Ocurrió un error al crear la solicitud de acceso.")),
    Effect.catchTag("DBInsertError", () => Effect.fail("Ocurrió un error al crear la solicitud de acceso.")),
)

type AccessRequest = {
    id: string
    email: string
    comment: string
    createdAt: Date
    sentInviteAt: Date | null
    markedIgnored: boolean
}

export const getAccessRequests: CAHandler<{}, AccessRequest[]> = async (ctx) => {
    const requests: AccessRequest[] = await ctx.kysely
        .selectFrom("AccessRequest")
        .select([
            "email",
            "comment",
            "created_at_tz as createdAt",
            "sentInviteAt_tz as sentInviteAt",
            "id",
            "markedIgnored"
        ])
        .execute()

    return {data: requests}
}

export const getUnsentAccessRequestsCount: CAHandler<{}, { count: number }> = async (ctx) => {
    const result = await ctx.kysely
        .selectFrom("AccessRequest")
        .select(eb => eb.fn.count<number>("id").as("count"))
        .where("sentInviteAt_tz", "is", null)
        .where("markedIgnored", "=", false)
        .executeTakeFirst()

    return {data: {count: result?.count ?? 0}}
}


export const markAccessRequestSent: CAHandler<{ params: { id: string } }, {}> = async (ctx, agent, {params}) => {
    await ctx.kysely
        .updateTable("AccessRequest")
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