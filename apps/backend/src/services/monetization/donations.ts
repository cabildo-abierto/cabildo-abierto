import {CAHandler, CAHandlerNoAuth} from "#/utils/handler.js";
import {MercadoPagoConfig, Payment, Preference} from "mercadopago";
import {AppContext} from "#/setup.js";
import {getUsersWithReadSessions, UserWithReadSessions} from "#/services/monetization/get-users-with-read-sessions.js";
import {count} from "@cabildo-abierto/utils";
import {v4 as uuidv4} from "uuid";
import {env} from "#/lib/env.js";
import {
    createValidationRequest,
    setValidationRequestResult
} from "#/services/user/validation.js";

type Donation = {
    date: Date
    amount: number
}

export type DonationHistory = Donation[]

export const getDonationHistory: CAHandler<{}, DonationHistory> = async (ctx, agent, {}) => {
    const subscriptions = await ctx.kysely
        .selectFrom("Donation")
        .select(["created_at", "amount"])
        .where("userById", "=", agent.did)
        .where("transactionId", "is not", null)
        .execute()

    return {
        data: subscriptions.map(s => ({
            date: s.created_at,
            amount: s.amount
        }))
    }
}


export const getMonthlyValueHandler: CAHandlerNoAuth<{}, number> = async (ctx, agent, {}) => {
    return {data: getMonthlyValue()}
}


export function getMonthlyValue() {
    return 1500
}


export function isWeeklyActiveUser(ctx: AppContext, u: UserWithReadSessions, at: Date = new Date()): boolean {
    const lastWeekStart = new Date(at.getTime() - 1000 * 3600 * 24 * 7)
    const recentSessions = u.readSessions
        .filter(x => new Date(x.created_at) > lastWeekStart && new Date(x.created_at) < at)

    return recentSessions.length > 0
}


export function isMonthlyActiveUser(u: UserWithReadSessions, at: Date = new Date()): boolean {
    const lastMonthStart = new Date(at.getTime() - 1000 * 3600 * 24 * 30)
    const recentSessions = u.readSessions
        .filter(x => x.created_at > lastMonthStart && x.created_at < at)
    return recentSessions.length > 0
}


export async function getMonthlyActiveUsers(ctx: AppContext) {
    // Se consideran usuarios activos todos los usuarios que:
    //  - Sean cuenta de persona verificada
    //  - Hayan tenido al menos una read session en la última semana
    const users = await getUsersWithReadSessions(ctx)
    return count(users, isMonthlyActiveUser)
}

export async function getGrossIncome(ctx: AppContext): Promise<number> {
    const result = await ctx.kysely
        .selectFrom("Donation")
        .where("Donation.transactionId", "is not", null)
        .select((eb) => eb.fn.sum<number>("amount").as("total"))
        .executeTakeFirstOrThrow()

    return result.total
}

export async function getTotalSpending(ctx: AppContext): Promise<number> {
    const result = await ctx.kysely
        .selectFrom("UserMonth")
        .select((eb) => eb.fn.sum<number>("value").as("total"))
        .where("UserMonth.wasActive", "=", true)
        .executeTakeFirstOrThrow()

    return result.total ?? 0
}


export const getFundingStateHandler: CAHandlerNoAuth<{}, number> = async (ctx, agent, {}) => {
    const [mau, grossIncome, incomeSpent] = await Promise.all([
        getMonthlyActiveUsers(ctx),
        getGrossIncome(ctx),
        getTotalSpending(ctx)
    ])
    const monthlyValue = getMonthlyValue()
    const months = 6

    const state = Math.max(Math.min((grossIncome - incomeSpent) / (mau * monthlyValue * months), 1), 0) * 100
    ctx.logger.pino.info({monthlyValue, mau, grossIncome, incomeSpent, months, state}, "funding state")

    return {data: state}
}


export const createPreference: CAHandlerNoAuth<{ amount: number, verification?: boolean }, { id: string }> = async (ctx, agent, {amount, verification}) => {
    const client = new MercadoPagoConfig({accessToken: env.MP_ACCESS_TOKEN!})
    const preference = new Preference(client)

    const title = "Aporte de $" + amount + " a Cabildo Abierto"

    const frontendUrl = "https://cabildoabierto.ar"

    let items = [{
        picture_url: `${frontendUrl}/logo.png`,
        id: "0",
        title: title,
        quantity: 1,
        unit_price: amount,
        currencyId: "ARS"
    }]

    const agentDid = agent.hasSession() ? agent.did : "anonymous"

    try {
        const result = await preference.create({
            body: {
                back_urls: {
                    success: frontendUrl + "/aportar/pago-exitoso",
                    pending: frontendUrl + "/aportar/pago-pendiente",
                    failure: frontendUrl + "/aportar/pago-fallido"
                },
                notification_url: frontendUrl + "/api/pago?source_news=webhooks",
                items: items,
                metadata: {
                    user_id: agentDid,
                    amount: amount,
                },
                payment_methods: {
                    excluded_payment_types: [
                        {id: "ticket"}
                    ]
                }
            }
        })
        if (!result.id) {
            ctx.logger.pino.error({result}, "error on create preference: no id")
            return {error: "Ocurrió un error al iniciar el pago."}
        } else {
            await ctx.kysely
                .insertInto("Donation")
                .values([{
                    id: uuidv4(),
                    created_at: new Date(),
                    userById: agent.hasSession() ? agentDid : undefined,
                    amount: amount,
                    mpPreferenceId: result.id
                }])
                .execute()

            if(verification && agent.hasSession()) {
                await createValidationRequest(ctx, agent, {
                    tipo: "persona",
                    metodo: "mp"
                })
            }

            ctx.logger.pino.info({result}, "preference created")

            return {data: {id: result.id}}
        }
    } catch (error) {
        ctx.logger.pino.error({error}, "Error al crear una preferencia.")
        return {error: "Ocurrió un error al iniciar el pago."}
    }
}


const getPaymentDetails = async (orderId: string) => {
    const url = `https://api.mercadopago.com/merchant_orders/${orderId}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${env.MP_ACCESS_TOKEN!}`,
        },
    });

    const body = await response.json()
    const payments = body.payments
    if (payments && payments.length > 0) {
        const payment = payments[0]
        const id = payment.id
        const amount = payment.transaction_amount
        const preference_id = body.preference_id
        return {
            paymentId: id,
            amount,
            paymentStatus: payment.status,
            preferenceId: preference_id
        }
    } else {
        throw Error("Couldn't find payments in order")
    }
}

type MPNotificationBody = {
    action: string
    api_version: string
    data: {
        id?: string
    }
    date_created: string
    id: string
    live_mode: boolean
    type: string
    user_id: string
    params: any
    query: { "data.id": string }
}

export const processPayment: CAHandlerNoAuth<MPNotificationBody, {}> = async (ctx, agent, body) => {
    ctx.logger.pino.info({body}, "processing payment notification")
    let orderId = body.id
    if (!orderId) {
        ctx.logger.pino.info({orderId}, "No order id")
        return {error: "Ocurrió un error al procesar el identificador de la transacción."}
    }
    ctx.logger.pino.info({orderId}, "getting payment details with order id")
    const paymentDetails = await getPaymentDetails(orderId)
    ctx.logger.pino.info({paymentDetails}, "got payment details")

    if (paymentDetails.paymentStatus != "approved") {
        ctx.logger.pino.warn("not approved")
        return {error: "El pago no fue aprobado."}
    }

    const preferenceId = paymentDetails.preferenceId
    ctx.logger.pino.info({preferenceId}, "got preference id")

    const donation = await ctx.kysely
        .selectFrom("Donation")
        .select(["id", "userById"])
        .where("mpPreferenceId", "=", preferenceId)
        .executeTakeFirst()

    if (donation) {
        const id = donation.id
        ctx.logger.pino.info({id}, "found donation")

        await ctx.kysely
            .updateTable("Donation")
            .set("transactionId", paymentDetails.paymentId as string)
            .where("id", "=", id)
            .execute()

        if(donation.userById){
            await acceptValidationRequestFromPayment(ctx, donation.userById, paymentDetails.paymentId)
        }

    } else {
        ctx.logger.pino.error(`Couldn't find donation for preference ${preferenceId} in db.`)
        return {error: `Couldn't find donation for preference ${preferenceId} in db.`}
    }

    return {}
}


export async function acceptValidationRequestFromPayment(ctx: AppContext, userId: string, paymentId: string): Promise<{error?: string}> {
    const request = await ctx.kysely
        .selectFrom("ValidationRequest")
        .select(["id", "result"])
        .where("ValidationRequest.result", "!=", "Aceptada")
        .where("userId", "=", userId)
        .executeTakeFirst()

    if(request) {
        const client = new MercadoPagoConfig({
            accessToken: process.env.MP_ACCESS_TOKEN!,
            options: { timeout: 5000 },
        })

        const payment = new Payment(client)
        const res = await payment.get({id: paymentId})

        let dni: number | undefined = undefined
        const id = res.payer?.identification
        if(id) {
            if(id.type == "CUIT" || id.type == "CUIL"){
                try {
                    const dniStr = id.number?.slice(1, id.number.length-2)
                    if(!dniStr) {
                        return {error: "Ocurrió un error al procesar el CUIT."}
                    }
                    dni = parseInt(dniStr)
                } catch {
                    return {error: "Ocurrió un error al procesar el CUIT."}
                }
            } else {
                return {error: `Tipo de identificación desconocido: ${id.type}`}
            }
        } else {
            return {error: "No se pudo obtener la identificación."}
        }

        if(dni) {
            await setValidationRequestResult(
                ctx,
                {
                    id: request.id,
                    result: "accept",
                    reason: "found payment",
                    dni
                }
            )
            return {}
        } else {
            return {error: "No se pudo obtener la identificación."}
        }
    } else {
        return {error: "No se encontró la solicitud."}
    }
}
