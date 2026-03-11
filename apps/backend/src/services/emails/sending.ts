import {EffHandler} from "#/utils/handler.js";
import {SendEmailResult, SendEmailsParams, SendEmailsResponse} from "@cabildo-abierto/api";
import {createInviteCodes} from "#/services/user/access.js";
import {v4 as uuidv4} from "uuid";
import {EmailSender} from "#/services/emails/email-sender.js";
import {getSubscriberEmailsNotReceivedTemplate} from "#/services/emails/subscriptions.js";
import {Effect} from "effect";
import {DBSelectError} from "#/utils/errors.js";


function getInviteLink(code: string) {
    return `https://cabildoabierto.ar/login?c=${code}`
}

const BATCH_SIZE = 10
const BATCH_DELAY_MS = 1000

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}


export class SendEmailError {
    readonly _tag = "SendEmailError"
    name: string | undefined
    message: string | undefined
    constructor(error?: unknown) {
        if(error && error instanceof Error) {
            this.name = error?.name
            this.message = error?.message
        }
    }
}

export const sendBulkEmails: EffHandler<SendEmailsParams, SendEmailsResponse> = (
    ctx, agent, params) => Effect.gen(function* () {
    const {templateId, target, emails: inputEmails} = params

    // Validate inputs
    if (!templateId) {
        return yield* Effect.fail("Se requiere un template")
    }

    if (target === "single" || target === "list") {
        if (!inputEmails || inputEmails.length === 0) {
            return yield* Effect.fail("Se requiere al menos un email")
        }
    }

    // Get template
    const template = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("EmailTemplate")
            .select(["id", "name", "subject", "html", "text"])
            .where("id", "=", templateId)
            .executeTakeFirst(),
        catch: (error) => new DBSelectError(error)
    })

    if (!template) {
        return yield* Effect.fail("Plantilla no encontrada")
    }

    // Get recipient emails based on target
    let recipientEmails: string[]

    if (target === "all_subscribers") {
        const subscribers = yield* Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("MailingListSubscription")
                .select("email")
                .where("status", "=", "Subscribed")
                .execute(),
            catch: (error) => new DBSelectError(error)
        })
        recipientEmails = subscribers.map(s => s.email)
    } else if (target === "not_received_template") {
        recipientEmails = yield* Effect.tryPromise({
            try: () => getSubscriberEmailsNotReceivedTemplate(ctx, templateId),
            catch: (error) => new DBSelectError(error)
        })
    } else {
        recipientEmails = inputEmails!
    }

    if (recipientEmails.length === 0) {
        return yield* Effect.fail("No hay destinatarios")
    }

    // Check if template uses invite_link
    const needsInviteCodes = template.html.includes("{{invite_link}}") || template.text.includes("{{invite_link}}")

    // Generate invite codes if needed
    let inviteCodes: string[] = []
    if (needsInviteCodes) {
        inviteCodes = yield* createInviteCodes(
            ctx,
            agent,
            recipientEmails.length
        ).pipe(
            Effect.catchAll(() => Effect.fail("Error al crear los códigos de invitación."))
        )
    }

    const emailSender = new EmailSender(ctx)
    const from = `${params.fromName} <${params.fromEmail}>`
    const replyTo = params.replyTo
    const results: SendEmailResult[] = []

    // Process emails in batches
    for (let i = 0; i < recipientEmails.length; i += BATCH_SIZE) {
        const batch = recipientEmails.slice(i, i + BATCH_SIZE)
        const batchCodes = needsInviteCodes ? inviteCodes.slice(i, i + BATCH_SIZE) : []

        const batchResults = yield* Effect.all(batch.map((email, batchIndex) => Effect.gen(function* () {
            const emailSentId = uuidv4()

            const invite_link = needsInviteCodes ? getInviteLink(batchCodes[batchIndex]) : undefined

            const vars: { [key: string]: string } = {
                unsubscribe_link: emailSender.getUnsubscribeLink(emailSentId).unsubscribeUIUrl
            }
            if (invite_link) vars.invite_link = invite_link

            // Send email with List-Unsubscribe headers
            yield* Effect.tryPromise({
                try: () => emailSender.sendMail({
                    from,
                    to: email,
                    emailId: emailSentId,
                    subject: template.subject,
                    replyTo: replyTo ?? null,
                    template,
                    vars,
                    unsubscribe: true
                }),
                catch: (error) => new SendEmailError()
            })

            ctx.logger.pino.info({email, templateName: template.name, emailSentId}, "Email sent successfully")

            return {
                email,
                success: true,
                emailSentId
            } as SendEmailResult
        })))

        results.push(...batchResults)

        // Add delay between batches (except for last batch)
        if (i + BATCH_SIZE < recipientEmails.length) {
            yield* Effect.tryPromise({
                try: () => delay(BATCH_DELAY_MS),
                catch: () => "Ocurrió un error al esperar entre batches."
            })
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
        results,
        totalSent,
        totalFailed
    }
}).pipe(
    Effect.catchTag("SendEmailError", () => Effect.fail("Ocurrió un error al enviar uno de los correos.")),
    Effect.catchTag("DBSelectError", () => Effect.fail("Ocurrió un error al enviar los correos."))
)