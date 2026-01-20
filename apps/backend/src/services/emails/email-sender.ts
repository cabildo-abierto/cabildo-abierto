import nodemailer from "nodemailer";
import {AppContext} from "#/setup.js";


export type MailData = {
    emailId: string
    subscriptionId: string
    templateId: string
    subject: string
    template: {
        html: string
        text: string
    }
    vars: {
        [key: string]: string
    } | null
    from: string
    to: string
    replyTo: string | null
    unsubscribe: boolean
}


export class EmailSender {
    transporter: nodemailer.Transporter
    ctx: AppContext


    constructor(ctx: AppContext) {
        this.ctx = ctx
        this.transporter = this.getTransporter()
    }

    getTransporter() {
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

    getUnsubscribeLink(emailSentId: string) {
        return {
            unsubscribeUIUrl: `https://cabildoabierto.ar/desuscripcion/${emailSentId}`,
            unsubscribeAPIUrl: `https://cabildoabierto.ar/desuscripcion/${emailSentId}`
        }
    }

    async sendMail(mail: MailData) {
        const {unsubscribeAPIUrl} = this.getUnsubscribeLink(mail.emailId)

        const html = this.replaceTemplateVars(mail.template.html, mail.vars ?? {})
        const text = this.replaceTemplateVars(mail.template.text, mail.vars ?? {})

        await this.transporter.sendMail({
            from: mail.from,
            to: mail.to,
            subject: mail.subject,
            html,
            text,
            headers: mail.unsubscribe ? {
                "List-Unsubscribe": `<${unsubscribeAPIUrl}>`,
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"
            } : undefined
        })

        await this.ctx.kysely
            .insertInto("EmailSent")
            .values({
                id: mail.emailId,
                recipientId: mail.subscriptionId,
                templateId: mail.templateId,
                subject: mail.subject,
                html,
                text,
                from: mail.from,
                replyTo: mail.replyTo,
                success: true
            })
            .execute()
    }

    replaceTemplateVars(template: string, vars: {[key: string]: string}) {
        return Object.entries(vars).reduce((acc, [key, value]) => {
            return acc.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
        }, template)
    }
}