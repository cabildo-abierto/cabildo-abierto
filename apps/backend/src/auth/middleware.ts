import type {NextFunction, Request, RequestHandler, Response} from "express";
import type {PublicUser} from "@cabildo-abierto/api";
import type {AppContext} from "#/setup.js";
import {clearSessionCookie, getSessionUser, readSessionToken} from "#/auth/session.js";

export type RequestAuth = {
    user: PublicUser | null;
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
    const token = readSessionToken(req);
    const user = token ? await getSessionUser(ctx, token) : null;
    if (token && !user) clearSessionCookie(res);
    return {user};
}

function sessionMiddleware(ctx: AppContext, required: boolean): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.auth = await resolveAuth(ctx, req, res);
            if (required && !req.auth.user) {
                return res.status(401).json({success: false, error: "Tenés que iniciar sesión para continuar."});
            }
            next();
        } catch (error) {
            ctx.logger.pino.error({error}, "session resolution failed");
            return res.status(500).json({success: false, error: "No pudimos comprobar la sesión."});
        }
    };
}

/** Resolves the session when present, but allows anonymous requests. */
export function withSession(ctx: AppContext): RequestHandler {
    return sessionMiddleware(ctx, false);
}

/** Rejects anonymous requests and guarantees req.auth.user for the handler. */
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
