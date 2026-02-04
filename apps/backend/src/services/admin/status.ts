import {CAHandler} from "#/utils/handler.js";
import {AppContext} from "#/setup.js";
import {getUnsentAccessRequestsCount} from "#/services/user/access.js";
import {getPendingValidationRequestsCount} from "#/services/user/validation.js";
import {getUnseenJobApplicationsCount} from "#/services/admin/jobs.js";
import {Effect} from "effect";

type ServerStatus = {
    worker: boolean
    mirror: boolean
}


export async function updateTimestamp(ctx: AppContext, id: string, date: Date) {
    await ctx.kysely
        .insertInto("Timestamps")
        .values([{
            id,
            date: date,
            date_tz: date,
        }])
        .onConflict(oc => oc.column("id").doUpdateSet(eb => ({
            date_tz: eb.ref("excluded.date_tz"),
            date: eb.ref("excluded.date")
        })))
        .execute()
}


export async function getTimestamp(ctx: AppContext, id: string) {
    const ts = await ctx.kysely
        .selectFrom("Timestamps")
        .select("date_tz")
        .where("id", "=", id)
        .executeTakeFirst()
    return ts?.date_tz
}


export async function runTestJob(ctx: AppContext): Promise<void> {
    await updateTimestamp(ctx, "test", new Date())
    ctx.logger.pino.info("test job run successfully")
}


export const getServerStatus: CAHandler<{}, {status: ServerStatus}> = async (ctx, agent, params ) => {
    // chequeamos:
    // el worker completa un trabajo con prioridad baja
    // el mirror está corriendo y procesando eventos

    const ts = await getTimestamp(ctx, "test")

    const lastEventProcessed = await getTimestamp(ctx, `last-mirror-event-${ctx.mirrorId}`)

    const threshold = new Date(Date.now() - 120*1000)
    const worker = ts != null && ts > threshold
    const mirror = lastEventProcessed != null && lastEventProcessed > threshold

    ctx.logger.pino.info({lastTestJob: ts, lastEventProcessed, worker, mirror, threshold, now: new Date()}, "server status")
    return {data: {status: {worker, mirror}}}
}


export const getAdminNotificationCounts: CAHandler<{}, {unsentAccessRequests: number, pendingValidationRequests: number, unseenJobApplications: number}> = async (ctx, agent, {}) => {
    const [accessResult, validationResult, jobsResult] = await Promise.all([
        getUnsentAccessRequestsCount(ctx, agent, {}),
        getPendingValidationRequestsCount(ctx, agent, {}),
        getUnseenJobApplicationsCount(ctx, agent, {})
    ])
    return {
        data: {
            unsentAccessRequests: accessResult.data?.count ?? 0,
            pendingValidationRequests: validationResult.data?.count ?? 0,
            unseenJobApplications: jobsResult.data?.count ?? 0
        }
    }
}


type UserSyncStatus = {
    did: string
    handle: string | null
    mirrorStatus: string | null
    CAProfile: {
        createdAt: Date
    } | null
}

export const getUsersSyncStatus: CAHandler<{}, UserSyncStatus[]> = async (ctx, agent, {}) => {
    // Get all CA users from database
    const users = await ctx.kysely
        .selectFrom("User")
        .select(["did", "handle", "created_at_tz"])
        .where("inCA", "=", true)
        .where("hasAccess", "=", true)
        .execute()
    
    // Get mirror status for each user from Redis
    const statuses = await Promise.all(
        users.map(async u => ({
            did: u.did,
            handle: u.handle,
            mirrorStatus: await Effect.runPromise(ctx.redisCache.mirrorStatus.get(u.did, true)),
            CAProfile: u.created_at_tz ? { createdAt: u.created_at_tz } : null
        }))
    )
    
    return { data: statuses }
}