import {randomUUID} from "node:crypto";
import express, {type Router} from "express";
import type {TopicConnectionMode} from "@cabildo-abierto/api";
import type {AppContext} from "#/setup.js";
import {currentUser, withSession} from "#/auth/middleware.js";
import {readCookie} from "#/auth/session.js";

const VIEWER_COOKIE = "ca_viewer";
const VIEWER_COOKIE_DURATION_MS = 365 * 24 * 60 * 60 * 1000;
const ANONYMOUS_VIEWER_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getViewerId(req: express.Request, res: express.Response): string {
    const user = currentUser(req);
    if (user) return `user:${user.id}`;

    const existingViewerId = readCookie(req, VIEWER_COOKIE);
    const anonymousViewerId = existingViewerId && ANONYMOUS_VIEWER_PATTERN.test(existingViewerId)
        ? existingViewerId
        : randomUUID();
    if (anonymousViewerId !== existingViewerId) {
        res.cookie(VIEWER_COOKIE, anonymousViewerId, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: VIEWER_COOKIE_DURATION_MS,
        });
    }
    return `visitor:${anonymousViewerId}`;
}

export function topicConnectionRoutes(ctx: AppContext): Router {
    const router = express.Router();

    router.get("/topics/:id/connections", withSession(ctx), async (req, res) => {
        if (!ctx.topicConnections) return res.status(503).json({success: false, error: "Las conexiones en tiempo real no están disponibles."});

        const mode = req.query.mode;
        if (mode !== "reading" && mode !== "editing") {
            return res.status(400).json({success: false, error: "El modo de conexión no es válido."});
        }
        if (mode === "editing" && !currentUser(req)) {
            return res.status(401).json({success: false, error: "Tenés que iniciar sesión para editar."});
        }

        const topic = await ctx.kysely.selectFrom("topic").select("id").where("id", "=", req.params.id).executeTakeFirst();
        if (!topic) return res.status(404).json({success: false, error: "No encontramos ese tema."});
        const viewerId = getViewerId(req, res);

        res.status(200);
        res.set({
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no",
        });
        res.flushHeaders();
        res.write("retry: 2000\n\n");

        let disconnect: (() => void) | null = null;
        let closed = false;
        res.once("close", () => {
            closed = true;
            disconnect?.();
        });
        try {
            disconnect = await ctx.topicConnections.add(topic.id, viewerId, mode as TopicConnectionMode, res);
            if (closed) disconnect();
        } catch (error) {
            ctx.logger.pino.error({error, topicId: topic.id}, "could not open topic connection");
            res.end();
        }
    });

    const disconnect = async (req: express.Request, res: express.Response) => {
        if (!ctx.topicConnections) return res.status(503).json({success: false, error: "Las conexiones en tiempo real no están disponibles."});
        const topicId = req.params.id;
        const connectionId = req.params.connectionId;
        if (!topicId || !connectionId) return res.status(400).json({success: false, error: "La conexión no es válida."});
        const viewerId = getViewerId(req, res);
        await ctx.topicConnections.disconnect(connectionId, topicId, viewerId);
        return res.json({success: true});
    };
    router.delete("/topics/:id/connections/:connectionId", withSession(ctx), disconnect);
    router.post("/topics/:id/connections/:connectionId/disconnect", withSession(ctx), disconnect);

    return router;
}
