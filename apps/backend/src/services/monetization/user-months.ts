import {AppContext} from "#/setup.js";
import {getMonthlyValue} from "#/services/monetization/donations.js";
import {max, min, unique} from "@cabildo-abierto/utils";
import {jsonArrayFrom} from "kysely/helpers/postgres";
import {v4 as uuidv4} from "uuid";
import {CAHandler} from "#/utils/handler.js";


function addOneMonth(date: Date) {
    const d = new Date(date)
    d.setMonth(d.getMonth() + 1)
    return d
}


function getNewUserMonths(ctx: AppContext, user: {
    did: string
    validations: { created_at_tz: Date | null }[]
    months: { monthEnd: Date }[]
}) {
    const validations = user.validations
        .map(x => x.created_at_tz)
        .filter(x => x != null)
    if (validations.length > 0) {
        let newMonthStart: Date
        if (user.months.length > 0) {
            newMonthStart = user.months[0].monthEnd
        } else {
            newMonthStart = min(validations, v => v.getTime())!
        }
        const now = new Date()
        let newMonthEnd = addOneMonth(newMonthStart)

        let newMonths: { start: Date, end: Date, did: string }[] = []
        while (newMonthEnd < now) {
            newMonths.push({
                start: newMonthStart,
                end: newMonthEnd,
                did: user.did
            })
            newMonthStart = new Date(newMonthEnd)
            newMonthEnd = addOneMonth(newMonthEnd)
        }
        return newMonths
    }
    ctx.logger.pino.warn("user has no validations but has hash")
    return []
}


export async function createUserMonths(ctx: AppContext) {
    // Por cada usuario se crean UserMonths desde su primera read session.
    // Los UserMonths se crean una vez terminado el mes
    ctx.logger.pino.info("Creating user months")

    const t1 = Date.now()
    const users = await ctx.kysely
        .selectFrom("User")
        .where("User.userValidationHash", "is not", null)
        .select([
            "User.did",
            "User.handle",
            eb => jsonArrayFrom(eb
                .selectFrom("UserMonth")
                .whereRef("UserMonth.userId", "=", "User.did")
                .select([
                    "monthEnd"
                ])
                .orderBy("monthStart desc")
            ).as("months"),
            eb => jsonArrayFrom(eb
                .selectFrom("ValidationRequest")
                .whereRef("ValidationRequest.userId", "=", "User.did")
                .where("ValidationRequest.result", "=", "Aceptada")
                .where("ValidationRequest.type", "=", "Persona")
                .select([
                    "created_at_tz"
                ])
                .orderBy("created_at_tz asc")
            ).as("validations")
        ])
        .where("User.userValidationHash", "is not", null)
        .execute()
    const t2 = Date.now()

    const newMonths = users.flatMap(u => getNewUserMonths(ctx, u))

    if (newMonths.length == 0) {
        ctx.logger.pino.info("no new months to create")
    }

    const value = getMonthlyValue()

    const firstStart = min(newMonths.map(m => new Date(m.start)))
    const lastEnd = max(newMonths.map(m => new Date(m.end)))

    if (!firstStart || !lastEnd) {
        return
    }

    ctx.logger.pino.info({newMonths, firstStart, lastEnd}, "got new months")

    const reads = await ctx.kysely
        .selectFrom("ReadSession")
        .where("ReadSession.userId", "in", unique(newMonths.map(m => m.did)))
        .where("ReadSession.created_at_tz", ">=", firstStart)
        .where("ReadSession.created_at_tz", "<=", lastEnd)
        .select([
            "ReadSession.userId",
            "ReadSession.created_at_tz",
            "ReadSession.readContentId"
        ])
        .execute()

    const values = newMonths.map(m => {
        const monthReads = reads
            .filter(r => (
                r.userId == m.did &&
                r.created_at_tz != null &&
                new Date(r.created_at_tz) < new Date(m.end) &&
                new Date(r.created_at_tz) >= new Date(m.start)
            ))

        const contentsRead = unique(monthReads, r => r.readContentId).length

        const active = contentsRead >= 3

        return {
            id: uuidv4(),
            userId: m.did,
            monthStart: m.start,
            monthEnd: m.end,
            wasActive: active,
            value: active ? value : 0
        }
    })
    const t3 = Date.now()

    ctx.logger.pino.info(values, "creating new user months")

    await ctx.kysely
        .insertInto("UserMonth")
        .values(values)
        .execute()
    const t4 = Date.now()

    ctx.logger.logTimes("done creating new user months", [t1, t2, t3, t4])
}


type UserMonthView = {
    id: string
    userId: string
    value: number
    fullyConfirmed: boolean
    payments: UserMonthPaymentView[]
}


type UserMonthPaymentView = {
    amount: number
    status: "Pending" | "Payed" | "Confirmed"
    uri: string
    title: string | null
    topicId: string | null
    handle: string | null
}


export const getUserMonthPayments: CAHandler<{
    params: { id: string }
}, UserMonthView> = async (ctx, agent, {params}) => {
    const payments = await ctx.kysely
        .selectFrom("AssignedPayment")
        .leftJoin("TopicVersion", "TopicVersion.uri", "AssignedPayment.contentId")
        .leftJoin("Article", "Article.uri", "AssignedPayment.contentId")
        .innerJoin("Record", "Record.uri", "AssignedPayment.contentId")
        .innerJoin("User", "User.did", "Record.authorId")
        .where("AssignedPayment.userMonthId", "=", params.id)
        .select([
            "Article.title",
            "TopicVersion.topicId",
            "AssignedPayment.contentId",
            "AssignedPayment.status",
            "AssignedPayment.amount",
            "User.handle"
        ])
        .execute()

    const month = await ctx.kysely
        .selectFrom("UserMonth")
        .select([
            "userId",
            "monthStart",
            "monthEnd",
            "UserMonth.fullyConfirmed",
            "UserMonth.value",
            "id"
        ])
        .where("UserMonth.id", "=", params.id)
        .executeTakeFirst()

    if(!month) {
        return {error: `No se encontró el mes ${params.id}`}
    }

    const paymentsView: UserMonthPaymentView[] = payments.map(p => {
        return {
            amount: p.amount,
            status: p.status,
            title: p.title,
            uri: p.contentId,
            topicId: p.topicId,
            handle: p.handle
        }
    })

    return {
        data: {
            ...month,
            payments: paymentsView
        }
    }
}


type UserMonth = {
    id: string
    start: Date
    end: Date
    active: boolean
    fullyConfirmed: boolean
}


type UserWithUserMonths = {
    did: string
    handle: string
    months: UserMonth[]
}


export const getUserMonthsStats: CAHandler<{}, UserWithUserMonths[]> = async (
    ctx,
    agent,
    params
) => {

    const userMonths = await ctx.kysely
        .selectFrom("UserMonth")
        .innerJoin("User", "User.did", "UserMonth.userId")
        .select([
            "userId as did",
            "monthStart",
            "monthEnd",
            "wasActive",
            "User.handle",
            "UserMonth.id",
            "UserMonth.fullyConfirmed",
        ])
        .orderBy("monthStart")
        .execute()

    const res = new Map<string, UserWithUserMonths>()
    userMonths.forEach(m => {
        if (!m.handle) {
            ctx.logger.pino.info({m}, "skipping month")
            return
        }
        let cur = res.get(m.did)
        if (!cur) {
            res.set(m.did, {
                did: m.did,
                handle: m.handle,
                months: []
            })
            cur = res.get(m.did)
        }
        if (cur) {
            cur.months.push({
                id: m.id,
                start: m.monthStart,
                end: m.monthEnd,
                active: m.wasActive,
                fullyConfirmed: m.fullyConfirmed
            })
        }
    })

    return {
        data: Array.from(res.values())
    }
}