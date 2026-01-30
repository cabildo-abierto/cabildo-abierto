import {AppContext} from "#/setup.js";
import {cookieOptions, SessionAgent} from "#/utils/session-agent.js";
import {deleteRecords} from "#/services/delete.js";
import {CAHandler, EffHandler, EffHandlerNoAuth} from "#/utils/handler.js";
import {hydrateProfileViewDetailed} from "#/services/hydration/profile.js";
import {Dataplane} from "#/services/hydration/dataplane.js";
import {getIronSession} from "iron-session";
import {createCAUser, UserNotFoundError} from "#/services/user/access.js";
import {AppBskyActorProfile, AppBskyGraphFollow} from "@atproto/api"
import {
    Account,
    AlgorithmConfig,
    ArCabildoabiertoActorDefs,
    ATProtoStrongRef,
    AuthorStatus,
    Session,
    ValidationState
} from "@cabildo-abierto/api"
import {BlobRef} from "@atproto/lexicon";
import {uploadBase64Blob} from "#/services/blob.js";
import {BskyProfileRecordProcessor} from "#/services/sync/event-processing/profile.js";
import {FollowRecordProcessor} from "#/services/sync/event-processing/follow.js";
import * as Effect from "effect/Effect";
import {pipe} from "effect";
import {handleOrDidToDid} from "#/id-resolver.js";
import {createMailingListSubscription} from "#/services/emails/subscriptions.js";
import {ATCreateRecordError} from "#/services/wiki/votes.js";
import {DBError} from "#/services/write/article.js";
import {RedisCacheFetchError, RedisCacheSetError} from "#/services/redis/cache.js";
import {AddJobError} from "#/utils/errors.js";


export function dbHandleToDid(ctx: AppContext, handleOrDid: string): Effect.Effect<string | null, DBError> {
    if (handleOrDid.startsWith("did")) {
        return Effect.succeed(handleOrDid)
    } else {
        return Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("User")
                .select("did")
                .where("handle", "=", handleOrDid)
                .executeTakeFirst(),
            catch: () => new DBError()
        })
            .pipe(Effect.map(res => res?.did ?? null))
    }
}


export class HandleResolutionError {
    readonly _tag = "HandleResolutionError"
}


export const getCAUsersDids = (ctx: AppContext): Effect.Effect<string[], DBError> => {
    return Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("User")
            .select("did")
            .where("inCA", "=", true)
            .where("hasAccess", "=", true)
            .execute(),
        catch: () => new DBError()
    }).pipe(Effect.map(users => {
        return users.map(({did}) => did)
    }))
}


type UserAccessStatus = {
    did: string
    handle: string | null
    created_at: Date | null
    hasAccess: boolean
    inCA: boolean
    inviteCode: string | null
    displayName: string | null
}


export const getUsers: CAHandler<{}, UserAccessStatus[]> = async (ctx, agent, {}) => {
    try {
        const users = await ctx.kysely
            .selectFrom("User")
            .leftJoin("InviteCode", "InviteCode.usedByDid", "User.did")
            .select(["did", "handle", "displayName", "hasAccess", "CAProfileUri", "User.created_at", "inCA", "InviteCode.code"])
            .where(eb => eb.or([
                eb("InviteCode.code", "is not", null),
                eb("User.inCA", "=", true),
                eb("User.hasAccess", "=", true),
                eb("User.CAProfileUri", "is not", null)
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


export const follow: CAHandler<{ followedDid: string }, { followUri: string }> = async (ctx, agent, {followedDid}) => {
    try {
        const res = await agent.bsky.follow(followedDid)
        const record: AppBskyGraphFollow.Record = {
            $type: "app.bsky.graph.follow",
            subject: followedDid,
            createdAt: new Date().toISOString()
        }
        await new FollowRecordProcessor(ctx).processValidated([{ref: res, record}])
        return {data: {followUri: res.uri}}
    } catch {
        return {error: "Error al seguir al usuario."}
    }
}


export const unfollow: CAHandler<{ followUri: string }> = async (ctx, agent, {followUri}) => {
    try {
        await deleteRecords({ctx, agent, uris: [followUri], atproto: true})
        return {data: {}}
    } catch (err) {
        console.error(err)
        return {error: "Error al dejar de seguir al usuario."}
    }
}


export const getProfile: EffHandlerNoAuth<{ params: { handleOrDid: string } }, ArCabildoabiertoActorDefs.ProfileViewDetailed> = (ctx, agent, {params}) => {
    const dataplane = new Dataplane(ctx, agent)

    return pipe(
        handleOrDidToDid(ctx, params.handleOrDid),
        Effect.tap(did => dataplane.fetchProfileViewDetailedHydrationData([did])),
        Effect.flatMap(did => {
            const profile = hydrateProfileViewDetailed(ctx, did, dataplane)
            return profile ?
                Effect.succeed(profile) :
                Effect.fail("Usuario no encontrado")
        }),
        Effect.catchTag("HandleResolutionError", () =>
            Effect.fail("Usuario no encontrado")
        ),
        Effect.catchAll(error =>
            Effect.fail("Ocurrió un error al obtener el usuario.")
        )
    )
}


export async function deleteSession(ctx: AppContext, agent: SessionAgent) {
    await ctx.oauthClient?.revoke(agent.did)
    if (agent.req && agent.res) {
        const session = await getIronSession<Session>(agent.req, agent.res, cookieOptions)
        session.destroy()
    }
}

type SessionData = Omit<Session, "handle"> & {handle: string | null}

export const getSessionData = (ctx: AppContext, did: string): Effect.Effect<SessionData, RedisCacheFetchError | UserNotFoundError | DBError> => {

    return Effect.gen(function* () {
        const [data, mirrorStatus] = yield* Effect.all([
            Effect.tryPromise({
                try: () => ctx.kysely
                    .selectFrom("User")
                    .select([
                        "platformAdmin",
                        "editorStatus",
                        "seenTutorial",
                        "seenTopicMaximizedTutorial",
                        "seenTopicMinimizedTutorial",
                        "seenTopicsTutorial",
                        "seenVerifiedNotification",
                        "handle",
                        "displayName",
                        "avatar",
                        "hasAccess",
                        "userValidationHash",
                        "orgValidation",
                        "algorithmConfig",
                        "authorStatus",
                        "CAProfileUri",
                        "inCA",
                    ])
                    .where("did", "=", did)
                    .executeTakeFirst(),
                catch: () => new DBError()
            }),
            ctx.redisCache.mirrorStatus.get(did, true)
        ], {concurrency: "unbounded"})

        if(!data) return yield* Effect.fail(new UserNotFoundError())

        const sessionData: SessionData = {
            authorStatus: data.authorStatus as AuthorStatus | null,
            did: did,
            handle: data.handle,
            displayName: data.displayName,
            avatar: data.avatar,
            hasAccess: data.hasAccess,
            caProfile: data.CAProfileUri ?? null,
            seenTutorial: {
                home: data.seenTutorial,
                topics: data.seenTopicsTutorial,
                topicMinimized: data.seenTopicMinimizedTutorial,
                topicMaximized: data.seenTopicMaximizedTutorial
            },
            seenVerifiedNotification: data.seenVerifiedNotification,
            editorStatus: data.editorStatus,
            platformAdmin: data.platformAdmin,
            validation: getValidationState(data),
            algorithmConfig: (data.algorithmConfig ?? {}) as AlgorithmConfig,
            mirrorStatus: data.inCA ? mirrorStatus : "Dirty",
            pinnedFeeds: []
        }

        return sessionData
    })
}


export function getValidationState(user: {
    userValidationHash: string | null,
    orgValidation: string | null
}): ValidationState {
    return user.userValidationHash ? "persona" : (user.orgValidation ? "org" : null)
}


function isFullSessionData(data: SessionData | null): data is Session {
    return data != null && data.handle != null
}


function startSyncIfDirty(ctx: AppContext, did: string): Effect.Effect<void, AddJobError | RedisCacheSetError | RedisCacheFetchError> {
    return Effect.gen(function* () {
        const status = yield* ctx.redisCache.mirrorStatus.get(did, true)
        if(status == "Dirty") {
            yield* ctx.redisCache.mirrorStatus.set(did, "InProcess", true)
            if(ctx.worker) yield* ctx.worker.addJob("sync-user", {handleOrDid: did}, 5)
        }
    })
}


export const getSession: EffHandlerNoAuth<{ params?: { code?: string } }, Session> = (ctx, agent, {params}) => {
    const code = params?.code

    if (!agent.hasSession()) {
        return Effect.fail("No session")
    }

    return Effect.gen(function* () {
        yield* startSyncIfDirty(ctx, agent.did)

        const data = yield* getSessionData(ctx, agent.did)

        if (data != null && isFullSessionData(data) && data.hasAccess && data.caProfile != null) {
            return data
        } else if(data && data.hasAccess) {
            // está en le DB y tiene acceso pero no está sincronizado o no tiene perfil de ca
            yield* createCAUser(ctx, agent)

            const newUserData = yield* getSessionData(ctx, agent.did)

            if(!isFullSessionData(newUserData)) {
                return yield* Effect.fail("La cuenta tiene acceso, pero ocurrió un error al obtener los datos.")
            }

            return newUserData
        } else if(code) {
            // el usuario no está en la db (o está pero no tiene acceso) y logró iniciar sesión, creamos un nuevo usuario de CA
            yield* createCAUser(ctx, agent, code)

            const newUserData = yield* getSessionData(ctx, agent.did)

            if(!isFullSessionData(newUserData)){
                return yield* Effect.fail("Ocurrió un error al obtener los datos de la cuenta.")
            }

            return newUserData
        } else {
            return yield* Effect.fail("Necesitás un código de invitación para crear una cuenta.")
        }
    }).pipe(Effect.catchAll(error => {
        return pipe(
            Effect.promise(() => deleteSession(ctx, agent)),
            Effect.flatMap(() => Effect.fail("Ocurrió un error al obtener la sesión."))
        )
    }))
}


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
        const [caData, bskySession] = yield* Effect.all([
            Effect.tryPromise({
                try: () => ctx.kysely
                    .selectFrom("User")
                    .leftJoin("MailingListSubscription", "MailingListSubscription.userId", "User.did")
                    .select(["User.email", "MailingListSubscription.id as subsId", "MailingListSubscription.status"])
                    .where("did", "=", agent.did)
                    .execute(),
                catch: () => "Error al obtener los datos del correo del usuario."
            }),
            Effect.tryPromise({
                try: () => agent.bsky.com.atproto.server.getSession(),
                catch: () => "Error al obtener la sesión de Bluesky."
            })
        ], {concurrency: "unbounded"})

        if (caData.length == 0) {
            return yield* Effect.fail("No se encontró el usuario")
        }


        const {email, subsId, status} = caData[0]
        const subscribed = subsId != null && status == "Subscribed"

        const bskyEmail = bskySession.data.email

        if (bskyEmail && !email) {
            yield* storeBskyEmail(ctx, bskyEmail, agent.did)
        }

        yield* Effect.annotateCurrentSpan({
            email,
            subscriptionId: subsId,
            status,
            bskyEmail
        })

        return {
            email: email ?? bskyEmail,
            subscribedToEmailUpdates: subscribed
        }
    }).pipe(
        Effect.catchAll(() => Effect.fail("Ocurrió un error al obtener los datos de la cuenta")),
        Effect.withSpan("getAccount")
    )
}


export async function setSeenTutorial(ctx: AppContext, did: string, tutorial: Tutorial, value: boolean) {
    ctx.logger.pino.info({did, tutorial, value}, "setting seen tutorial")
    if (tutorial == "topic-minimized") {
        await ctx.kysely
            .updateTable("User")
            .set("seenTopicMinimizedTutorial", value)
            .where("did", "=", did)
            .execute()
    } else if (tutorial == "home") {
        await ctx.kysely
            .updateTable("User")
            .set("seenTutorial", value)
            .where("did", "=", did)
            .execute()
    } else if (tutorial == "topics") {
        await ctx.kysely
            .updateTable("User")
            .set("seenTopicsTutorial", value)
            .where("did", "=", did)
            .execute()
    } else if (tutorial == "topic-normal") {
        await ctx.kysely.updateTable("User")
            .set("seenTopicMaximizedTutorial", value)
            .where("did", "=", did)
            .execute()
    } else if (tutorial == "panel-de-autor") {
        await ctx.kysely
            .updateTable("User")
            .set("authorStatus", {
                isAuthor: true,
                seenAuthorTutorial: value
            })
            .where("did", "=", did)
            .execute()
    } else if(tutorial == "verification") {
        await ctx.kysely
            .updateTable("User")
            .set("seenVerifiedNotification", value)
            .where("did", "=", did)
            .execute()
    } else {
        ctx.logger.pino.error("Unknown tutorial", tutorial)
    }
}



type Tutorial = "topic-minimized" | "topic-normal" | "home" | "topics" | "verification" | "panel-de-autor"


export const setSeenTutorialHandler: CAHandler<{ params: { tutorial: Tutorial } }, {}> = async (ctx, agent, {params}) => {
    const {tutorial} = params
    const did = agent.did

    await setSeenTutorial(ctx, did, tutorial, true)

    return {data: {}}
}


type UpdateProfileProps = {
    displayName?: string
    description?: string
    banner?: string
    profilePic?: string
}


export const updateProfile: EffHandler<UpdateProfileProps> = (ctx, agent, params) => {

    return Effect.gen(function* () {
        const {success, data} = yield* Effect.tryPromise({
            try: () => agent.bsky.com.atproto.repo.getRecord({
                repo: agent.did,
                collection: 'app.bsky.actor.profile',
                rkey: "self"
            }),
            catch: () => "Ocurrió un error en la conexión con ATProtocol."
        })

        if(!success) {
            return yield* Effect.fail("Error en la conexión.")
        }

        yield* Effect.log("Got current profile.")

        const record = data.value as AppBskyActorProfile.Record

        const avatarBlob: BlobRef | undefined = params.profilePic ? (yield* uploadBase64Blob(agent, params.profilePic)).ref : record.avatar
        const bannerBlob: BlobRef | undefined = params.banner ? (yield* uploadBase64Blob(agent, params.banner)).ref : record.banner

        yield* Effect.log("Avatar and banner uploaded correctly.")

        const newRecord: AppBskyActorProfile.Record = {
            ...record,
            displayName: params.displayName ?? record.displayName,
            description: params.description ?? record.description,
            avatar: avatarBlob,
            banner: bannerBlob
        }
        yield* Effect.tryPromise({
            try: () => agent.bsky.com.atproto.repo.putRecord({
                repo: agent.did,
                collection: "app.bsky.actor.profile",
                record: newRecord,
                rkey: "self"
            }),
            catch: () => new ATCreateRecordError()
        })

        yield* Effect.log("Record created.")

        if(data.cid){
            const ref: ATProtoStrongRef = {
                uri: data.uri,
                cid: data.cid
            }

            yield* new BskyProfileRecordProcessor(ctx)
                .processValidated([{ref, record}])
        }

        return {}
    }).pipe(
        Effect.catchTag("ATCreateRecordError", () => Effect.fail("Ocurrió un error al actualizar el perfil.")),
        Effect.catchTag("InsertRecordError", () => Effect.fail("El perfil se actualizó, pero tuvimos un problema para procesarlo. Volvé a intentar o comunicate con el soporte.")),
        Effect.catchTag("UploadImageFromBase64Error", () => Effect.fail("Ocurrió un error al subir una imagen.")),
        Effect.catchTag("InvalidValueError", () => Effect.fail("Ocurrió un error al actualizar el perfil")),
        Effect.catchTag("UpdateRedisError", () => Effect.fail("Ocurrió un error al actualizar el perfil")),
        Effect.catchTag("AddJobsError", () => Effect.fail("Ocurrió un error al actualizar el perfil")),
        Effect.withSpan("updateProfile", {
            attributes: {
                displayName: params.displayName,
                description: params.description,
                banner: params.banner != null,
                profilePic: params.profilePic != null
            }
        })
    )
}







export const updateAlgorithmConfig: CAHandler<AlgorithmConfig, {}> = async (ctx, agent, config) => {

    await ctx.kysely
        .updateTable("User")
        .set("algorithmConfig", JSON.stringify(config))
        .where("did", "=", agent.did)
        .execute()

    return {data: {}}
}


export async function updateAuthorStatus(ctx: AppContext, dids?: string[]) {
    if(dids && dids.length == 0) return

    const query = ctx.kysely
        .selectFrom("User")
        .select([
            "did",
            "authorStatus",
            (eb) =>
                eb
                    .selectFrom("Record")
                    .select(eb => eb.fn.count<number>("uri").as("articlesCount"))
                    .whereRef("Record.authorId", "=", "User.did")
                    .where("Record.collection", "=", "ar.cabildoabierto.feed.article")
                    .as("articlesCount"),
            (eb) =>
                eb
                    .selectFrom("Record")
                    .select(eb => eb.fn.count<number>("uri").as("topicVersionsCount"))
                    .whereRef("Record.authorId", "=", "User.did")
                    .where("Record.collection", "=", "ar.cabildoabierto.wiki.topicVersion")
                    .as("topicVersionsCount")
        ])
        .where("inCA", "=", true)

    const users = dids ? await query.where("did", "in", dids).execute() : await query.execute()

    const values: {
        did: string,
        authorStatus: string
    }[] = users.map(u => {

        const authorStatus  = u.authorStatus as AuthorStatus | null

        const newAuthorStatus = {
            isAuthor: authorStatus && authorStatus.isAuthor || u.articlesCount && u.articlesCount > 0 || u.topicVersionsCount && u.topicVersionsCount > 0,
            seenAuthorTutorial: authorStatus && authorStatus.seenAuthorTutorial
        }

        return {
            did: u.did,
            authorStatus: JSON.stringify(newAuthorStatus)
        }
    })

    if(values.length == 0) return

    await ctx.kysely
        .insertInto("User")
        .values(values)
        .onConflict(oc => oc.column("did").doUpdateSet(eb => ({
            authorStatus: eb.ref("excluded.authorStatus")
        })))
        .execute()
}


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
            catch: error => new CheckEmailError()
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
            try: () => ctx.kysely
                .updateTable("User")
                .set("email", email)
                .where("did", "=", agent.did).execute(),
            catch: error => {
                return "No se encontró el usuario."
            }
        })
    }).pipe(Effect.flatMap(() => Effect.succeed({})), Effect.catchTag("CheckEmailError", () => Effect.fail("Error en la conexión.")))
}


export async function verifyEmails(ctx: AppContext) {
    await ctx.kysely.updateTable("User")
        .where("email", "is not", null)
        .set("emailVerified", true)
        .execute()
}