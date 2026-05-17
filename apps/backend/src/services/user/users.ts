import {AppContext} from "#/setup.js";
import {cookieOptions, SessionAgent} from "#/utils/session-agent.js";
import {CAHandler, EffHandler, EffHandlerNoAuth} from "#/utils/handler.js";
import {hydrateProfileViewDetailed} from "#/services/hydration/profile.js";
import {DataPlane, makeDataPlane} from "#/services/hydration/dataplane.js";
import {getIronSession} from "iron-session";
import {AssignInviteCodeError, createCAUser, UserNotFoundError} from "#/services/user/access.js";
import {AppBskyGraphFollow} from "@atproto/api"
import {
    Account,
    ArCabildoabiertoActorCaProfile,
    ArCabildoabiertoActorDefs,
    ATProtoStrongRef,
    MaybeSession,
    Session,
    VerificationState
} from "@cabildo-abierto/api"
import {BlobRef} from "@atproto/lexicon";
import {getServiceEndpointForDid, uploadBase64Blob} from "#/services/blob.js";
import {InsertRecordError, processValidatedRecords} from "#/services/record/processing.js";
import * as Effect from "effect/Effect";
import {pipe} from "effect";
import {handleOrDidToDid} from "#/id-resolver.js";
import {createMailingListSubscription} from "#/services/emails/subscriptions.js";
import {ATCreateRecordError, ATGetRecordError} from "#/services/votes/votes.js";
import {RedisCacheFetchError, RedisCacheSetError} from "#/services/redis/cache.js";
import {AddJobError, DBInsertError, DBSelectError, InvalidValueError, UpdateRedisError} from "#/utils/errors.js";
import {CIDEncodeError} from "#/services/write/topic.js";
import {caProfileRecordProcessor} from "#/services/sync/event-processing/profile.js";


export function dbHandleToDid(ctx: AppContext, handleOrDid: string): Effect.Effect<string | null, DBSelectError> {
    if (handleOrDid.startsWith("did")) {
        return Effect.succeed(handleOrDid)
    } else {
        return Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("User")
                .select("did")
                .where("handle", "=", handleOrDid)
                .executeTakeFirst(),
            catch: (error) => new DBSelectError(error)
        })
            .pipe(Effect.map(res => res?.did ?? null))
    }
}

export class HandleResolutionError {
    readonly _tag = "HandleResolutionError"
    name: string | undefined
    message: string | undefined
    constructor(error?: unknown) {
        if(error && error instanceof Error) {
            this.name = error?.name
            this.message = error?.message
        }
    }
}


export const getCAUsersDids = (ctx: AppContext): Effect.Effect<string[], DBSelectError> => {
    return Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("User")
            .select("did")
            .where("inCA", "=", true)
            .where("hasAccess", "=", true)
            .execute(),
        catch: (error) => new DBSelectError(error)
    }).pipe(Effect.map(users => {
        return users.map(({did}) => did)
    }))
}


type UserAccessStatus = {
    did: string
    handle: string | null
    createdAt: Date | null
    hasAccess: boolean
    inCA: boolean
    inviteCode: string | null
    displayName: string | null
}


export const getUsers: CAHandler<{}, UserAccessStatus[]> = async (ctx) => {
    try {
        const users = await ctx.kysely
            .selectFrom("User")
            .leftJoin("InviteCode", "InviteCode.usedByDid", "User.did")
            .select([
                "did",
                "handle",
                "displayName",
                "hasAccess",
                "User.createdAt",
                "inCA",
                "InviteCode.code"
            ])
            .where(eb => eb.or([
                eb("InviteCode.code", "is not", null),
                eb("User.inCA", "=", true),
                eb("User.hasAccess", "=", true)
            ]))
            .execute()

        function queryToStatus(_: any, i: number): UserAccessStatus {
            const u = users[i]
            return {
                ...u,
                inviteCode: u.code ?? null
            }
        }

        return {data: users.map(queryToStatus)}
    } catch (err) {
        ctx.logger.pino.error({error: err}, "error getting users")
        return {error: "Error al obtener a los usuarios."}
    }
}


export const follow = (ctx: AppContext, agent: SessionAgent, did: string) => {
    return Effect.gen(function* () {
        const res = yield* Effect.tryPromise({
            try: () => agent.bsky.follow(did),
            catch: () => new ATCreateRecordError()
        })
        const record: AppBskyGraphFollow.Record = {
            $type: "app.bsky.graph.follow",
            subject: did,
            createdAt: new Date().toISOString()
        }
        yield* processValidatedRecords(ctx, [{ref: res, record}], followRecordProcessor)
        return {followUri: res.uri}
    }).pipe(
        Effect.withSpan("follow", {attributes: {did}})
    )
}


export const getProfileHandler: EffHandlerNoAuth<{ params: { handleOrDid: string } }, ArCabildoabiertoActorDefs.ProfileViewDetailed> = (ctx, agent, {params}) => {
    return pipe(
        getProfile(ctx, params.handleOrDid),
        Effect.catchAll(error => {
            if(error._tag == "UserNotFoundError") {
                return Effect.fail("No se encontró el usuario")
            }
            return Effect.fail("Ocurrió un error al obtener el usuario.")
        }),
        Effect.provideServiceEffect(DataPlane, makeDataPlane(ctx, agent))
    )
}


export const getProfile = (ctx: AppContext, handleOrDid: string) => Effect.gen(function* () {
    const did = yield* handleOrDidToDid(ctx, handleOrDid)

    if(!did) return yield* Effect.fail(new UserNotFoundError())

    const dataplane = yield* DataPlane

    yield* dataplane.fetchProfileViewDetailedHydrationData([did])

    const profile = yield* hydrateProfileViewDetailed(ctx, did)

    if (!profile) {
        return yield* Effect.fail(new UserNotFoundError())
    }
    return profile
}).pipe(Effect.withSpan("getProfile", {attributes: {handleOrDid}}))


export async function deleteSession(ctx: AppContext, agent: SessionAgent) {
    await ctx.oauthClient?.revoke(agent.did)
    if (agent.req && agent.res) {
        const session = await getIronSession<Session>(agent.req, agent.res, cookieOptions)
        session.destroy()
    }
}

type SessionData = Omit<Session, "handle"> & {handle: string | null}

export const getSessionData = (
    ctx: AppContext,
    did: string
): Effect.Effect<SessionData | null, RedisCacheFetchError | DBSelectError> => {

    return Effect.gen(function* () {
        const [data, mirrorStatus] = yield* Effect.all([
            Effect.tryPromise({
                try: () => ctx.kysely
                    .selectFrom("User")
                    .select([
                        "platformAdmin",
                        "handle",
                        "displayName",
                        "avatar",
                        "hasAccess",
                        "userValidationHash",
                        "orgValidation",
                        "inCA"
                    ])
                    .where("did", "=", did)
                    .executeTakeFirst(),
                catch: (error) => new DBSelectError(error)
            }),
            ctx.redisCache.mirrorStatus.get(did, true)
        ], {concurrency: "unbounded"})

        if(!data) {
            return null
        }

        const sessionData: SessionData = {
            active: true,
            did: did,
            handle: data.handle,
            displayName: data.displayName,
            avatar: data.avatar,
            hasAccess: data.hasAccess,
            platformAdmin: data.platformAdmin,
            validation: getValidationState(data),
            mirrorStatus: data.inCA ? mirrorStatus : "Dirty"
        }

        return sessionData
    }).pipe(
        Effect.withSpan("getSessionData", {attributes: {did}})
    )
}


export function getValidationState(user: {
    userValidationHash: string | null,
    orgValidation: string | null
}): VerificationState {
    return user.userValidationHash ? "persona" : (user.orgValidation ? "org" : null)
}


function isFullSessionData(data: SessionData | null): data is Session {
    return data != null && data.handle != null
}


class UserCreationFailedError {
    readonly _tag = "UserCreationFailedError"
}


class NoInviteCodeError {
    readonly _tag = "NoInviteCodeError"
}


type GetSessionError = UserCreationFailedError |
    DBSelectError |
    DBInsertError |
    RedisCacheFetchError |
    RedisCacheSetError |
    AssignInviteCodeError |
    ATCreateRecordError |
    NoInviteCodeError |
    CIDEncodeError |
    AddJobError |
    InsertRecordError |
    InvalidValueError |
    UpdateRedisError |
    ATGetRecordError


export const getSession = (
    ctx: AppContext,
    agent: SessionAgent,
    code: string | null
): Effect.Effect<Session, GetSessionError> => Effect.gen(function* () {
    const did = agent.did

    const data = yield* getSessionData(ctx, agent.did)

    if(!data || data.mirrorStatus == "Dirty" || data.mirrorStatus == "InProcess") {
        yield* ctx.redisCache.mirrorStatus.set(did, "InProcess", true)
        if(ctx.worker) yield* ctx.worker.addJob("sync-user", {handleOrDid: did}, 5)
    }

    yield* Effect.annotateCurrentSpan({data: data != null, hasAccess: data?.hasAccess, mirrorStatus: data?.mirrorStatus})

    if (isFullSessionData(data) && data.hasAccess) {
        return data
    } else if((data && data.hasAccess) || code) {
        yield* createCAUser(ctx, agent, code ?? undefined)

        const newUserData = yield* getSessionData(ctx, agent.did)
        ctx.logger.pino.info({newUserData}, "session data")

        if(!isFullSessionData(newUserData)) {
            return yield* Effect.fail(new UserCreationFailedError())
        }

        return newUserData
    } else {
        return yield* Effect.fail(new NoInviteCodeError())
    }
}).pipe(Effect.withSpan("getSession", {attributes: {code, did: agent.did}}))


export const getSessionHandler: EffHandlerNoAuth<{ params?: { code?: string } }, MaybeSession> = (
    ctx,
    agent,
    {params}
) => Effect.gen(function* () {
    const code = params?.code

    if (!agent.hasSession()) {
        return {active: false}
    }

    return yield* getSession(ctx, agent, code ?? null).pipe(
        Effect.catchAll(() => {
            return  Effect.fail("Ocurrió un error al obtener la sesión.")
        })
    )
})


function storeBskyEmail(ctx: AppContext, bskyEmail: string, userId: string) {
    return Effect.gen(function* () {
        yield* Effect.tryPromise({
            try: () => ctx.kysely.updateTable("User")
                .set("email", bskyEmail)
                .where("did", "=", userId)
                .execute(),
            catch: () => "Error al guardar el correo."
        })
        yield* createMailingListSubscription(ctx, bskyEmail, userId)
    })
}


export const getAccount: EffHandler<{}, Account> = (ctx, agent) => {
    return Effect.gen(function* () {
        const [caData, bskySession, endpoint] = yield* Effect.all([
            Effect.tryPromise({
                try: () => ctx.kysely
                    .selectFrom("User")
                    .leftJoin("MailingListSubscription", "MailingListSubscription.userId", "User.did")
                    .select(["User.email", "User.emailVerified", "MailingListSubscription.id as subsId", "MailingListSubscription.status"])
                    .where("did", "=", agent.did)
                    .execute(),
                catch: () => "Error al obtener los datos del correo del usuario."
            }),
            Effect.tryPromise({
                try: () => agent.bsky.com.atproto.server.getSession(),
                catch: () => "Error al obtener la sesión de Bluesky."
            }),
            getServiceEndpointForDid(ctx, agent.did)
        ], {concurrency: "unbounded"})

        if (caData.length == 0) {
            return yield* Effect.fail("No se encontró el usuario")
        }


        const {email, emailVerified, subsId, status} = caData[0]
        const subscribed = subsId != null && status == "Subscribed"

        const bskyEmail = bskySession.data.email

        if (bskyEmail && !email) {
            yield* storeBskyEmail(ctx, bskyEmail, agent.did)
        }

        yield* Effect.annotateCurrentSpan({
            email,
            subscriptionId: subsId,
            status,
            bskyEmail,
            endpoint
        })

        return {
            email: email ?? bskyEmail,
            emailVerified: emailVerified ?? false,
            subscribedToEmailUpdates: subscribed,
            endpoint
        }
    }).pipe(
        Effect.catchAll(() => Effect.fail("Ocurrió un error al obtener los datos de la cuenta")),
        Effect.withSpan("getAccount")
    )
}


type UpdateProfileProps = {
    displayName?: string
    description?: string
    banner?: string
    profilePic?: string
    removeBanner?: boolean
    removeProfilePic?: boolean
}


export const updateProfileHandler: EffHandler<UpdateProfileProps> = (ctx, agent, params) => {
    return updateProfile(ctx, agent, params).pipe(
        Effect.catchAll(() => Effect.fail("Ocurrió un error al actualizar el perfil.")),
        Effect.map(() => ({}))
    )
}


export const updateProfile = (
    ctx: AppContext,
    agent: SessionAgent,
    profile: UpdateProfileProps
) => Effect.gen(function* () {
    const res = yield* Effect.tryPromise({
        try: () => agent.bsky.com.atproto.repo.getRecord({
            repo: agent.did,
            collection: 'ar.cabildoabierto.actor.caProfile',
            rkey: "self"
        }),
        catch: (error) => new ATGetRecordError(error)
    })

    if(!res.success) {
        return yield* Effect.fail(new ATGetRecordError())
    }

    yield* Effect.log("Got current profile.")

    const record = res.data.value as ArCabildoabiertoActorCaProfile.Record

    const avatarBlob: BlobRef | undefined = profile.removeProfilePic ?
        undefined :
        (profile.profilePic ? (yield* uploadBase64Blob(agent, profile.profilePic)).ref : record.avatar)

    yield* Effect.log("Avatar and banner uploaded correctly.")

    const newRecord: ArCabildoabiertoActorCaProfile.Record = {
        ...record,
        displayName: profile.displayName ?? record.displayName,
        description: profile.description ?? record.description,
        avatar: avatarBlob,
    }
    yield* Effect.tryPromise({
        try: () => agent.bsky.com.atproto.repo.putRecord({
            repo: agent.did,
            collection: "ar.cabildoabierto.actor.caProfile",
            record: newRecord,
            rkey: "self"
        }),
        catch: () => new ATCreateRecordError()
    })

    yield* Effect.log("Record created.")

    if(res.data.cid){
        const ref: ATProtoStrongRef = {
            uri: res.data.uri,
            cid: res.data.cid
        }

        yield* processValidatedRecords(ctx, [{ref, record}], caProfileRecordProcessor)
    }
}).pipe(
    Effect.withSpan("updateProfile", {
        attributes: {
            displayName: profile.displayName,
            description: profile.description,
            profilePic: profile.profilePic != null
        }
    })
)


class CheckEmailError {
    readonly _tag = "CheckEmailError"
}


function checkEmailUsed(ctx: AppContext, email: string): Effect.Effect<boolean, CheckEmailError> {
    return Effect.gen(function* () {
        const user = yield* Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("User")
                .select("did")
                .where("email", "=", email)
                .executeTakeFirst(),
            catch: () => new CheckEmailError()
        })
        return user != null
    })
}


export const saveNewEmail: EffHandler<{email: string}, {}> = (ctx, agent, {email}) => {
    return Effect.gen(function* () {

        const used = yield* checkEmailUsed(ctx, email)

        if(used) {
            yield* Effect.fail("Este correo ya fue usado.")
        }

        yield* Effect.tryPromise({
            try: () => ctx.kysely.transaction().execute(async trx => {
                await trx.updateTable("User")
                    .set({email, emailVerified: false})
                    .where("did", "=", agent.did)
                    .execute()

                await trx
                    .updateTable("MailingListSubscription")
                    .set("email", email)
                    .where("userId", "=", agent.did)
                    .execute()
            }),
            catch: () => {
                return "Ocurrió un error al actualizar la dirección de correo."
            }
        })
    }).pipe(
        Effect.withSpan("saveNewEmail", {attributes: {email}}),
        Effect.flatMap(() => Effect.succeed({})),
        Effect.catchTag("CheckEmailError", () => Effect.fail("Error en la conexión."))
    )
}
