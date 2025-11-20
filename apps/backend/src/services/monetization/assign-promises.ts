import {AppContext} from "#/setup.js";
import {max, min, sum, unique} from "@cabildo-abierto/utils";
import {getCollectionFromUri, isArticle, isTopicVersion} from "@cabildo-abierto/utils";
import {v4 as uuidv4} from "uuid";
import {jsonArrayFrom} from "kysely/helpers/postgres";
import {ReadChunks, ReadChunksAttr} from "#/services/monetization/read-tracking.js";
import {FULL_READ_DURATION, joinManyChunks} from "#/services/monetization/get-users-with-read-sessions.js";


type UserMonth = {
    id: string
    value: number
    monthStart: Date
    monthEnd: Date
    userId: string
    totalAssigned: number | null
    confirmedPayments: {
        contentId: string
    }[]
}


type PaymentAssignmentCreation = {
    id: string
    userMonthId: string
    amount: number
    contentId: string
}


class PromiseAssigner {
    months: UserMonth[]
    ctx: AppContext
    reads: { created_at: Date, readContentId: string, readChunks: any, userId: string }[] = []
    topicVersions: Map<string, { uri: string, monetizedContribution: number }[]> = new Map() // mapa de uris leídos en todas las versiones anteriores aceptadas (incluída sí misma)

    constructor(ctx: AppContext, months: UserMonth[]) {
        this.ctx = ctx
        this.months = months
    }

    async fetchReadSessions() {
        const firstStart = min(this.months, m => m.monthStart.getTime())?.monthStart
        const lastEnd = max(this.months, m => m.monthEnd.getTime())?.monthEnd

        if (!firstStart || !lastEnd) return []

        const reads = await this.ctx.kysely
            .selectFrom("ReadSession")
            .where("ReadSession.created_at_tz", ">=", firstStart)
            .where("ReadSession.created_at_tz", "<", lastEnd)
            .where("ReadSession.userId", "in", unique(this.months.map(m => m.userId)))
            .innerJoin("Record", "Record.uri", "ReadSession.readContentId")
            .whereRef("ReadSession.userId", "!=", "Record.authorId")
            .select([
                "ReadSession.userId",
                "ReadSession.created_at_tz",
                "ReadSession.readContentId",
                "ReadSession.readChunks"
            ])
            .execute()

        this.reads = reads
            .map(r => r.created_at_tz && r.readContentId ? ({
                created_at: r.created_at_tz,
                userId: r.userId,
                readContentId: r.readContentId,
                readChunks: r.readChunks
            }) : null)
            .filter(x => x != null)
    }


    getArticlePaymentsForMonth(
        m: UserMonth,
        reads: { readContentId: string, readChunks: any }[],
        value: number
    ): PaymentAssignmentCreation[] {
        const articleReads = reads
            .filter(r => isArticle(getCollectionFromUri(r.readContentId)))

        const chunksByContent = getChunksReadByContent(articleReads)

        const totalChunks = sum(Array.from(chunksByContent.values()), x => x)

        const chunkValue = value / totalChunks

        return Array.from(chunksByContent.entries()).map(([uri, count]) => {
            return {
                id: uuidv4(),
                userMonthId: m.id,
                amount: chunkValue * count,
                contentId: uri
            }
        })
    }


    getTopicVersionPaymentsForMonth(
        m: UserMonth,
        reads: { readContentId: string, readChunks: any }[],
        value: number): PaymentAssignmentCreation[] {
        const topicVersionReads = reads
            .filter(r => isTopicVersion(getCollectionFromUri(r.readContentId)))

        const chunksByContent = getChunksReadByContent(topicVersionReads)

        const totalChunks = sum(Array.from(chunksByContent.values()), x => x)

        const chunkValue = value / totalChunks

        return Array.from(chunksByContent.entries()).flatMap(([uri, count]) => {
            const prevAccepted = this.topicVersions.get(uri)
            if (!prevAccepted) {
                this.ctx.logger.pino.warn({uri}, "could not find topic version")
                return []
            }

            const readAmount = chunkValue * count

            let totalMonetizedContr = sum(prevAccepted, v => v.monetizedContribution)

            if(totalMonetizedContr <= 0) {
                this.ctx.logger.pino.warn({uri, count, totalMonetizedContr}, "non positive total monetized contribution")
                return []
            }

            if(prevAccepted.some(p => p.monetizedContribution == null)) {
                this.ctx.logger.pino.warn({prevAccepted, uri, count, totalMonetizedContr}, "monetized contribution is null")
                return []
            }

            return prevAccepted.map(p => ({
                id: uuidv4(),
                userMonthId: m.id,
                amount: readAmount * p.monetizedContribution / totalMonetizedContr,
                contentId: uri
            }))
        })
    }


    simplifyPayments(payments: PaymentAssignmentCreation[]): PaymentAssignmentCreation[] {
        const paymentByMonthAndContent = new Map<string, PaymentAssignmentCreation>()

        payments.forEach(p => {
            const key = `${p.userMonthId}:${p.contentId}`
            const cur = paymentByMonthAndContent.get(key)
            if (!cur) {
                paymentByMonthAndContent.set(key, p)
            } else {
                paymentByMonthAndContent.set(key, {
                    userMonthId: p.userMonthId,
                    contentId: p.contentId,
                    amount: p.amount + cur.amount,
                    id: p.id
                })
            }
        })

        return Array.from(paymentByMonthAndContent.values())
    }


    getPaymentsForMonth(m: UserMonth): PaymentAssignmentCreation[] {
        const totalAssigned = m.totalAssigned ?? 0
        const toAssign = m.value * 0.7
        const remainingValue = toAssign - totalAssigned

        if (remainingValue <= 5) {
            return []
        }

        const confirmedContents = new Set(m.confirmedPayments?.map(p => p.contentId))

        const reads = this.reads
            .filter(r => !confirmedContents.has(r.readContentId) && r.created_at < m.monthEnd && r.created_at >= m.monthStart && r.userId == m.userId)

        const hasArticles = reads.some(r => isArticle(getCollectionFromUri(r.readContentId)))
        const hasTopics = reads.some(r => isArticle(getCollectionFromUri(r.readContentId)))

        const articlePayments = this.getArticlePaymentsForMonth(
            m,
            reads,
            remainingValue * (hasTopics ? 0.5 : 1)
        )

        const topicPayments = this.getTopicVersionPaymentsForMonth(
            m,
            reads,
            remainingValue * (hasArticles ? 0.5 : 1)
        )

        return this.simplifyPayments([
            ...articlePayments,
            ...topicPayments
        ])
    }


    async fetchTopicVersions() {
        const topicVersions = this.reads
            .map(r => r.readContentId)
            .filter(r => isTopicVersion(getCollectionFromUri(r)))

        const res = await this.ctx.kysely
            .selectFrom("TopicVersion as ReadVersion")
            .where("ReadVersion.uri", "in", topicVersions)
            .innerJoin("Topic", "Topic.id", "ReadVersion.topicId")
            .innerJoin("TopicVersion", "TopicVersion.topicId", "Topic.id")
            .innerJoin("Record", "Record.uri", "TopicVersion.uri")
            .innerJoin("Record as ReadVersionRecord", "ReadVersionRecord.uri", "ReadVersion.uri")
            .innerJoin("Content", "Content.uri", "TopicVersion.uri")
            .select([
                "TopicVersion.uri",
                "Topic.id",
                "ReadVersion.uri as readVersion",
                "TopicVersion.monetizedContribution"
            ])
            .orderBy("Record.created_at_tz asc")
            .whereRef("Record.created_at_tz", "<=", "ReadVersionRecord.created_at_tz")
            .where("TopicVersion.accepted", "=", true)
            .execute()

        res.forEach(tv => {
            const contr = tv.monetizedContribution
            if (contr == null) {
                this.ctx.logger.pino.error({tv}, "contribution not found")
                throw Error("contribution not found when assigning promises")
            }
            const cur = this.topicVersions.get(tv.readVersion)
            const newVersion = {uri: tv.uri, monetizedContribution: contr}
            if (!cur) {
                this.topicVersions.set(tv.readVersion, [newVersion])
            } else {
                this.topicVersions.set(tv.readVersion, [
                    ...cur,
                    newVersion
                ])
            }
        })
    }

    /*
        Creamos pagos por cada contenido leído por el autor en el mes
     */
    async getPayments(): Promise<PaymentAssignmentCreation[]> {
        await this.fetchReadSessions()

        await this.fetchTopicVersions()

        return this.months.flatMap(m => this.getPaymentsForMonth(m))
    }
}


/*
* Por cada UserMonth creado que no esté completamente asignado y confirmado reasignamos las promesas.
*  */
export async function assignPromises(ctx: AppContext) {

    const months: UserMonth[] = await ctx.kysely
        .selectFrom("UserMonth")
        .select([
            "UserMonth.id",
            "UserMonth.value",
            "UserMonth.userId",
            "UserMonth.monthStart",
            "UserMonth.monthEnd",
            eb => eb.selectFrom("AssignedPayment")
                .whereRef("AssignedPayment.userMonthId", "=", "UserMonth.id")
                .where("AssignedPayment.status", "!=", "Pending")
                .select(eb => eb.fn.sum<number>("AssignedPayment.amount").as("totalAssigned")).as("totalAssigned"),
            eb => jsonArrayFrom(eb
                .selectFrom("AssignedPayment")
                .whereRef("AssignedPayment.userMonthId", "=", "UserMonth.id")
                .where("AssignedPayment.status", "=", "Confirmed")
                .select([
                    "AssignedPayment.contentId"
                ])
                .orderBy("AssignedPayment.created_at asc")
            ).as("confirmedPayments")
        ])
        .where("UserMonth.wasActive", "=", true)
        .where("UserMonth.fullyConfirmed", "=", false)
        .execute()

    const assigner = new PromiseAssigner(ctx, months)
    const payments = await assigner.getPayments()

    await ctx.kysely.transaction().execute(async trx => {
        await trx
            .deleteFrom("AssignedPayment")
            .where("AssignedPayment.userMonthId", "in", months.map(m => m.id))
            .where("AssignedPayment.status", "=", "Pending")
            .execute()

        if (payments.length > 0) {
            await ctx.kysely
                .insertInto("AssignedPayment")
                .values(payments)
                .execute()
        }
    })

    ctx.logger.pino.info(`Se reasignaron los pagos para ${months.length} meses de usuarios.`)
}


function countReadChunks(a: ReadChunks): number {
    return sum(a, x => Math.max(0, Math.min((x.duration != null ? x.duration : 0) / FULL_READ_DURATION, 1)))
}


export function getChunksReadByContent(readSessions: { readContentId: string | null, readChunks: ReadChunksAttr }[]) {
    const chunksByContent = new Map<string, ReadChunks[]>()
    readSessions.forEach(readSession => {
        const k = readSession.readContentId
        if (k) {
            chunksByContent.set(k, [...chunksByContent.get(k) ?? [], readSession.readChunks.chunks])
        }
    })

    const chunksAccByContent = new Map<string, ReadChunks>(Array.from(chunksByContent.entries()).map(([k, v]) => [k, joinManyChunks(v)]))
    const chunksReadArray: [string, number][] = Array.from(chunksAccByContent.entries()).map(([k, v]) => ([k, countReadChunks(v)]))

    return new Map<string, number>(chunksReadArray)
}