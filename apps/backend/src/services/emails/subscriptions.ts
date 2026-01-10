import {CAHandler} from "#/utils/handler.js";
import {MailSubscriptionsResponse, SentEmailsResponse, SentEmail, EmailTemplatesResponse, EmailTemplate, SendEmailsParams, SendEmailsResponse, SendEmailResult} from "@cabildo-abierto/api";
import {v4 as uuidv4} from "uuid";
import nodemailer from "nodemailer";
import {createInviteCodes} from "#/services/user/access.js";
import {AppContext} from "#/setup.js";


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


// Email Template CRUD handlers

export const getEmailTemplates: CAHandler<{}, EmailTemplatesResponse> = async (ctx) => {
    const templates = await ctx.kysely
        .selectFrom("EmailTemplate")
        .select([
            "id",
            "name",
            "subject",
            "html",
            "text",
            "created_at",
            "updated_at"
        ])
        .orderBy("created_at", "desc")
        .execute()

    return {
        data: {
            templates: templates.map(t => ({
                id: t.id,
                name: t.name,
                subject: t.subject,
                html: t.html,
                text: t.text,
                createdAt: t.created_at.toISOString(),
                updatedAt: t.updated_at.toISOString()
            }))
        }
    }
}


type CreateTemplateParams = {
    name: string
    subject: string
    html: string
    text: string
}

export const createEmailTemplate: CAHandler<CreateTemplateParams, EmailTemplate> = async (ctx, agent, params) => {
    const { name, subject, html, text } = params

    if (!name || !subject || !html || !text) {
        return { error: "Todos los campos son requeridos" }
    }

    // Check if name already exists
    const existing = await ctx.kysely
        .selectFrom("EmailTemplate")
        .select("id")
        .where("name", "=", name)
        .executeTakeFirst()

    if (existing) {
        return { error: "Ya existe una plantilla con ese nombre" }
    }

    const template = await ctx.kysely
        .insertInto("EmailTemplate")
        .values({
            id: uuidv4(),
            name,
            subject,
            html,
            text,
            updated_at: new Date()
        })
        .returning([
            "id",
            "name",
            "subject",
            "html",
            "text",
            "created_at",
            "updated_at"
        ])
        .executeTakeFirstOrThrow()

    return {
        data: {
            id: template.id,
            name: template.name,
            subject: template.subject,
            html: template.html,
            text: template.text,
            createdAt: template.created_at.toISOString(),
            updatedAt: template.updated_at.toISOString()
        }
    }
}


type UpdateTemplateParams = {
    params: { id: string }
    name?: string
    subject?: string
    html?: string
    text?: string
}

export const updateEmailTemplate: CAHandler<UpdateTemplateParams, EmailTemplate> = async (ctx, agent, params) => {
    const { params: { id }, name, subject, html, text } = params

    // Check if template exists
    const existing = await ctx.kysely
        .selectFrom("EmailTemplate")
        .select("id")
        .where("id", "=", id)
        .executeTakeFirst()

    if (!existing) {
        return { error: "Plantilla no encontrada" }
    }

    // Check if new name conflicts
    if (name) {
        const nameConflict = await ctx.kysely
            .selectFrom("EmailTemplate")
            .select("id")
            .where("name", "=", name)
            .where("id", "!=", id)
            .executeTakeFirst()

        if (nameConflict) {
            return { error: "Ya existe una plantilla con ese nombre" }
        }
    }

    const updateData: Partial<{ name: string; subject: string; html: string; text: string }> = {}
    if (name) updateData.name = name
    if (subject) updateData.subject = subject
    if (html) updateData.html = html
    if (text) updateData.text = text

    const template = await ctx.kysely
        .updateTable("EmailTemplate")
        .set(updateData)
        .where("id", "=", id)
        .returning([
            "id",
            "name",
            "subject",
            "html",
            "text",
            "created_at",
            "updated_at"
        ])
        .executeTakeFirstOrThrow()

    return {
        data: {
            id: template.id,
            name: template.name,
            subject: template.subject,
            html: template.html,
            text: template.text,
            createdAt: template.created_at.toISOString(),
            updatedAt: template.updated_at.toISOString()
        }
    }
}


type DeleteTemplateParams = {
    params: { id: string }
}

export const deleteEmailTemplate: CAHandler<DeleteTemplateParams, {}> = async (ctx, agent, params) => {
    const { params: { id } } = params

    // Check if template exists
    const existing = await ctx.kysely
        .selectFrom("EmailTemplate")
        .select("id")
        .where("id", "=", id)
        .executeTakeFirst()

    if (!existing) {
        return { error: "Plantilla no encontrada" }
    }

    // Check if template is used by any sent emails
    const usedByEmails = await ctx.kysely
        .selectFrom("EmailSent")
        .select("id")
        .where("templateId", "=", id)
        .executeTakeFirst()

    if (usedByEmails) {
        return { error: "No se puede eliminar una plantilla que ha sido usada para enviar emails" }
    }

    await ctx.kysely
        .deleteFrom("EmailTemplate")
        .where("id", "=", id)
        .execute()

    return { data: {} }
}


// Email sending handler

function getTransporter() {
    return nodemailer.createTransport({
        host: "mail.smtp2go.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.SMTP2GO_USER,
            pass: process.env.SMTP2GO_PASSWORD,
        },
    })
}

function getUnsubscribeLink(emailSentId: string) {
    return `https://cabildoabierto.ar/ajustes/desuscripcion/${emailSentId}`
}

function getInviteLink(code: string) {
    return `https://cabildoabierto.ar/login?c=${code}`
}

function replaceTemplateVariables(content: string, variables: {unsubscribe_link: string, invite_link?: string}) {
    let result = content
    result = result.replace(/\{\{unsubscribe_link\}\}/g, variables.unsubscribe_link)
    if (variables.invite_link) {
        result = result.replace(/\{\{invite_link\}\}/g, variables.invite_link)
    }
    return result
}

async function ensureSubscriptionExists(ctx: AppContext, email: string): Promise<string> {
    // Try to get existing subscription
    const existing = await ctx.kysely
        .selectFrom("MailingListSubscription")
        .select("id")
        .where("email", "=", email)
        .executeTakeFirst()

    if (existing) {
        return existing.id
    }

    // Create new subscription
    const id = uuidv4()
    await ctx.kysely
        .insertInto("MailingListSubscription")
        .values({
            id,
            email,
            status: "Subscribed"
        })
        .onConflict(oc => oc.column("email").doNothing())
        .execute()

    // Re-fetch in case of conflict
    const created = await ctx.kysely
        .selectFrom("MailingListSubscription")
        .select("id")
        .where("email", "=", email)
        .executeTakeFirst()

    return created?.id ?? id
}

const BATCH_SIZE = 10
const BATCH_DELAY_MS = 1000

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export const sendBulkEmails: CAHandler<SendEmailsParams, SendEmailsResponse> = async (ctx, agent, params) => {
    const { templateId, target, emails: inputEmails } = params

    // Validate inputs
    if (!templateId) {
        return { error: "Se requiere un template" }
    }

    if (target === "single" || target === "list") {
        if (!inputEmails || inputEmails.length === 0) {
            return { error: "Se requiere al menos un email" }
        }
    }

    // Get template
    const template = await ctx.kysely
        .selectFrom("EmailTemplate")
        .select(["id", "name", "subject", "html", "text"])
        .where("id", "=", templateId)
        .executeTakeFirst()

    if (!template) {
        return { error: "Plantilla no encontrada" }
    }

    // Get recipient emails based on target
    let recipientEmails: string[]

    if (target === "all_subscribers") {
        const subscribers = await ctx.kysely
            .selectFrom("MailingListSubscription")
            .select("email")
            .where("status", "=", "Subscribed")
            .execute()
        recipientEmails = subscribers.map(s => s.email)
    } else {
        recipientEmails = inputEmails!
    }

    if (recipientEmails.length === 0) {
        return { error: "No hay destinatarios" }
    }

    // Check if template uses invite_link
    const needsInviteCodes = template.html.includes("{{invite_link}}") || template.text.includes("{{invite_link}}")

    // Generate invite codes if needed
    let inviteCodes: string[] = []
    if (needsInviteCodes) {
        const codesResult = await createInviteCodes(ctx, recipientEmails.length)
        if (codesResult.error || !codesResult.data) {
            return { error: codesResult.error ?? "Error al crear códigos de invitación" }
        }
        inviteCodes = codesResult.data.inviteCodes
    }

    const transporter = getTransporter()
    const from = "Cabildo Abierto <soporte@cabildoabierto.ar>"
    const results: SendEmailResult[] = []

    // Process emails in batches
    for (let i = 0; i < recipientEmails.length; i += BATCH_SIZE) {
        const batch = recipientEmails.slice(i, i + BATCH_SIZE)
        const batchCodes = needsInviteCodes ? inviteCodes.slice(i, i + BATCH_SIZE) : []

        const batchPromises = batch.map(async (email, batchIndex) => {
            const globalIndex = i + batchIndex
            
            try {
                // Ensure subscription exists and get ID
                const subscriptionId = await ensureSubscriptionExists(ctx, email)

                // Pre-create EmailSent record to get ID for unsubscribe link
                const emailSentId = uuidv4()

                const unsubscribeLink = getUnsubscribeLink(emailSentId)
                const inviteLink = needsInviteCodes ? getInviteLink(batchCodes[batchIndex]) : undefined

                // Replace template variables
                const finalHtml = replaceTemplateVariables(template.html, { unsubscribe_link: unsubscribeLink, invite_link: inviteLink })
                const finalText = replaceTemplateVariables(template.text, { unsubscribe_link: unsubscribeLink, invite_link: inviteLink })

                // Send email with List-Unsubscribe headers
                await transporter.sendMail({
                    from,
                    to: email,
                    subject: template.subject,
                    text: finalText,
                    html: finalHtml,
                    headers: {
                        "List-Unsubscribe": `<${unsubscribeLink}>`,
                        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"
                    }
                })

                // Insert EmailSent record with success
                await ctx.kysely
                    .insertInto("EmailSent")
                    .values({
                        id: emailSentId,
                        recipientId: subscriptionId,
                        templateId: template.id,
                        subject: template.subject,
                        html: finalHtml,
                        text: finalText,
                        from,
                        success: true
                    })
                    .execute()

                ctx.logger.pino.info({ email, templateName: template.name, emailSentId }, "Email sent successfully")

                return {
                    email,
                    success: true,
                    emailSentId
                } as SendEmailResult

            } catch (error) {
                ctx.logger.pino.error({ error, email, templateName: template.name }, "Error sending email")
                
                return {
                    email,
                    success: false,
                    error: error instanceof Error ? error.message : "Error desconocido"
                } as SendEmailResult
            }
        })

        const batchResults = await Promise.all(batchPromises)
        results.push(...batchResults)

        // Add delay between batches (except for last batch)
        if (i + BATCH_SIZE < recipientEmails.length) {
            await delay(BATCH_DELAY_MS)
        }
    }

    const totalSent = results.filter(r => r.success).length
    const totalFailed = results.filter(r => !r.success).length

    ctx.logger.pino.info({ 
        templateName: template.name, 
        totalSent, 
        totalFailed, 
        target 
    }, "Bulk email send completed")

    return {
        data: {
            results,
            totalSent,
            totalFailed
        }
    }
}
