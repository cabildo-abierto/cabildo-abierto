import {AppContext} from "#/setup.js";
import {contentUrl, getCollectionFromUri, splitUri} from "@cabildo-abierto/utils";
import {EmailSender} from "#/services/emails/email-sender.js";
import {v4 as uuidv4} from "uuid";
import {env} from "#/lib/env.js";


export async function notifyContentCreated(ctx: AppContext, uri: string, context: string){
    if(env.NODE_ENV == "test") return

    // Objetivo: Mandar un mail a moderacion@cabildoabierto.ar
    const template = await ctx.kysely
        .selectFrom("EmailTemplate")
        .where("name", "=", "moderación-contenido-nuevo")
        .select([
            "id",
            "html",
            "text"
        ])
        .executeTakeFirst()
    if(!template) {
        ctx.logger.pino.error("Error: no se encontró el template: moderacion-contenido-nuevo")
        throw Error("Template not found for content creation notification.")
    }

    let subject: string
    let url: string
    const collection = getCollectionFromUri(uri)
    if(collection == "app.bsky.feed.post") {
        subject = "Nuevo post | Cabildo Abierto"
        url = `https://cabildoabierto.ar/${contentUrl(uri)}`
    } else if(collection == "ar.cabildoabierto.feed.article") {
        subject = "Nuevo artículo | Cabildo Abierto"
        url = `https://cabildoabierto.ar/${contentUrl(uri)}`
    } else if(collection == "ar.cabildoabierto.wiki.topicVersion") {
        subject = "Nueva edición de tema | Cabildo Abierto"
        const {did, rkey} = splitUri(uri)
        url = `https://cabildoabierto.ar/tema?did=${did}&rkey=${rkey}`
    } else {
        ctx.logger.pino.error({collection}, "unknown collection for notification")
        throw Error(`Unknown collection for content creation notification: ${collection}.`)
    }

    const vars = {
        param_1: context,
        param_2: uri,
        param_3: url
    }

    const emailSender = new EmailSender(ctx)

    await emailSender.sendMail({
        from: "alertas@cabildoabierto.ar",
        to: "moderacion@cabildoabierto.ar",
        template,
        emailId: uuidv4(),
        vars,
        subject,
        unsubscribe: false,
        replyTo: null
    })
}