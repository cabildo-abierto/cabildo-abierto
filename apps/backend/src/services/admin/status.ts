import {CAHandler} from "#/utils/handler.js";
import {AppContext} from "#/setup.js";

type ServerStatus = {
    worker: boolean
    mirror: boolean
}


export async function updateTimestamp(ctx: AppContext, id: string, date: Date) {
    await ctx.kysely
        .insertInto("Timestamps")
        .values([{
            id,
            date,
        }])
        .onConflict(oc => oc.column("id").doUpdateSet(eb => ({
            date: eb.ref("excluded.date")
        })))
        .execute()
}


export async function getTimestamp(ctx: AppContext, id: string) {
    const ts = await ctx.kysely
        .selectFrom("Timestamps")
        .select("date")
        .where("id", "=", id)
        .executeTakeFirst()
    return ts?.date
}


export async function runTestJob(ctx: AppContext): Promise<void> {
    await updateTimestamp(ctx, "test", new Date())
    ctx.logger.pino.info("test job run successfully")
}


export const getServerStatus: CAHandler<{}, {status: ServerStatus}> = async (ctx, agent, params ) => {
    // chequeamos:
    // el worker completa un trabajo con prioridad baja
    // el mirror está corriendo y procesando evento

    const ts = await getTimestamp(ctx, "test")

    const lastEventProcessed = await getTimestamp(ctx, `last-mirror-event-${ctx.mirrorId}`)

    const threshold = new Date(Date.now() - 25*1000)
    const worker = ts != null && ts > threshold
    const mirror = lastEventProcessed != null && lastEventProcessed > threshold

    ctx.logger.pino.info({lastTestJob: ts, lastEventProcessed, worker, mirror, threshold, now: new Date()}, "server status")
    return {data: {status: {worker, mirror}}}
}