import {AppContext} from "#/setup.js";
import {CAHandler} from "#/utils/handler.js";
import {SendEmailResult, SendEmailsParams, SendEmailsResponse} from "@cabildo-abierto/api";
import {createInviteCodes} from "#/services/user/access.js";
import {v4 as uuidv4} from "uuid";
import nodemailer from "nodemailer";


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
    return {
        unsubscribeUIUrl: `https://cabildoabierto.ar/desuscripcion/${emailSentId}`,
        unsubscribeAPIUrl: `https://api.cabildoabierto.ar/unsubscribe/${emailSentId}`
    }
}

function getInviteLink(code: string) {
    return `https://cabildoabierto.ar/login?c=${code}`
}

function replaceTemplateVariables(content: string, variables: { unsubscribe_link: string, invite_link?: string }) {
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
    const {templateId, target, emails: inputEmails} = params

    // Validate inputs
    if (!templateId) {
        return {error: "Se requiere un template"}
    }

    if (target === "single" || target === "list") {
        if (!inputEmails || inputEmails.length === 0) {
            return {error: "Se requiere al menos un email"}
        }
    }

    // Get template
    const template = await ctx.kysely
        .selectFrom("EmailTemplate")
        .select(["id", "name", "subject", "html", "text"])
        .where("id", "=", templateId)
        .executeTakeFirst()

    if (!template) {
        return {error: "Plantilla no encontrada"}
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
        return {error: "No hay destinatarios"}
    }

    // Check if template uses invite_link
    const needsInviteCodes = template.html.includes("{{invite_link}}") || template.text.includes("{{invite_link}}")

    // Generate invite codes if needed
    let inviteCodes: string[] = []
    if (needsInviteCodes) {
        const codesResult = await createInviteCodes(ctx, recipientEmails.length)
        if (codesResult.error || !codesResult.data) {
            return {error: codesResult.error ?? "Error al crear códigos de invitación"}
        }
        inviteCodes = codesResult.data.inviteCodes
    }

    const transporter = getTransporter()
    const from = `${params.fromName} <${params.fromEmail}>`
    const replyTo = params.replyTo
    const results: SendEmailResult[] = []

    // Process emails in batches
    for (let i = 0; i < recipientEmails.length; i += BATCH_SIZE) {
        const batch = recipientEmails.slice(i, i + BATCH_SIZE)
        const batchCodes = needsInviteCodes ? inviteCodes.slice(i, i + BATCH_SIZE) : []

        const batchPromises = batch.map(async (email, batchIndex) => {
            try {
                // Ensure subscription exists and get ID
                const subscriptionId = await ensureSubscriptionExists(ctx, email)

                // Pre-create EmailSent record to get ID for unsubscribe link
                const emailSentId = uuidv4()

                const {unsubscribeUIUrl, unsubscribeAPIUrl} = getUnsubscribeLink(emailSentId)
                const inviteLink = needsInviteCodes ? getInviteLink(batchCodes[batchIndex]) : undefined

                // Replace template variables
                const finalHtml = replaceTemplateVariables(template.html, {
                    unsubscribe_link: unsubscribeUIUrl,
                    invite_link: inviteLink
                })
                const finalText = replaceTemplateVariables(template.text, {
                    unsubscribe_link: unsubscribeUIUrl,
                    invite_link: inviteLink
                })

                // Send email with List-Unsubscribe headers
                await transporter.sendMail({
                    from,
                    to: email,
                    subject: template.subject,
                    replyTo,
                    text: finalText,
                    html: finalHtml,
                    headers: {
                        "List-Unsubscribe": `<${unsubscribeAPIUrl}>`,
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
                        replyTo,
                        success: true
                    })
                    .execute()

                ctx.logger.pino.info({email, templateName: template.name, emailSentId}, "Email sent successfully")

                return {
                    email,
                    success: true,
                    emailSentId
                } as SendEmailResult

            } catch (error) {
                ctx.logger.pino.error({error, email, templateName: template.name}, "Error sending email")

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