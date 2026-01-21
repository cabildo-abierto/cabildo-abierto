import {AppContext} from "#/setup.js";
import {contentUrl, getCollectionFromUri} from "@cabildo-abierto/utils";
import {EmailSender} from "#/services/emails/email-sender.js";
import {v4 as uuidv4} from "uuid";


export async function notifyContentCreated(ctx: AppContext, uri: string, context: string){
    // Objetivo: Mandar un mail a moderacion@cabildoabierto.ar
    const template = await ctx.kysely
        .selectFrom("EmailTemplate")
        .where("name", "=", "moderacion-contenido-nuevo")
        .select([
            "id",
            "html",
            "text"
        ])
        .executeTakeFirst()
    if(!template) {
        throw Error("Template not found for content creation notification.")
    }

    let subject: string
    const collection = getCollectionFromUri(uri)
    if(collection == "app.bsky.feed.post") {
        subject = "Nuevo post | Cabildo Abierto"
    } else if(collection == "ar.cabildoabierto.feed.article") {
        subject = "Nuevo artículo | Cabildo Abierto"
    } else if(collection == "ar.cabildoabierto.wiki.topicVersion") {
        subject = "Nueva edición de tema | Cabildo Abierto"
    } else {
        throw Error(`Unknown collection for content creation notification: ${collection}.`)
    }


    const url = contentUrl(uri)

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