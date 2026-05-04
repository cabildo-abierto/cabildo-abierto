import {CAHandler, CAHandlerNoAuth} from "#/utils/handler.js";
import {MercadoPagoConfig, Preference} from "mercadopago";
import {AppContext} from "#/setup.js";
import {v4 as uuidv4} from "uuid";
import {env} from "#/lib/env.js";
import {acceptVerificationRequestFromPayment, createVerificationRequest} from "#/services/user/validation.js";
import {Effect} from "effect";
import {DBSelectError} from "#/utils/errors.js";

type Donation = {
    date: Date
    amount: number
}

export type DonationHistory = Donation[]

export const getDonationHistory: CAHandler<{}, DonationHistory> = async (ctx, agent) => {
    const subscriptions = await ctx.kysely
        .selectFrom("Donation")
        .select(["createdAt", "amount"])
        .where("userById", "=", agent.did)
        .where("transactionId", "is not", null)
        .execute()

    return {
        data: subscriptions.map(s => ({
            date: s.createdAt,
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


export const getMonthlyActiveUsers = (
    ctx: AppContext,
    verified: boolean
) => Effect.gen(function* () {
    // Se consideran usuarios activos todos los usuarios que:
    //  - Sean cuenta de persona verificada
    //  - Hayan tenido al menos una read session en el último mes
    const lastMonthStart = new Date(Date.now() - 1000 * 3600 * 24 * 30)

    const result = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("User")
            .select((eb) => eb.fn.count<number>("User.did").as("count"))
            .where("User.inCA", "=", true)
            .where("User.hasAccess", "=", true)
            .$if(verified, (qb) =>
                qb.where("User.userValidationHash", "is not", null)
            )
            .where((eb) =>
                eb.exists(eb
                    .selectFrom("Record")
                    .select("Record.uri")
                    .whereRef("Record.authorId", "=", "User.did")
                    .where("Record.createdAt", ">", lastMonthStart)
                )
            )
            .executeTakeFirstOrThrow(),
        catch: (error) => new DBSelectError(error)
    })

    return result.count
})


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
            ctx.logger.pino.info({resultId: result.id, verification}, "preference created")
            await ctx.kysely
                .insertInto("Donation")
                .values([{
                    id: uuidv4(),
                    createdAt: new Date(),
                    userById: agent.hasSession() ? agentDid : undefined,
                    amount: amount,
                    mpPreferenceId: result.id
                }])
                .execute()

            if(verification && agent.hasSession()) {
                await createVerificationRequest(ctx, agent, {
                    tipo: "persona",
                    metodo: "mp"
                })
            }


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
            await acceptVerificationRequestFromPayment(ctx, donation.userById, paymentDetails.paymentId)
        }

    } else {
        ctx.logger.pino.error(`Couldn't find donation for preference ${preferenceId} in db.`)
        return {error: `Couldn't find donation for preference ${preferenceId} in db.`}
    }

    return {}
}


