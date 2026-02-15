import {AppContext} from "#/setup.js";
import {cookieOptions, SessionAgent} from "#/utils/session-agent.js";
import {deleteRecords} from "#/services/delete.js";
import {CAHandler, EffHandler, EffHandlerNoAuth} from "#/utils/handler.js";
import {hydrateProfileViewDetailed} from "#/services/hydration/profile.js";
import {DataPlane, makeDataPlane} from "#/services/hydration/dataplane.js";
import {getIronSession} from "iron-session";
import {AssignInviteCodeError, createCAUser, UserNotFoundError} from "#/services/user/access.js";
import {AppBskyActorProfile, AppBskyGraphFollow} from "@atproto/api"
import {
    Account,
    AlgorithmConfig,
    ArCabildoabiertoActorDefs,
    ATProtoStrongRef,
    AuthorStatus, MaybeSession,
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
import {RedisCacheFetchError, RedisCacheSetError} from "#/services/redis/cache.js";
import {AddJobError, DBInsertError, DBSelectError, InvalidValueError, UpdateRedisError} from "#/utils/errors.js";
import {CIDEncodeError} from "#/services/write/topic.js";
import {InsertRecordError} from "#/services/sync/event-processing/record-processor.js";


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
            catch: () => new DBSelectError()
        })
            .pipe(Effect.map(res => res?.did ?? null))
    }
}


export class HandleResolutionError {
    readonly _tag = "HandleResolutionError"
}


export const getCAUsersDids = (ctx: AppContext): Effect.Effect<string[], DBSelectError> => {
    return Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("User")
            .select("did")
            .where("inCA", "=", true)
            .where("hasAccess", "=", true)
            .execute(),
        catch: () => new DBSelectError()
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


export const followHandler: EffHandler<{ followedDid: string }, { followUri: string }> = (ctx, agent, {followedDid}) => follow(ctx, agent, followedDid).pipe(
    Effect.catchAll(() => {
        return Effect.fail("Ocurrió un error al seguir al usuario.")
    })
)


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
        yield* (new FollowRecordProcessor(ctx).processValidated([{ref: res, record}]))
        return {followUri: res.uri}
    }).pipe(
        Effect.withSpan("follow", {attributes: {did}})
    )
}


export const unfollowHandler: EffHandler<{ followUri: string }> = (ctx, agent, {followUri}) => {
    return unfollow(ctx, agent, followUri).pipe(
        Effect.catchAll(() => Effect.fail("Ocurrió un error al dejar de seguir al usuario."))
    ).pipe(Effect.map(() => Effect.succeed({})))
}


export const unfollow = (ctx: AppContext, agent: SessionAgent, followUri: string) => {
    return deleteRecords({ctx, agent, uris: [followUri], atproto: true}).pipe(
        Effect.withSpan("unfollow", {attributes: {followUri}})
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


export const getProfile = (ctx: AppContext, handleOrDid: string) => {
    return pipe(
        handleOrDidToDid(ctx, handleOrDid),
        Effect.flatMap(did =>
            Effect.gen(function* () {
                const dataplane = yield* DataPlane

                yield* dataplane.fetchProfileViewDetailedHydrationData([did])

                const profile = yield* hydrateProfileViewDetailed(ctx, did)

                if (!profile) {
                    return yield* Effect.fail(new UserNotFoundError())
                }

                return profile
            })
        ),
        Effect.withSpan("getProfile", {attributes: {handleOrDid}})
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
                catch: () => new DBSelectError()
            }),
            ctx.redisCache.mirrorStatus.get(did, true)
        ], {concurrency: "unbounded"})

        if(!data) {
            return null
        }

        const sessionData: SessionData = {
            active: true,
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
    }).pipe(
        Effect.withSpan("getSessionData", {attributes: {did}})
    )
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
    UpdateRedisError


export const getSession = (
    ctx: AppContext,
    agent: SessionAgent,
    code: string | null
): Effect.Effect<Session, GetSessionError> => Effect.gen(function* () {
    const did = agent.did

    const data = yield* getSessionData(ctx, agent.did)

    if(!data || data.mirrorStatus == "Dirty") {
        yield* ctx.redisCache.mirrorStatus.set(did, "InProcess", true)
        if(ctx.worker) yield* ctx.worker.addJob("sync-user", {handleOrDid: did}, 5)
    }

    yield* Effect.annotateCurrentSpan({data: data != null, hasAccess: data?.hasAccess, mirrorStatus: data?.mirrorStatus})

    if (isFullSessionData(data) && data.hasAccess && data.caProfile != null) {
        return data
    } else if((data && data.hasAccess) || code) {
        yield* createCAUser(ctx, agent, code ?? undefined)

        const newUserData = yield* getSessionData(ctx, agent.did)

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


export const updateProfileHandler: EffHandler<UpdateProfileProps> = (ctx, agent, params) => {

    return updateProfile(ctx, agent, params).pipe(
        Effect.catchAll(error => {
            if(typeof error == "string") {
                return Effect.fail(error)
            } else {
                return Effect.fail("Ocurrió un error al actualizar el perfil.")
            }
        }),
        Effect.map(() => ({}))
    )
}


export const updateProfile = (
    ctx: AppContext,
    agent: SessionAgent,
    profile: UpdateProfileProps
) => Effect.gen(function* () {
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

    const avatarBlob: BlobRef | undefined = profile.profilePic ? (yield* uploadBase64Blob(agent, profile.profilePic)).ref : record.avatar
    const bannerBlob: BlobRef | undefined = profile.banner ? (yield* uploadBase64Blob(agent, profile.banner)).ref : record.banner

    yield* Effect.log("Avatar and banner uploaded correctly.")

    const newRecord: AppBskyActorProfile.Record = {
        ...record,
        displayName: profile.displayName ?? record.displayName,
        description: profile.description ?? record.description,
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
}).pipe(
    Effect.withSpan("updateProfile", {
        attributes: {
            displayName: profile.displayName,
            description: profile.description,
            banner: profile.banner != null,
            profilePic: profile.profilePic != null
        }
    })
)




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
            try: () => ctx.kysely.transaction().execute(async trx => {
                await trx.updateTable("User")
                    .set("email", email)
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


export async function verifyEmails(ctx: AppContext) {
    await ctx.kysely.updateTable("User")
        .where("email", "is not", null)
        .set("emailVerified", true)
        .execute()
}