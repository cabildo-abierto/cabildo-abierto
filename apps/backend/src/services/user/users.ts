import {AppContext} from "#/setup.js";
import {Account, ATProtoStrongRef, AuthorStatus, Session, ValidationState} from "#/lib/types.js";
import {Agent, cookieOptions, SessionAgent} from "#/utils/session-agent.js";
import {deleteRecords} from "#/services/delete.js";
import {CAHandler, CAHandlerNoAuth} from "#/utils/handler.js";
import {hydrateProfileViewDetailed, hydrateProfileViewBasic} from "#/services/hydration/profile.js";
import {unique} from "@cabildo-abierto/utils";
import {Dataplane, joinMaps} from "#/services/hydration/dataplane.js";
import {getIronSession} from "iron-session";
import {createCAUser} from "#/services/user/access.js";
import {AppBskyActorProfile, AppBskyGraphFollow} from "@atproto/api"
import {ArCabildoabiertoActorDefs} from "@cabildo-abierto/api"
import {BlobRef} from "@atproto/lexicon";
import {uploadBase64Blob} from "#/services/blob.js";
import {EnDiscusionMetric, EnDiscusionTime, FeedFormatOption} from "#/services/feed/inicio/discusion.js";
import {FollowingFeedFilter} from "#/services/feed/feed.js";
import {BskyProfileRecordProcessor} from "#/services/sync/event-processing/profile.js";
import {FollowRecordProcessor} from "#/services/sync/event-processing/follow.js";
import {getCAFollowersDids, getCAFollowsDids} from "#/services/feed/inicio/following.js";


export async function dbHandleToDid(ctx: AppContext, handleOrDid: string): Promise<string | null> {
    if (handleOrDid.startsWith("did")) {
        return handleOrDid
    } else {
        const res = await ctx.kysely
            .selectFrom("User")
            .select("did")
            .where("handle", "=", handleOrDid)
            .executeTakeFirst()
        return res?.did ?? null
    }
}


export async function handleToDid(ctx: AppContext, agent: Agent, handleOrDid: string): Promise<string | null> {
    if (handleOrDid.startsWith("did")) {
        return handleOrDid
    } else {
        try {
            return await ctx.resolver.resolveHandleToDid(handleOrDid)
        } catch (err) {
            ctx.logger.pino.error({error: err, handleOrDid}, "error in handleToDid")
            return null
        }
    }
}


export async function didToHandle(ctx: AppContext, did: string): Promise<string | null> {
    return await ctx.resolver.resolveDidToHandle(did, true)
}


export const getCAUsersDids = async (ctx: AppContext) => {
    return (await ctx.kysely
        .selectFrom("User")
        .select("did")
        .where("inCA", "=", true)
        .where("hasAccess", "=", true)
        .execute()).map(({did}) => did)
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


export const getProfile: CAHandlerNoAuth<{ params: { handleOrDid: string } }, ArCabildoabiertoActorDefs.ProfileViewDetailed> = async (ctx, agent, {params}) => {
    try {
        const did = await handleToDid(ctx, agent, params.handleOrDid)
        if (!did) return {error: "No se encontró el usuario."}

        const dataplane = new Dataplane(ctx, agent)

        await dataplane.fetchProfileViewDetailedHydrationData([did])

        const profile = hydrateProfileViewDetailed(ctx, did, dataplane)

        if(!profile) {
            return {error: "Error al obtener el perfil"}
        } else {
            return {data: profile}
        }
    } catch (err) {
        ctx.logger.pino.error({error: err, params}, "error getting profile")
        return {error: "No se encontró el usuario."}
    }
}


export async function deleteSession(ctx: AppContext, agent: SessionAgent) {
    await ctx.oauthClient?.revoke(agent.did)
    if (agent.req && agent.res) {
        const session = await getIronSession<Session>(agent.req, agent.res, cookieOptions)
        session.destroy()
    }
}


export type TTOption = EnDiscusionTime | "Ediciones recientes"


export type AlgorithmConfig = {
    following?: {
        filter?: FollowingFeedFilter
        format?: FeedFormatOption
    }
    enDiscusion?: {
        time?: EnDiscusionTime
        metric?: EnDiscusionMetric
        format?: FeedFormatOption
    }
    tt?: {
        time?: TTOption
    }
}

type SessionData = Omit<Session, "handle"> & {handle: string | null}

export const getSessionData = async (ctx: AppContext, did: string): Promise<SessionData | null> => {
    const t1 = Date.now()

    try {
        const [res, mirrorStatus] = await Promise.all([
            ctx.kysely
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
                    "inCA"
                ])
                .where("did", "=", did)
                .executeTakeFirst(),
            ctx.redisCache.mirrorStatus.get(did, true)
        ])
        const t2 = Date.now()
        ctx.logger.logTimes("get session", [t1, t2])

        if(!res) {
            ctx.logger.pino.info({did}, "user not found")
            return null
        }

        const data = res

        return {
            authorStatus: data.authorStatus as AuthorStatus | null,
            did: did,
            handle: data.handle,
            displayName: data.displayName,
            avatar: data.avatar,
            hasAccess: data.hasAccess,
            caProfile: data.CAProfileUri,
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
            mirrorStatus: data.inCA ? mirrorStatus: "Dirty"
        }
    } catch (err) {
        ctx.logger.pino.error({error: err, did}, "error getting session data")
        return null
    }
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


export const getSession: CAHandlerNoAuth<{ params?: { code?: string } }, Session> = async (ctx, agent, {params}) => {
    if (!agent.hasSession()) {
        ctx.logger.pino.info("sin sesión")
        return {error: "No session."}
    }

    const status = await ctx.redisCache.mirrorStatus.get(agent.did, true)
    if(status == "Dirty"){
        await ctx.redisCache.mirrorStatus.set(agent.did, "InProcess", true)
        await ctx.worker?.addJob("sync-user", {handleOrDid: agent.did}, 5)
    }

    const data = await getSessionData(ctx, agent.did)
    if (data && isFullSessionData(data) && data.hasAccess && data.caProfile) {
        return {data}
    }

    const code = params?.code

    if(data && data.hasAccess) {
        // está en le DB y tiene acceso pero no está sincronizado o no tiene perfil de ca
        const {error} = await createCAUser(ctx, agent)
        if (error) {
            return {error}
        }

        const newUserData = await getSessionData(ctx, agent.did)
        if (isFullSessionData(newUserData)) {
            return {data: newUserData}
        } else {
            ctx.logger.pino.error({data, did: agent.did, newUserData}, "no user after sync")
        }
    } else if (code) {
        ctx.logger.pino.info("creando usuario de ca")
        // el usuario no está en la db (o está pero no tiene acceso) y logró iniciar sesión, creamos un nuevo usuario de CA
        const {error} = await createCAUser(ctx, agent, code)
        if (error) {
            ctx.logger.pino.error({did: agent.did, error}, "error creating ca user")
            return {error}
        }

        const newUserData = await getSessionData(ctx, agent.did)
        if (isFullSessionData(newUserData)) {
            return {data: newUserData}
        } else {
            ctx.logger.pino.error({did: agent.did, newUserData, data}, "no full session data after user creation")
        }
    } else {
        ctx.logger.pino.error({did: agent.did, data}, "no code and no access")
    }

    await deleteSession(ctx, agent)
    ctx.logger.pino.error({did: agent.did}, "error getting session data, deleted session")
    return {error: "Ocurrió un error al crear el usuario."}
}


export const getAccount: CAHandler<{}, Account> = async (ctx, agent) => {

    const [caData, bskySession] = await Promise.all([
        ctx.kysely.selectFrom("User").select("email").where("did", "=", agent.did).executeTakeFirst(),
        agent.bsky.com.atproto.server.getSession()
    ])

    if (!caData) {
        return {error: "No se encontró el usuario"}
    }

    const bskyEmail = bskySession.data.email

    if (bskyEmail && (!caData.email || caData.email != bskyEmail)) {
        await ctx.kysely.updateTable("User")
            .set("email", bskyEmail)
            .where("did", "=", agent.did)
            .execute()
    }

    return {
        data: {
            email: bskyEmail
        }
    }
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


async function getFollowxFromCA(ctx: AppContext, did: string, data: Dataplane, kind: "follows" | "followers") {
    const dids = kind == "follows" ?
        await getCAFollowsDids(ctx, did) :
        await getCAFollowersDids(ctx, did)

    return unique(dids)
}


async function getFollowxFromBsky(agent: Agent, did: string, data: Dataplane, kind: "follows" | "followers") {
    const users = kind == "follows" ?
        (await agent.bsky.app.bsky.graph.getFollows({actor: did})).data.follows :
        (await agent.bsky.app.bsky.graph.getFollowers({actor: did})).data.followers

    data.bskyBasicUsers = joinMaps(data.bskyBasicUsers,
        new Map(users.map(u => [u.did, {
            ...u,
            $type: "app.bsky.actor.defs#profileViewBasic"
        }])))
    return users.map(u => u.did)
}


export const getFollowx = async (ctx: AppContext, agent: Agent, {handleOrDid, kind}: {
    handleOrDid: string,
    kind: "follows" | "followers"
}): Promise<{ data?: ArCabildoabiertoActorDefs.ProfileViewBasic[], error?: string }> => {
    const did = await handleToDid(ctx, agent, handleOrDid)
    if (!did) return {error: "No se encontró el usuario."}

    const data = new Dataplane(ctx, agent)

    const [caUsers, bskyUsers] = await Promise.all([
        getFollowxFromCA(ctx, did, data, kind),
        getFollowxFromBsky(agent, did, data, kind)
    ])

    const userList = unique([...caUsers, ...bskyUsers])

    await data.fetchProfileViewHydrationData(userList)

    return {data: userList.map(u => hydrateProfileViewBasic(ctx, u, data)).filter(u => u != null)}
}


export const getFollows: CAHandlerNoAuth<{
    params: { handleOrDid: string }
}, ArCabildoabiertoActorDefs.ProfileViewBasic[]> = async (ctx, agent, {params}) => {
    return await getFollowx(ctx, agent, {handleOrDid: params.handleOrDid, kind: "follows"})
}


export const getFollowers: CAHandlerNoAuth<{
    params: { handleOrDid: string }
}, ArCabildoabiertoActorDefs.ProfileViewBasic[]> = async (ctx, agent, {params}) => {
    return await getFollowx(ctx, agent, {handleOrDid: params.handleOrDid, kind: "followers"})
}


type UpdateProfileProps = {
    displayName?: string
    description?: string
    banner?: string
    profilePic?: string
}


export const updateProfile: CAHandler<UpdateProfileProps, {}> = async (ctx, agent, params) => {
    const {data} = await agent.bsky.com.atproto.repo.getRecord({
        repo: agent.did,
        collection: 'app.bsky.actor.profile',
        rkey: "self"
    })

    const val = AppBskyActorProfile.validateRecord(data.value)

    if (val.success) {
        const record = val.value

        const avatarBlob: BlobRef | undefined = params.profilePic ? (await uploadBase64Blob(agent, params.profilePic)).ref : record.avatar
        const bannerBlob: BlobRef | undefined = params.banner ? (await uploadBase64Blob(agent, params.banner)).ref : record.banner

        const newRecord: AppBskyActorProfile.Record = {
            ...record,
            displayName: params.displayName ?? record.displayName,
            description: params.description ?? record.description,
            avatar: avatarBlob,
            banner: bannerBlob
        }
        await agent.bsky.com.atproto.repo.putRecord({
            repo: agent.did,
            collection: "app.bsky.actor.profile",
            record: newRecord,
            rkey: "self"
        })

        if(data.cid){
            const ref: ATProtoStrongRef = {
                uri: data.uri,
                cid: data.cid
            }

            await new BskyProfileRecordProcessor(ctx)
                .processValidated([{ref, record}])
        }
    }

    return {data: {}}
}


const bskyDid = "did:plc:z72i7hdynmk6r22z27h6tvur"

export const clearFollowsHandler: CAHandler<{}, {}> = async (ctx, agent, {}) => {
    const {data: follows} = await getFollows(ctx, agent, {params: {handleOrDid: agent.did}})

    if (follows && follows.length == 1 && follows[0].did == bskyDid && follows[0].viewer?.following) {
        await unfollow(ctx, agent, {followUri: follows[0].viewer.following})
    }

    return {data: {}}
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