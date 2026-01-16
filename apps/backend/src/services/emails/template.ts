import {CAHandler} from "#/utils/handler.js";
import {EmailTemplate, EmailTemplatesResponse} from "@cabildo-abierto/api";
import {v4 as uuidv4} from "uuid";

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
    const {name, subject, html, text} = params

    if (!name || !subject || !html || !text) {
        return {error: "Todos los campos son requeridos"}
    }

    // Check if name already exists
    const existing = await ctx.kysely
        .selectFrom("EmailTemplate")
        .select("id")
        .where("name", "=", name)
        .executeTakeFirst()

    if (existing) {
        return {error: "Ya existe una plantilla con ese nombre"}
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
    const {params: {id}, name, subject, html, text} = params

    // Check if template exists
    const existing = await ctx.kysely
        .selectFrom("EmailTemplate")
        .select("id")
        .where("id", "=", id)
        .executeTakeFirst()

    if (!existing) {
        return {error: "Plantilla no encontrada"}
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
            return {error: "Ya existe una plantilla con ese nombre"}
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
    const {params: {id}} = params

    // Check if template exists
    const existing = await ctx.kysely
        .selectFrom("EmailTemplate")
        .select("id")
        .where("id", "=", id)
        .executeTakeFirst()

    if (!existing) {
        return {error: "Plantilla no encontrada"}
    }

    // Check if template is used by any sent emails
    const usedByEmails = await ctx.kysely
        .selectFrom("EmailSent")
        .select("id")
        .where("templateId", "=", id)
        .executeTakeFirst()

    if (usedByEmails) {
        return {error: "No se puede eliminar una plantilla que ha sido usada para enviar emails"}
    }

    await ctx.kysely
        .deleteFrom("EmailTemplate")
        .where("id", "=", id)
        .execute()

    return {data: {}}
}