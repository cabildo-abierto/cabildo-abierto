import {AppContext} from "#/setup.js";
import {contentUrl} from "@cabildo-abierto/utils";
import {EmailSender} from "#/services/emails/email-sender.js";





export async function notifyContentCreated(ctx: AppContext, uri: string){
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

    const description = "S"
    const url = contentUrl(uri)

    const vars = {
        param_1: description,
        param_2: uri,
        param_3: url
    }

    const emailSender = new EmailSender(ctx)
}