import {CAHandler} from "#/utils/handler.js";
import {MailSubscriptionsResponse, SentEmailsResponse, SentEmail} from "@cabildo-abierto/api";


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
                usersWithoutSubscription
            }
        }
    }
}


export const getSentEmails: CAHandler<{}, SentEmailsResponse> = async (ctx) => {
    const emails = await ctx.kysely
        .selectFrom("EmailSent")
        .innerJoin("MailingListSubscription", "MailingListSubscription.id", "EmailSent.recipientId")
        .select([
            "EmailSent.id",
            "MailingListSubscription.email",
            "EmailSent.sent_at",
            "EmailSent.subject",
            "EmailSent.html",
            "EmailSent.text",
            "EmailSent.success",
            "EmailSent.template_name"
        ])
        .orderBy("EmailSent.sent_at", "desc")
        .execute()

    // Group by template_name
    const emailsByTemplate: Record<string, SentEmail[]> = {}
    
    for (const email of emails) {
        const templateName = email.template_name
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
            templateName: email.template_name
        })
    }

    return {
        data: {
            emailsByTemplate,
            totalCount: emails.length
        }
    }
}
