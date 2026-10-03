import express from "express";
import {sql} from "kysely";
import type {NotificationsOutput, NotificationCountOutput} from "@cabildo-abierto/api";
import type {AppContext} from "#/setup.js";
import {requireSession, requiredUser} from "#/auth/middleware.js";

export function notificationRoutes(ctx: AppContext) {
    const router = express.Router();
    router.use("/notifications", requireSession(ctx));
    router.get("/notifications/count", async (req, res) => {
        try {
            const row = await ctx.kysely.selectFrom("notification")
                .select(sql<number>`count(*)::int`.as("count"))
                .where("recipient_id", "=", requiredUser(req).id).where("read_at", "is", null).executeTakeFirstOrThrow();
            const value: NotificationCountOutput = {unreadCount: row.count};
            return res.json({success: true, value});
        } catch (error) {
            ctx.logger.pino.error({error}, "notification count failed");
            return res.status(500).json({success: false, error: "No pudimos cargar las notificaciones."});
        }
    });
    router.get("/notifications", async (req, res) => {
        try {
            let query = ctx.kysely.selectFrom("notification")
                .innerJoin("user", "user.id", "notification.actor_id")
                .innerJoin("topic", "topic.id", "notification.topic_id")
                .select(["notification.id", "notification.kind", "notification.source_id", "notification.target_id",
                    "notification.block_number", "notification.document_block_id", "notification.created_at", "notification.read_at",
                    "user.id as actorId", "user.username", "topic.id as topicId", "topic.title", "topic.slug",
                    sql<boolean>`coalesce(
                        (select deleted from record where id = notification.target_id),
                        (select record.deleted from block_version join record on record.id = block_version.edit_id
                         where block_version.id = notification.target_id), false
                    )`.as("targetDeleted"),
                    sql<boolean>`coalesce((
                        select parent.reply_to_id <> parent.root_id
                        from comment as source
                        join comment as parent on parent.id = source.reply_to_id
                        where source.id = notification.source_id
                    ), false)`.as("replicaToReplica")])
                .where("notification.recipient_id", "=", requiredUser(req).id);
            if (req.query.cursor !== undefined) {
                if (typeof req.query.cursor !== "string") return res.status(400).json({success: false, error: "El cursor no es válido."});
                let cursor: unknown;
                try { cursor = JSON.parse(Buffer.from(req.query.cursor, "base64url").toString()); }
                catch { return res.status(400).json({success: false, error: "El cursor no es válido."}); }
                if (!Array.isArray(cursor) || cursor.length !== 2 || typeof cursor[0] !== "string" || typeof cursor[1] !== "string" || !Number.isFinite(Date.parse(cursor[0]))) {
                    return res.status(400).json({success: false, error: "El cursor no es válido."});
                }
                query = query.where(sql<boolean>`(notification.created_at, notification.id) < (${cursor[0]}::timestamptz, ${cursor[1]})`);
            }
            const [rows, count] = await Promise.all([
                query.orderBy("notification.created_at", "desc").orderBy("notification.id", "desc").limit(31).execute(),
                ctx.kysely.selectFrom("notification").select(sql<number>`count(*)::int`.as("count"))
                    .where("recipient_id", "=", requiredUser(req).id).where("read_at", "is", null).executeTakeFirstOrThrow(),
            ]);
            const page = rows.slice(0, 30);
            const last = page.at(-1);
            const value: NotificationsOutput = {
                notifications: page.map(row => ({
                    id: row.id, kind: row.kind, sourceId: row.source_id, targetId: row.target_id,
                    blockNumber: row.block_number, documentBlockId: row.document_block_id, targetDeleted: row.targetDeleted,
                    replicaToReplica: row.replicaToReplica,
                    actor: {id: row.actorId, username: row.username},
                    topic: {id: row.topicId, title: row.title, slug: row.slug},
                    createdAt: row.created_at.toISOString(), readAt: row.read_at?.toISOString() ?? null,
                })),
                nextCursor: rows.length > 30 && last ? Buffer.from(JSON.stringify([last.created_at.toISOString(), last.id])).toString("base64url") : null,
                unreadCount: count.count,
            };
            return res.json({success: true, value});
        } catch (error) {
            ctx.logger.pino.error({error}, "notification list failed");
            return res.status(500).json({success: false, error: "No pudimos cargar las notificaciones."});
        }
    });
    router.patch("/notifications/read-all", async (req, res) => {
        try {
            await ctx.kysely.updateTable("notification").set({read_at: sql`now()`})
                .where("recipient_id", "=", requiredUser(req).id)
                .where("read_at", "is", null)
                .where("created_at", "<=", sql<Date>`now()`)
                .execute();
            return res.json({success: true, value: {}});
        } catch (error) {
            ctx.logger.pino.error({error}, "notification read all failed");
            return res.status(500).json({success: false, error: "No pudimos marcar las notificaciones como leídas."});
        }
    });
    router.patch("/notifications/:id/read", async (req, res) => {
        try {
            const updated = await ctx.kysely.updateTable("notification").set({read_at: sql`coalesce(read_at, now())`})
                .where("id", "=", String(req.params.id)).where("recipient_id", "=", requiredUser(req).id)
                .returning("id").executeTakeFirst();
            if (!updated) return res.status(404).json({success: false, error: "No encontramos la notificación."});
            return res.json({success: true, value: {}});
        } catch (error) {
            ctx.logger.pino.error({error}, "notification read failed");
            return res.status(500).json({success: false, error: "No pudimos marcar la notificación como leída."});
        }
    });
    return router;
}
