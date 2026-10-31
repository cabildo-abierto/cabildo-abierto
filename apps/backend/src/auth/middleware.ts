import type {NextFunction, Request, RequestHandler, Response} from "express";
import type {PublicUser} from "@cabildo-abierto/api";
import type {AppContext} from "#/setup.js";
import {clearSessionCookie, getSessionUser, readSessionToken} from "#/auth/session.js";

import {getApiTokenUser} from './api-tokens.js';

export type RequestAuth = {
    user: PublicUser | null;
    source: 'session' | 'apiToken' | null;
};

declare global {
    namespace Express {
        interface Request {
            auth: RequestAuth;
        }
    }
}

async function resolveAuth(ctx: AppContext, req: Request, res: Response): Promise<RequestAuth> {
    if (req.auth) return req.auth;
    if (req.headers.authorization !== undefined) {
        const match = /^Bearer\s+(ca_[A-Za-z0-9_-]{43})$/i.exec(req.headers.authorization.trim());
        const user = match ? await getApiTokenUser(ctx.kysely, match[1]) : null;
        return {user, source: 'apiToken'};
    }
    const token = readSessionToken(req);
    const user = token ? await getSessionUser(ctx, token) : null;
    if (token && !user) clearSessionCookie(res);
    return {user, source: user ? 'session' : null};
}

function sessionMiddleware(ctx: AppContext, required: boolean, browserOnly = false): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.auth = await resolveAuth(ctx, req, res);
            if (req.auth.source === 'apiToken' && !req.auth.user) {
                res.setHeader('WWW-Authenticate', 'Bearer');
                return res.status(401).json({success: false, error: 'El token de API no es válido o venció.'});
            }
            if (required && !req.auth.user) {
                return res.status(401).json({success: false, error: "Tenés que iniciar sesión para continuar."});
            }
            if (browserOnly && req.auth.source === 'apiToken') {
                return res.status(403).json({success: false, error: 'Esta operación requiere iniciar sesión en el sitio.'});
            }
            next();
        } catch (error) {
            ctx.logger.pino.error({error}, "session resolution failed");
            return res.status(500).json({success: false, error: "No pudimos comprobar la sesión."});
        }
    };
}

/** Accepts a browser session or API token; anonymous requests are allowed. */
export function withSession(ctx: AppContext): RequestHandler {
    return sessionMiddleware(ctx, false);
}

/** Requires a browser session or API token and guarantees req.auth.user. */
export function requireSession(ctx: AppContext): RequestHandler {
    return sessionMiddleware(ctx, true);
}

export function currentUser(req: Request): PublicUser | null {
    return req.auth.user;
}

export function requiredUser(req: Request): PublicUser {
    if (!req.auth.user) throw new Error("requiredUser called without requireSession");
    return req.auth.user;
}

export function requireBrowserSession(ctx: AppContext): RequestHandler {
    return sessionMiddleware(ctx, true, true);
}

/** Resolves the browser session, allows visitors and rejects API tokens. */
export function withBrowserSession(ctx: AppContext): RequestHandler {
    return sessionMiddleware(ctx, false, true);
}
