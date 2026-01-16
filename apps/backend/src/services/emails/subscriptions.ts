import {CAHandler, CAHandlerNoAuth} from "#/utils/handler.js";
import {MailSubscriptionsResponse, SentEmail, SentEmailsResponse} from "@cabildo-abierto/api";
import {v4 as uuidv4} from "uuid";
import {AppContext} from "#/setup.js";
import validator from 'validator';
import {unique} from "@cabildo-abierto/utils";


export const getMailSubscriptions: CAHandler<{}, MailSubscriptionsResponse> = async (ctx) => {
    // Get all subscriptions with user info
    const subscriptions = await ctx.kysely
        .selectFrom("MailingListSubscription")
        .leftJoin("User", "User.did", "MailingListSubscription.userId")
        .select([
            "MailingListSubscription.userId",
            "MailingListSubscription.email",
            "MailingListSubscription.status",
            "MailingListSubscription.subscribedAt",
            "MailingListSubscription.updatedAt",
            "User.handle",
            "User.inCA"
        ])
        .orderBy("MailingListSubscription.subscribedAt", "desc")
        .execute()

    // Count subscribed and unsubscribed
    const subscribed = subscriptions.filter(s => s.status === "Subscribed").length
    const unsubscribed = subscriptions.filter(s => s.status === "Unsubscribed").length

    // Count CA users without mailing list subscription
    const usersWithoutSubscriptionResult = await ctx.kysely
        .selectFrom("User")
        .leftJoin("MailingListSubscription", "MailingListSubscription.userId", "User.did")
        .where("User.inCA", "=", true)
        .where("MailingListSubscription.id", "is", null)
        .select(ctx.kysely.fn.count("User.did").as("count"))
        .executeTakeFirst()

    const usersWithoutSubscription = Number(usersWithoutSubscriptionResult?.count ?? 0)

    return {
        data: {
            subscriptions: subscriptions.map(s => ({
                email: s.email,
                status: s.status,
                subscribedAt: s.subscribedAt?.toISOString() ?? null,
                updatedAt: s.updatedAt?.toISOString() ?? null,
                handle: s.handle,
                userId: s.userId,
                inCA: s.inCA
            })),
            counts: {
                subscribed,
                unsubscribed,
                usersWithoutSubscription,
                subscriptionsWithoutUserId: subscriptions.filter(s => s.userId == null).length
            }
        }
    }
}


export const getSentEmails: CAHandler<{}, SentEmailsResponse> = async (ctx) => {
    const emails = await ctx.kysely
        .selectFrom("EmailSent")
        .innerJoin("MailingListSubscription", "MailingListSubscription.id", "EmailSent.recipientId")
        .innerJoin("EmailTemplate", "EmailTemplate.id", "EmailSent.templateId")
        .select([
            "EmailSent.id",
            "MailingListSubscription.email",
            "EmailSent.sent_at",
            "EmailSent.subject",
            "EmailSent.html",
            "EmailSent.text",
            "EmailSent.success",
            "EmailTemplate.name as templateName"
        ])
        .orderBy("EmailSent.sent_at", "desc")
        .execute()

    // Group by template name
    const emailsByTemplate: Record<string, SentEmail[]> = {}
    
    for (const email of emails) {
        const templateName = email.templateName
        if (!emailsByTemplate[templateName]) {
            emailsByTemplate[templateName] = []
        }
        emailsByTemplate[templateName].push({
            id: email.id,
            recipientEmail: email.email,
            sentAt: email.sent_at.toISOString(),
            subject: email.subject,
            html: email.html,
            text: email.text,
            success: email.success,
            templateName: email.templateName
        })
    }

    return {
        data: {
            emailsByTemplate,
            totalCount: emails.length
        }
    }
}


export async function addAccessRequestsToSubscriptions(ctx: AppContext) {
    const emails = await ctx.kysely
        .selectFrom("AccessRequest")
        .select(["email"])
        .execute()

    await ctx.kysely
        .insertInto("MailingListSubscription")
        .values(emails.map(e => ({
            id: uuidv4(),
            email: e.email,
            status: "Subscribed"
        })))
        .onConflict(oc => oc.column("email").doNothing())
        .execute()
}

export async function unsubscribe(ctx: AppContext, email: string) {
    await ctx.kysely
        .updateTable("MailingListSubscription")
        .where("email", "=", email)
        .set("status", "Unsubscribed")
        .execute()
    ctx.logger.pino.info({email}, "unsuscribed from mailing list")
}

async function checkUnsuscribeCode(ctx: AppContext, code: string) {
    const emails = await ctx.kysely
        .selectFrom("EmailSent")
        .where("EmailSent.id", "=", code)
        .innerJoin("MailingListSubscription", "EmailSent.recipientId", "MailingListSubscription.id")
        .select(["MailingListSubscription.email"])
        .execute()
    return emails.length > 0 ? {email: emails[0].email} : {}
}

export const unsubscribeHandler: CAHandlerNoAuth<{ params: {code: string} }, {}> = async (ctx, agent, {params}) => {
    const code = params.code
    const {email} = await checkUnsuscribeCode(ctx, code)
    ctx.logger.pino.info({email, code}, "check unsuscribe code")
    if(!email) {
        return {error: "Desuscripción inválida."}
    }

    try {
        await unsubscribe(ctx, email)
    } catch (error) {
        ctx.logger.pino.error({email, error}, "error on unsubscribe")
        return {error: "Ocurrió un error en la desuscipción."}
    }

    return {data: {}}
}


export const unsubscribeHandlerWithAuth: CAHandler<{}, {}> = async (ctx, agent) => {
    const email = await ctx.kysely
        .selectFrom("User")
        .where("User.did", "=", agent.did)
        .select(["email"])
        .executeTakeFirst()

    if(!email || !email.email) {
        return {error: "Correo desconocido."}
    }

    try {
        await unsubscribe(ctx, email.email)
    } catch (error) {
        ctx.logger.pino.error({email, error}, "error on unsubscribe")
        return {error: "Ocurrió un error en la desuscipción."}
    }

    return {data: {}}
}


export const subscribeHandler: CAHandler<{}, {}> = async (ctx, agent) => {
    const email = await ctx.kysely
        .selectFrom("User")
        .where("User.did", "=", agent.did)
        .select(["email"])
        .executeTakeFirst()

    if(!email || !email.email) {
        return {error: "Correo desconocido."}
    }

    try {
        await createMailingListSubscription(ctx, email.email, agent.did)
    } catch (error) {
        ctx.logger.pino.error({email, error}, "error on subscribe")
        return {error: "Ocurrió un error en la suscipción."}
    }

    return {data: {}}
}


export async function fillOriginalEmail(ctx: AppContext) {
    const subs = await ctx.kysely
        .selectFrom("MailingListSubscription")
        .where("emailOriginal", "is", null)
        .select(["id", "email"])
        .execute()

    if(subs.length == 0) return

    await ctx.kysely
        .insertInto("MailingListSubscription")
        .values(subs.map(s => ({
            id: s.id,
            email: s.email,
        })))
        .onConflict(oc => oc.column("id").doUpdateSet(eb => ({
            emailOriginal: eb.ref("excluded.email")
        })))
        .execute()
}


function normalizeEmail(email: string) {
    return email.trim().toLowerCase()
}

function isValidEmail(email: string) {
    return validator.isEmail(email, {
        allow_utf8_local_part: false,
        require_tld: true,
    })
}


export async function cleanInvalidEmails(ctx: AppContext) {
    const subs = await ctx.kysely
        .selectFrom("MailingListSubscription")
        .select(["id", "email", "subscribedAt"])
        .execute()



    await ctx.kysely.deleteFrom("EmailSent").execute()
    await ctx.kysely.deleteFrom("MailingListSubscription").execute()

    const values: ({
        id: string
        email: string
        emailOriginal: string
        status: "Subscribed"
        subscribedAt: Date
    } | null)[] = subs.map(s => {
        const n = normalizeEmail(s.email)
        if(isValidEmail(n)){
            return {
                id: s.id,
                email: n,
                emailOriginal: s.email.trim(),
                status: "Subscribed",
                subscribedAt: s.subscribedAt
            }
        } else {
            return null
        }
    })

    const uniqueValues = unique(values.filter(x => x != null), v => v.email)

    await ctx.kysely
        .insertInto("MailingListSubscription")
        .values(uniqueValues)
        .execute()
}


export async function addUsersDataToMailingListSubscriptions(ctx: AppContext) {
    const subs = await ctx.kysely
        .selectFrom("MailingListSubscription")
        .select(["id", "email", "emailOriginal", "userId", "userId"])
        .execute()

    const caUsers = await ctx.kysely
        .selectFrom("User")
        .select(["did", "email"])
        .where("inCA", "=", true)
        .execute()

    const values: {
        id: string
        email: string
        userId: string
    }[] = []
    for(const u of caUsers) {
        if(u.email != null) {
            const norm = normalizeEmail(u.email)
            if(isValidEmail(norm)) {
                for(const s of subs) {
                    if(s.email == norm && s.userId == null) {
                        values.push({id: s.id, email: norm, userId: u.did})
                    }
                }
            }
        }
    }
    if(values.length > 0) {
        ctx.logger.pino.info({count: values.length}, "inserting userIds to mailing list subscriptions")
        await ctx.kysely
            .insertInto("MailingListSubscription")
            .values(values)
            .onConflict(oc => oc.column("id").doUpdateSet(eb => ({
                userId: eb.ref("excluded.userId")
            })))
            .execute()
    }
}



export async function createMailingListSubscription(ctx: AppContext, email: string, userId?: string) {
    const norm = normalizeEmail(email)
    if(!isValidEmail(norm)) return
    await ctx.kysely
        .insertInto("MailingListSubscription")
        .values({
            id: uuidv4(),
            email: norm,
            emailOriginal: email,
            status: "Subscribed",
            userId: userId ?? null
        })
        .onConflict(oc => oc.column("email").doUpdateSet(eb => ({
            status: "Subscribed"
        })))
        .execute()
}