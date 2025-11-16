import {AppContext} from "#/setup.js";
import {v4 as uuidv4} from "uuid";
import nodemailer, {Transporter} from "nodemailer"
import {CAHandlerNoAuth} from "#/utils/handler.js";
import path from 'path';
import fs from "fs/promises";
import {createInviteCodes} from "#/services/user/access.js";
import jwt from 'jsonwebtoken';
import tailwindcssPresetEmail from "tailwindcss-preset-email"


// Para cada usuario que tenga mail guardado pero no tenga una suscripción, creamos la suscripción
export async function createSubscriptions(ctx: AppContext) {
    const users = await ctx.kysely
        .selectFrom("User")
        .select(["did", "User.email"])
        .leftJoin("MailingListSubscription", "MailingListSubscription.userId", "User.did")
        .where("MailingListSubscription.id", "is", null)
        .where("User.email", "is not", null)
        .execute()

    const values: ({
        email: string
        id: string
        status: "Subscribed"
        userId: string
    } | undefined)[] = users.map(u => {
        if (u.email) {
            return {
                email: u.email,
                id: uuidv4(),
                status: "Subscribed",
                userId: u.did
            }
        }
    })

    await ctx.kysely
        .insertInto("MailingListSubscription")
        .values(values.filter(x => x != null))
        .onConflict(oc => oc.column("id").doNothing())
        .onConflict(oc => oc.column("email").doNothing())
        .execute()
    ctx.logger.pino.info({count: values.length, emails: values.map(v => v?.email)}, "created email subscriptions")
}


// Creamos suscripciones para una lista de mails, sin sus usuarios
export async function createExternalSubscriptions(ctx: AppContext, emails: string[]) {
    await ctx.kysely
        .insertInto("MailingListSubscription")
        .values(emails.map(email => ({
            id: uuidv4(),
            email,
            status: "Subscribed"
        })))
        .onConflict(oc => oc.doNothing())
        .execute()
    ctx.logger.pino.info({emails}, "created email subscription")
}


export async function unsubscribe(ctx: AppContext, email: string) {
    await ctx.kysely
        .updateTable("MailingListSubscription")
        .where("email", "=", email)
        .set("status", "Unsubscribed")
        .execute()
    ctx.logger.pino.info({email}, "unsuscribed from mailing list")
}


export const unsubscribeHandler: CAHandlerNoAuth<{email: string}, {}> = async (ctx, agent, params) => {
    const email = params.email
    try {
        await unsubscribe(ctx, email)
    } catch (error) {
        ctx.logger.pino.error({email, error},"error on unsubscribe")
        return {error: "Ocurrió un error en la desuscipción."}
    }

    return {data: {}}
}


type EmailToSend = {
    text: string
    html: string
    subject: string
    email: string
    template_name: string
}


async function sendEmail(ctx: AppContext, transporter: Transporter, email: EmailToSend) {
    let success = false
    let responseInfo: any = null

    const from = "Cabildo Abierto <soporte@cabildoabierto.ar>"

    try {
        responseInfo = await transporter.sendMail({
            from,
            to: email.email,
            subject: email.subject,
            text: email.text,
            html: email.html
        })
        success = true;
        ctx.logger.pino.info({email: email.email, template: email.template_name, response: responseInfo}, "Email sent successfully");
    } catch (error) {
        ctx.logger.pino.error({error, to: email.email}, "Error sending mail")
        throw Error("Error sending mail")
    }

    const recipient = await ctx.kysely
        .selectFrom("MailingListSubscription")
        .select("id")
        .where("email", "=", email.email)
        .executeTakeFirst()

    if(recipient) {
        await ctx.kysely
            .insertInto("EmailSent")
            .values([{
                id: uuidv4(),
                recipientId: recipient.id,
                text: email.text,
                html: email.html,
                subject: email.subject,
                from,
                success,
                template_name: email.template_name
            }])
            .execute()
    }

}


function getTransporter() {
    return nodemailer.createTransport({
        host: "mail.smtp2go.com",
        port: 587,
        secure: false, // false for STARTTLS on port 587
        auth: {
            user: process.env.SMTP2GO_USER,
            pass: process.env.SMTP2GO_PASSWORD,
        },
    })
}


async function renderEmails(ctx: AppContext, template: string, locals: Record<string, any>[], emails: string[], subject: string): Promise<EmailToSend[]> {
    if(emails.length != locals.length) throw Error(`${emails.length} != ${locals.length}`)
    const templatePath = path.join(process.cwd(), `src/services/emails/templates/${template}.html`);
    const templateSource = await fs.readFile(templatePath, 'utf-8');

    const { render } = await import('@maizzle/framework')

    const renderedResults: {html: string}[] = await Promise.all(locals.map(l =>
        render(templateSource, {
            templates: {
                source: 'src/services/emails',
                root: 'src/services/emails'
            },
            css: {
                inline: true,
                purge: true,
                shorthand: true,
                tailwind: {
                    content: [
                        {
                            raw: templateSource,
                            extension: 'html'
                        }
                    ],
                    presets: [
                        tailwindcssPresetEmail
                    ]
                }
            },
            locals: l
        })
    ))

    const { generatePlaintext } = await import('@maizzle/framework')

    return await Promise.all(renderedResults.map(async (r, i) => ({
        html: r.html,
        text: await generatePlaintext(r.html),
        subject: subject,
        email: emails[i],
        template_name: template
    })))
}


function getUnsubscribeLink(subscribedAddress: string) {
    const token = jwt.sign(
        { email: subscribedAddress },
        process.env.EMAIL_TOKEN!
    )
    return `https://cabildoabierto.ar/baja?token=${token}`
}


export async function sendToSubscribersWithNoAccount(ctx: AppContext, template: string, subject: string) {
    ctx.logger.pino.info({template}, "sending email to everyone")

    const recipients = await ctx.kysely
        .selectFrom("MailingListSubscription")
        .select("email")
        .leftJoin("User", "User.did", "MailingListSubscription.userId")
        .where(eb => eb.or([
            eb("User.did", "is", null),
            eb("User.inCA", "=", false)
        ]))
        .where("status", "=", "Subscribed")
        .execute()

    const {emails, error} = await prepareEmails(
        ctx,
        recipients.map(r => r.email),
        template,
        subject,
        true
    )

    if(emails) {
        await sendEmailsBatch(
            ctx,
            emails
        )
    } else {
        ctx.logger.pino.error({error}, "error preparing emails")
    }
}


export async function sendToSubscribersWithAccount(
    ctx: AppContext,
    template: string,
    subject: string
) {
    ctx.logger.pino.info({template}, "sending email to everyone")

    const recipients = await ctx.kysely
        .selectFrom("MailingListSubscription")
        .select("email")
        .leftJoin("User", "User.did", "MailingListSubscription.userId")
        .where("User.did", "is not", null)
        .where("User.inCA", "=", true)
        .where("status", "=", "Subscribed")
        .execute()

    const {emails, error} = await prepareEmails(
        ctx,
        recipients.map(r => r.email),
        template,
        subject,
        false
    )

    if(emails) {
        await sendEmailsBatch(
            ctx,
            emails
        )
    } else {
        ctx.logger.pino.error({error}, "error preparing emails")
    }
}


async function prepareEmails(ctx: AppContext, recipients: string[], template: string, subject: string, reqCodes: boolean) {
    let codes: string[]
    if(reqCodes) {
        const res = await createInviteCodes(ctx, recipients.length)
        if(res.error || !res.data) return {error: res.error}
        codes = res.data.inviteCodes
    }

    const locals = recipients.map(((e, i) => ({
        unsubscribe_link: getUnsubscribeLink(e),
        code: codes[i]
    })))

    let emails = await renderEmails(
        ctx, template, locals, recipients, subject
    )

    return {emails}
}


async function sendEmailsBatch(
    ctx: AppContext,
    emails: EmailToSend[],
    checkNotExists: boolean = true
) {
    if(checkNotExists) {
        const existing = await ctx.kysely
            .selectFrom("EmailSent")
            .innerJoin("MailingListSubscription", "MailingListSubscription.id", "EmailSent.recipientId")
            .select(["email", "template_name"])
            .where(({eb, refTuple, tuple}) =>
                eb(
                    refTuple("email", 'template_name'),
                    'in',
                    emails
                        .map((r) => tuple(r.email, r.template_name))
                )
            ).
            execute()

        emails = emails.filter(c => {
            const exists = existing.some(e => e.email == c.email)
            if(exists) {
                ctx.logger.pino.error({c}, "An email was already sent")
                throw Error("An email was already sent")
            }
            return !exists
        })
    }

    const transporter = getTransporter()

    for(const email of emails) {
        ctx.logger.pino.info({email: email.email}, "sending email")
        await sendEmail(
            ctx,
            transporter,
            email
        )
    }
}


export async function getSubscriptionStatus(ctx: AppContext) {
    return await ctx.kysely
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
        .execute()
}


async function createSubscriptionIfNotExists(ctx: AppContext, recipient: string) {
    await ctx.kysely
        .insertInto("MailingListSubscription")
        .values([{
            email: recipient,
            id: uuidv4(),
            status: "Subscribed"
        }])
        .onConflict(oc => oc.column("id").doNothing())
        .onConflict(oc => oc.column("email").doNothing())
        .execute()
}



export async function sendSingleEmail(ctx: AppContext, recipient: string, template: string, subject: string, reqCode: boolean, checkNotExists: boolean) {
    await createSubscriptionIfNotExists(ctx, recipient)
    const {emails} = await prepareEmails(
        ctx,
        [recipient],
        template,
        subject,
        reqCode
    )
    if(emails && emails.length > 0) {
        await sendEmailsBatch(ctx, emails, checkNotExists)
    }
}