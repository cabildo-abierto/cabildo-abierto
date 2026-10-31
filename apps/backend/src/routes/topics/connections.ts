import {requireTopicAccess} from '#/services/topic-access.js';
import {TopicActionError} from '#/services/topic-title-edits.js';
import {createApiRouter} from '../../openapi/router.js';
import express, {type Router} from "express";
import type {AppContext} from "#/setup.js";
import {currentUser, withSession} from "#/auth/middleware.js";
import {getViewerId} from '#/auth/viewer.js';

function startEventStream(res: {
    setHeader(name: string, value: string): unknown;
    flushHeaders(): unknown;
    write(chunk: string): unknown;
}) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();
    res.write('retry: 2000\n\n');
}

export function topicConnectionRoutes(ctx: AppContext): Router {
    const router = express.Router();
    const api = createApiRouter(router);

    api.get('/topics/events', withSession(ctx), async (req, res) => {
        if (!ctx.topicConnections) return res.status(503).json({success: false, error: 'Las conexiones en tiempo real no están disponibles.'});
        const ids = [...new Set(req.query.ids.split(','))];
        const mode = req.query.mode;
        try { await Promise.all(ids.map(id => requireTopicAccess(ctx.kysely, id))); }
        catch (error) {
            if (error instanceof TopicActionError) return res.status(error.status).json({success: false, error: error.message});
            throw error;
        }
        if (mode && ids.length !== 1) {
            return res.status(400).json({success: false, error: 'Para registrar presencia, indicá un único tema.'});
        }
        if (!mode) {
            startEventStream(res);
            const unsubscribe = ctx.topicConnections.watch(ids, res, currentUser(req)?.id ?? null);
            res.once('close', unsubscribe);
            return;
        }
        if (mode === 'editing' && !currentUser(req)) {
            return res.status(401).json({success: false, error: 'Tenés que iniciar sesión para editar.'});
        }

        const topic = await ctx.kysely.selectFrom("topic").select("id").where("id", "=", ids[0]).executeTakeFirst();
        if (!topic) return res.status(404).json({success: false, error: "No encontramos ese tema."});
        const viewerId = getViewerId(req);

        res.status(200);
        startEventStream(res);

        let disconnect: (() => void) | null = null;
        let closed = false;
        res.once("close", () => {
            closed = true;
            disconnect?.();
        });
        try {
            disconnect = await ctx.topicConnections.add(topic.id, viewerId, mode, res);
            if (closed) disconnect();
        } catch (error) {
            ctx.logger.pino.error({error, topicId: topic.id}, "could not open topic connection");
            res.end();
        }
    });

    api.post("/topics/:id/connections/:connectionId/disconnect", withSession(ctx), async (req, res) => {
        if (!ctx.topicConnections) return res.status(503).json({success: false, error: "Las conexiones en tiempo real no están disponibles."});
        const topicId = req.params.id;
        const connectionId = req.params.connectionId;
        if (typeof topicId !== 'string' || !topicId || typeof connectionId !== 'string' || !connectionId) {
            return res.status(400).json({success: false, error: "La conexión no es válida."});
        }
        const viewerId = getViewerId(req);
        await ctx.topicConnections.disconnect(connectionId, topicId, viewerId);
        return res.json({success: true});
    });

    return router;
}
