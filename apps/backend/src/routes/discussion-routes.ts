import express, {type Request, type Response} from "express";
import type {AppContext} from "#/setup.js";
import {requireSession, requiredUser} from "#/auth/middleware.js";
import {TopicActionError} from "#/services/topic-title-edits.js";
import {acceptDiscussion, cancelDiscussionReaction, deleteDiscussionComment, discussionComments, mutateDiscussion, publishDiscussionComment, type DiscussionTarget} from "#/services/discussions.js";
import {notifyTopicChanged} from "#/services/topic-connections.js";

export function discussionRoutes(ctx: AppContext) {
    const router = express.Router();
    const blockPath = "/topics/:id/blocks/:blockNumber";
    const titlePath = "/topics/:topicId/title-edits/:id";
    const fail = (res: Response, error: unknown) => {
        if (error instanceof TopicActionError) return res.status(error.status).json({success: false, error: error.message});
        ctx.logger.pino.error({error}, "discussion action failed");
        return res.status(500).json({success: false, error: "No pudimos completar la acción."});
    };
    const resolve = async (req: Request, kind: "edit" | "title"): Promise<DiscussionTarget> => {
        if (kind === "title") {
            const edit = await ctx.kysely.selectFrom("edit").select(["id", "topic_id"]).where("id", "=", String(req.params.id)).where("topic_id", "=", String(req.params.topicId)).where("title", "is not", null).executeTakeFirst();
            if (!edit) throw new TopicActionError(404, "No encontramos esa edición de título.");
            return {id: edit.id, rootId: edit.id, topicId: edit.topic_id, blockNumber: null, kind};
        }
        let versionId: unknown = req.params.versionId ?? req.body?.blockVersionId;
        if (req.params.commentId) {
            const comment = await ctx.kysely.selectFrom("comment").innerJoin("block_version", join => join
                .onRef("block_version.edit_id", "=", "comment.edit_id").onRef("block_version.topic_id", "=", "comment.topic_id")
                .onRef("block_version.block_number", "=", "comment.block_number"))
                .select("block_version.id").where("comment.id", "=", String(req.params.commentId))
                .where("comment.topic_id", "=", String(req.params.id)).where("comment.block_number", "=", String((req.params as Record<string, string>).blockNumber)).executeTakeFirst();
            versionId = comment?.id;
        }
        if (typeof versionId !== "string") throw new TopicActionError(400, "La versión no es válida.");
        const version = await ctx.kysely.selectFrom("block_version").select(["id", "edit_id", "topic_id", "block_number"])
            .where("id", "=", versionId).where("topic_id", "=", String(req.params.id)).where("block_number", "=", String((req.params as Record<string, string>).blockNumber)).executeTakeFirst();
        if (!version) throw new TopicActionError(404, "No encontramos esa versión del bloque.");
        return {id: version.id, rootId: version.edit_id, topicId: version.topic_id, blockNumber: version.block_number, kind};
    };
    for (const kind of ["edit", "title"] as const) {
        const base = kind === "edit" ? blockPath : titlePath;
        const reactionsPath = kind === "edit" ? `${base}/versions/:versionId/reactions` : `${base}/reactions`;
        const notify = (target: DiscussionTarget, source: "vote" | "comment") => notifyTopicChanged(ctx.kysely, target.topicId, kind === "title" ? "title" : source, ctx.logger);
        router.get(`${base}/comments`, async (req, res) => {
            try {
                let topicId: string;
                let scope: {blockNumber: string} | {rootId: string};
                if (kind === "title") {
                    const target = await resolve(req, kind);
                    topicId = target.topicId;
                    scope = {rootId: target.rootId};
                } else {
                    topicId = String(req.params.id);
                    scope = {blockNumber: String((req.params as Record<string, string>).blockNumber)};
                    const block = await ctx.kysely.selectFrom("block").select("block_number").where("topic_id", "=", topicId).where("block_number", "=", scope.blockNumber).executeTakeFirst();
                    if (!block) throw new TopicActionError(404, "No encontramos ese bloque.");
                }
                const comments = await discussionComments(ctx.kysely, topicId, scope);
                return res.json({success: true, value: {comments: kind === "title" ? comments.map(({blockVersionId: _version, ...comment}) => comment) : comments}});
            } catch (error) { return fail(res, error); }
        });
        router.post(`${base}/comments`, requireSession(ctx), async (req, res) => {
            try {
                const target = await resolve(req, kind);
                const comment = await mutateDiscussion(ctx.kysely, target, (trx, author) => publishDiscussionComment(trx, target, requiredUser(req), author, req.body ?? {}));
                await notify(target, req.body?.reject || req.body?.replica ? "vote" : "comment");
                const {blockVersionId: _version, ...titleComment} = comment;
                return res.status(201).json({success: true, value: {comment: kind === "title" ? titleComment : comment}});
            } catch (error) { return fail(res, error); }
        });
        router.delete(`${base}/comments/:commentId`, requireSession(ctx), async (req, res) => {
            try {
                const target = await resolve(req, kind);
                await mutateDiscussion(ctx.kysely, target, trx => deleteDiscussionComment(trx, target, String(req.params.commentId), requiredUser(req).id));
                await notify(target, "vote");
                return res.json({success: true});
            } catch (error) { return fail(res, error); }
        });
        router.post(reactionsPath, requireSession(ctx), async (req, res) => {
            try {
                if (req.body?.type !== "accept") throw new TopicActionError(400, "La reacción no es válida.");
                const target = await resolve(req, kind);
                await mutateDiscussion(ctx.kysely, target, (trx, author) => acceptDiscussion(trx, target, requiredUser(req).id, author, req.body?.deleteReason));
                await notify(target, "vote");
                return res.status(201).json({success: true});
            } catch (error) { return fail(res, error); }
        });
        router.delete(reactionsPath, requireSession(ctx), async (req, res) => {
            try {
                const target = await resolve(req, kind);
                await mutateDiscussion(ctx.kysely, target, trx => cancelDiscussionReaction(trx, target, requiredUser(req).id, req.body?.deleteReason === true));
                await notify(target, "vote");
                return res.json({success: true});
            } catch (error) { return fail(res, error); }
        });
    }
    return router;
}
