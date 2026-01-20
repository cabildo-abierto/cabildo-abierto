import {CAHandler} from "#/utils/handler.js";
import {dayMs, getDidFromUri, unique} from "@cabildo-abierto/utils";
import {jsonArrayFrom} from "kysely/helpers/postgres";
import {dailyPlotData} from "#/services/admin/stats/utils.js";
import {getValidationState} from "#/services/user/users.js";
import {StatsDashboard, StatsDashboardUser} from "@cabildo-abierto/api";
import {sql} from "kysely";
import {AppContext} from "#/setup.js";
import {v4 as uuidv4} from "uuid";


export const testUsers = [
    "usuariodepruebas.bsky.social",
    "usuariodepruebas2.bsky.social",
    "usuariodepruebas3.bsky.social",
    "usuariodepruebas4.bsky.social",
    "usuariodepruebas5.bsky.social",
    "usuariodepruebas6.bsky.social",
    "usuariodepruebas7.bsky.social",
    "usuariodepruebas8.bsky.social",
    "usuariodepruebas9.bsky.social",
    "carlitos-tester.bsky.social",
    "pruebaprueba.bsky.social"
]


const launchDate = new Date('2025-07-09T00:00:00-03:00')


export async function computePaymentPromiseStats(ctx: AppContext, reset: boolean) {
    const label = "new-payment-promises"
    if(reset) {
        await ctx.kysely.deleteFrom("Stat").where("label", "=", label).execute()
    }
    const existing = await ctx.kysely
        .selectFrom("Stat")
        .select(["date"])
        .where("label", "=", label)
        .execute()

    const yesterday = new Date(Date.now()-dayMs)
    yesterday.setHours(0, 0, 0, 0)

    const toInsert: {date: Date, value: number}[] = []
    for (
        let d = new Date(launchDate);
        d <= yesterday;
        d.setDate(d.getDate() + 1)
    ) {
        if(existing.some(s => s.date.getUTCDate() == d.getUTCDate())) continue
        ctx.logger.pino.info(`computing npp for day ${d}`)
        const [{ npp }] = await ctx.kysely
            .selectFrom('AssignedPayment')
            .select(({ fn }) => [
                fn.sum<number>('amount').as('npp'),
            ])
            .where("AssignedPayment.created_at", ">=", new Date(d.getTime()))
            .where("AssignedPayment.created_at", "<", new Date(d.getTime()+dayMs))
            .execute()
        toInsert.push({
            date: new Date(d),
            value: npp ?? 0
        })
    }

    if(toInsert.length > 0) {
        await ctx.kysely
            .insertInto("Stat")
            .values(toInsert.map(i => ({
                id: uuidv4(),
                value: i.value,
                date: i.date,
                label
            })))
            .execute()
    }
}


export async function computeWAUStats(ctx: AppContext, reset: boolean) {
    if(reset) {
        await ctx.kysely.deleteFrom("Stat").where("label", "=", "wau").execute()
    }
    const existing = await ctx.kysely
        .selectFrom("Stat")
        .select(["date"])
        .where("label", "=", "wau")
        .execute()

    const yesterday = new Date(Date.now()-dayMs)
    yesterday.setHours(0, 0, 0, 0)

    const toInsert: {date: Date, wau: number}[] = []
    for (
        let d = new Date(launchDate);
        d <= yesterday;
        d.setDate(d.getDate() + 1)
    ) {
        if(existing.some(s => s.date.getUTCDate() == d.getUTCDate() && s.date.getUTCMonth() == d.getUTCMonth() && s.date.getUTCFullYear() == d.getUTCFullYear())) {
            continue
        }
        ctx.logger.pino.info(`computing wau for day ${d}`)
        const [{ wau }] = await ctx.kysely
            .selectFrom('ReadSession')
            .select(({ fn }) => [
                fn.count<number>('userId').distinct().as('wau'),
            ])
            .where("ReadSession.created_at_tz", ">=", new Date(d.getTime()-dayMs*6))
            .where("ReadSession.created_at_tz", "<", new Date(d.getTime()+dayMs))
            .execute()
        toInsert.push({
            date: new Date(d),
            wau: wau
        })
    }

    if(toInsert.length > 0) {
        await ctx.kysely
            .insertInto("Stat")
            .values(toInsert.map(i => ({
                id: uuidv4(),
                value: i.wau,
                date: i.date,
                label: "wau"
            })))
            .execute()
    }
}


export async function updateStat(ctx: AppContext, label: string, reset: boolean) {
    ctx.logger.pino.info({label, reset}, "running update stat")
    if(label == "new-payment-promises") {
        await computePaymentPromiseStats(ctx, reset)
        ctx.logger.pino.info("done computing payment promises stats")
    } else if(label == "wau") {
        await computeWAUStats(ctx, reset)
        ctx.logger.pino.info("done computing wau stats")
    }
}


export async function updateAllStats(ctx: AppContext) {
    for(const label of ["new-payment-promises", "wau"]) {
        await ctx.worker?.addJob("update-stat", label)
    }
}


const automatedDids = ["did:plc:arplmoycj2z7jz3wljgyq3lh", "did:plc:2semihha42b7efhu4ywv7whi"]


async function getStatsDashboardUsers(ctx: AppContext){
    return ctx.kysely
        .selectFrom("User")
        .where("inCA", "=", true)
        .select([
            "did",
            "handle",
            "authorStatus",
            "created_at_tz",
            "email",
            "userValidationHash",
            "orgValidation",
            eb => jsonArrayFrom(eb
                .selectFrom("ReadSession")
                .whereRef("ReadSession.userId", "=", "User.did")
                .select([
                    "created_at_tz"
                ])
                .orderBy("created_at_tz desc")
                .limit(1)
            ).as("lastReadSession")
        ])
        .execute()
}


export const getStatsDashboard: CAHandler<{}, StatsDashboard> = async (ctx, agent, {}) => {
    const t1 = Date.now()
    const label = 'ca:en discusión'
    const [users, articles, humanEdits, edits, enDiscusion, humanEnDiscusion, stats] = await Promise.all([
        getStatsDashboardUsers(ctx),
        ctx.kysely
            .selectFrom("Article")
            .select(["uri"])
            .execute(),
        ctx.kysely
            .selectFrom("TopicVersion")
            .innerJoin("Record", "Record.uri", "TopicVersion.uri")
            .select(({ fn }) => fn.countAll<number>().as("count"))
            .where("Record.authorId", "not in", automatedDids)
            .executeTakeFirst(),
        ctx.kysely
            .selectFrom("TopicVersion")
            .select(({ fn }) => fn.countAll<number>().as("count"))
            .executeTakeFirst(),
        ctx.kysely
            .selectFrom("Content")
            .select(({ fn }) => fn.countAll<number>().as("count"))
            .where(sql<boolean>`"Content"."selfLabels" @> ARRAY[${label}]::text[]`)
            .executeTakeFirst(),
        ctx.kysely
            .selectFrom("Content")
            .select(({ fn }) => fn.countAll<number>().as("count"))
            .innerJoin("Record", "Record.uri", "Content.uri")
            .where("Record.authorId", "not in", automatedDids)
            .where(sql<boolean>`"Content"."selfLabels" @> ARRAY[${label}]::text[]`)
            .executeTakeFirst(),
        ctx.kysely
            .selectFrom("Stat")
            .select(["label", "date", "value"])
            .execute()
    ])

    const lastWeek = new Date(Date.now()-dayMs*7)

    const usersRes: StatsDashboardUser[] = users.map(u => ({
        handle: u.handle,
        did: u.did,
        email: u.email,
        created_at: u.created_at_tz,
        authorStatus: u.authorStatus as string,
        lastReadSession: u.lastReadSession.length > 0 ? new Date(u.lastReadSession[0].created_at_tz ?? 0) : null,
        verification: getValidationState(u)
    }))

    const active = usersRes.filter(u => u.lastReadSession && u.lastReadSession > lastWeek && !testUsers.includes(u.handle ?? "") && u.handle != "cabildoabierto.ar").length

    const verified = usersRes
        .filter(u => u.verification != null).length

    const verifiedHuman = usersRes.filter(u => u.verification == "person").length

    const verifiedActive = usersRes.filter(u => u.verification != null && u.lastReadSession && u.lastReadSession > lastWeek && !testUsers.includes(u.handle ?? "") && u.handle != "cabildoabierto.ar").length

    const humanArticles = articles
        .filter(a => !automatedDids.includes(getDidFromUri(a.uri)))

    const t2 = Date.now()

    ctx.logger.logTimes("stats dashboard", [t1, t2])

    const labels: string[] = unique(stats.map(s => s.label))
    const statsByLabel = labels.map(l => ({
        label: l,
        data: stats.filter(s => s.label == l).map(x => ({
            date: x.date,
            value: x.value
        }))
    }))

    return {
        data: {
            counts: {
                active,
                verified,
                verifiedHuman,
                verifiedActive,
                registered: users.length,
                totalArticles: articles.length,
                humanArticles: humanArticles.length,
                totalEdits: edits?.count ?? 0,
                humanEdits: humanEdits?.count ?? 0,
                totalEnDiscusion: enDiscusion?.count ?? 0,
                humanEnDiscusion: humanEnDiscusion?.count ?? 0
            },
            users: usersRes,
            stats: statsByLabel
        }
    }
}


export const getReadSessionsPlot: CAHandler<{}, {date: Date, count: number}[]> = async (ctx, agent, params) => {
    const reads = await ctx.kysely
        .selectFrom("ReadSession")
        .select(["created_at_tz"])
        .execute()

    const data = dailyPlotData(reads,
        (x, d) => x.created_at_tz != null && new Date(x.created_at_tz).toDateString() == new Date(d).toDateString())

    return {
        data
    }
}