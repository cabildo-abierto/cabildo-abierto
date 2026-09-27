import {lockSearchTopic} from "#/services/search/schema.js";
import {synchronizeTopicSearch} from "#/services/search/index.js";
import {randomUUID} from "node:crypto";
import express, {type Response} from "express";
import {sql} from "kysely";
import type {AppContext} from "#/setup.js";
import {currentUser, requiredUser, requireSession, withSession} from "#/auth/middleware.js";
import {canonicalizeTopicId} from "#/topics/canonicalize-topic-id.js";
import {TopicActionError, lockTopicTitleEdits, convergeTopicName, topicTitleEditViews, initialTitleEdit} from "#/services/topic-title-edits.js";
import {notifyTopicChanged} from "#/services/topic-connections.js";
import {resolveTopic} from '#/services/resolve-topic.js';

export function topicTitleEditRoutes(ctx: AppContext) {
    const router = express.Router();
    const fail = (res: Response, error: unknown) => {
        if (error instanceof TopicActionError) return res.status(error.status).json({success: false, error: error.message});
        if (typeof error === "object" && error && "code" in error && error.code === "23505") {
            return res.status(409).json({success: false, error: "Ese nombre o URL ya pertenece a otro tema."});
        }
        ctx.logger.pino.error({error}, "title edit failed");
        return res.status(500).json({success: false, error: "No pudimos completar la operación del cambio de título."});
    };
    router.get("/topics/resolve/:slug", async (req, res) => {
        try {
            const topic = await resolveTopic(ctx.kysely,String(req.params.slug));
            return res.json({success: true, value: {topic}});
        } catch (error) { return fail(res, error); }
    });
    router.get("/topics/:topicId/title-edits", withSession(ctx), async (req, res) => {
        try {
            let query = ctx.kysely.selectFrom("edit").innerJoin("record", "record.id", "edit.id")
                .select(["edit.id", sql<string>`record.created_at::text`.as("cursorDate")]).where("record.deleted", "=", false);
            query = query.where("edit.topic_id", "=", String(req.params.topicId)).where("edit.title", "is not", null);
            if (req.query.cursor !== undefined) {
                if (typeof req.query.cursor !== "string") throw new TopicActionError(400, "El cursor no es válido.");
                let cursor: unknown;
                try { cursor = JSON.parse(Buffer.from(req.query.cursor, "base64url").toString()); } catch { throw new TopicActionError(400, "El cursor no es válido."); }
                if (!Array.isArray(cursor) || cursor.length !== 2 || typeof cursor[0] !== "string" || typeof cursor[1] !== "string" || !Number.isFinite(Date.parse(cursor[0]))) throw new TopicActionError(400, "El cursor no es válido.");
                query = query.where(sql<boolean>`(record.created_at, record.id) < (${cursor[0]}::timestamptz, ${cursor[1]})`);
            }
            const rows = await query.orderBy("record.created_at", "desc").orderBy("record.id", "desc").limit(31).execute();
            const page = rows.slice(0, 30);
            const last = page.at(-1);
            const nextCursor = rows.length > 30 && last ? Buffer.from(JSON.stringify([last.cursorDate, last.id])).toString("base64url") : null;
            return res.json({success: true, value: {edits: await topicTitleEditViews(ctx.kysely, page.map(row => row.id), currentUser(req)?.id), nextCursor}});
        } catch (error) { return fail(res, error); }
    });
    router.get("/topics/:topicId/title-edits/:id", withSession(ctx), async (req, res) => {
        try {
            const exists = await ctx.kysely.selectFrom("edit").select("id").where("id", "=", req.params.id).where("topic_id", "=", req.params.topicId).where("title", "is not", null).executeTakeFirst();
            if (!exists) throw new TopicActionError(404, "No encontramos ese cambio de título.");
            const [edit] = await topicTitleEditViews(ctx.kysely, [exists.id], currentUser(req)?.id);
            return res.json({success: true, value: {edit: edit}});
        } catch (error) { return fail(res, error); }
    });
    router.post("/topics/:id/edits", requireSession(ctx), async (req, res, next) => {
        if (req.body?.title === undefined) return next();
        try {
            if (req.body.blocks !== undefined || req.body.baseBlocks !== undefined) throw new TopicActionError(400, "Una edición de título no puede modificar bloques.");
            const {title: rawTitle, message: rawMessage} = req.body ?? {};
            const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
            const message = typeof rawMessage === "string" ? rawMessage.trim() : "";
            const slug = canonicalizeTopicId(title);
            if (title.length < 3 || title.length > 120 || !slug || !message || message.length > 500) throw new TopicActionError(400, "Ingresá un título de 3 a 120 caracteres y un motivo de hasta 500 caracteres.");
            const topicId = String(req.params.id);
            const user = requiredUser(req);
            const id = randomUUID();
            await ctx.kysely.transaction().execute(async trx => {
                await lockSearchTopic(trx, topicId);
                await lockTopicTitleEdits(trx, topicId);
                const topic = await trx.selectFrom("topic").selectAll().where("id", "=", topicId).executeTakeFirst();
                if (!topic) throw new TopicActionError(404, "No encontramos ese tema.");
                if (topic.title === title && topic.slug === slug) throw new TopicActionError(400, "El tema ya tiene ese nombre.");
                const alias = await trx.selectFrom("topic_redirect").select("topic_id").where("slug", "=", slug).executeTakeFirst();
                if (alias && alias.topic_id !== topicId) throw new TopicActionError(409, "Esa URL pertenece a otro tema, aunque haya cambiado de nombre.");
                await trx.insertInto("record").values({id, type_id: "edit", author_id: user.id}).execute();
                await trx.insertInto("edit").values({id, topic_id: topicId, title, message}).execute();
                if (!alias) await trx.insertInto("topic_redirect").values({slug, topic_id: topicId, edit_id: id}).execute();
                await convergeTopicName(trx, topicId);
                await synchronizeTopicSearch(trx, topicId);
            });
            await notifyTopicChanged(ctx.kysely, topicId, "title", ctx.logger);
            const [edit] = await topicTitleEditViews(ctx.kysely, [id], user.id);
            return res.status(201).json({success: true, value: {edit: edit}});
        } catch (error) { return fail(res, error); }
    });
    router.delete("/topics/:topicId/title-edits/:id", requireSession(ctx), async (req, res) => {
        try {
            const edit = await ctx.kysely.selectFrom("edit").select(["id", "topic_id"]).where("id", "=", req.params.id).where("topic_id", "=", req.params.topicId).where("title", "is not", null).executeTakeFirst();
            if (!edit) throw new TopicActionError(404, "No encontramos ese cambio de título.");
            await ctx.kysely.transaction().execute(async trx => {
                await lockSearchTopic(trx, edit.topic_id);
                await lockTopicTitleEdits(trx, edit.topic_id);
                if (await initialTitleEdit(trx, edit.topic_id) === edit.id) throw new TopicActionError(403, "No se puede eliminar el título inicial.");
                const record = await trx.selectFrom("record").selectAll().where("id", "=", edit.id).executeTakeFirstOrThrow();
                if (record.author_id !== requiredUser(req).id) throw new TopicActionError(403, "Solo el autor puede eliminar este cambio de título.");
                await trx.updateTable("record").set({deleted: true}).where("id", "=", edit.id).execute();
                await convergeTopicName(trx, edit.topic_id);
                await synchronizeTopicSearch(trx, edit.topic_id);
            });
            await notifyTopicChanged(ctx.kysely, edit.topic_id, "title", ctx.logger);
            return res.json({success: true});
        } catch (error) { return fail(res, error); }
    });
    return router;
}
