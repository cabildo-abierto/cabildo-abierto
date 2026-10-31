import {createApiToken, listApiTokens, revokeApiToken} from '#/auth/api-tokens.js';
import type {ErrorResponder} from '../openapi/handler.js';
import {createApiRouter} from '../openapi/router.js';
import {randomUUID} from "node:crypto";
import express, {type Router} from "express";
import type {AuthOutput, PublicUser, SessionOutput} from "@cabildo-abierto/api";
import type {AppContext} from "#/setup.js";
import {hashPassword, verifyPassword} from "#/auth/password.js";
import {
    clearSessionCookie,
    createSession,
    readSessionToken,
    revokeSession,
    setSessionCookie,
} from "#/auth/session.js";
import {currentUser, requiredUser, requireBrowserSession, requireSession, withBrowserSession} from "#/auth/middleware.js";

const USERNAME_PATTERN = /^[a-z0-9_-]{3,30}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DUMMY_PASSWORD_HASH = hashPassword(randomUUID());

type DatabaseError = {code?: string; constraint?: string};

function getDatabaseError(error: unknown): DatabaseError {
    if (!error || typeof error !== "object") return {};
    const value = error as Record<string, unknown>;
    return {
        code: typeof value.code === "string" ? value.code : undefined,
        constraint: typeof value.constraint === "string" ? value.constraint : undefined,
    };
}

function publicUser(user: {id: string; username: string}): PublicUser {
    return {id: user.id, username: user.username};
}

export const authRoutes = (ctx: AppContext): Router => {
    const router = express.Router();
    const api = createApiRouter(router);

    const tokenFailure = (res: ErrorResponder, error: unknown) => {
        ctx.logger.pino.error({error: error instanceof Error ? error.message : 'Unknown error'}, 'API token operation failed');
        return res.status(500).json({success: false, error: 'No pudimos completar la operación del token.'});
    };
    router.use('/auth', (_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
    api.get('/auth/tokens', requireBrowserSession(ctx), async (req, res) => {
        try { return res.json({success: true, value: await listApiTokens(ctx.kysely, requiredUser(req).id)}); }
        catch (error) { return tokenFailure(res, error); }
    });
    api.post('/auth/tokens', requireBrowserSession(ctx), async (req, res) => {
        if (!req.body.name.trim()) return res.status(400).json({success: false, error: 'Ingresá un nombre para el token.'});
        try { return res.status(201).json({success: true, value: await createApiToken(ctx.kysely, requiredUser(req).id, req.body)}); }
        catch (error) { return tokenFailure(res, error); }
    });
    api.delete('/auth/tokens/:id', requireBrowserSession(ctx), async (req, res) => {
        try {
            if (!await revokeApiToken(ctx.kysely, requiredUser(req).id, req.params.id)) return res.status(404).json({success: false, error: 'No encontramos ese token.'});
            return res.json({success: true, value: {}});
        } catch (error) { return tokenFailure(res, error); }
    });

    api.post("/auth/register", async (req, res) => {
        const input = req.body;
        const username = typeof input.username === "string" ? input.username.trim().toLowerCase() : "";
        const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
        const password = typeof input.password === "string" ? input.password : "";

        if (!USERNAME_PATTERN.test(username)) {
            return res.status(400).json({success: false, error: "El usuario debe tener entre 3 y 30 caracteres y usar solo letras, números, guiones o guiones bajos."});
        }
        if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
            return res.status(400).json({success: false, error: "Ingresá un correo electrónico válido."});
        }
        if (password.length < 8 || password.length > 128) {
            return res.status(400).json({success: false, error: "La contraseña debe tener entre 8 y 128 caracteres."});
        }

        try {
            const existing = await ctx.kysely
                .selectFrom("user")
                .select(["username", "email"])
                .where(eb => eb.or([eb("username", "=", username), eb("email", "=", email)]))
                .executeTakeFirst();

            if (existing?.username === username) {
                return res.status(409).json({success: false, error: "Ese nombre de usuario ya está en uso."});
            }
            if (existing) {
                return res.status(409).json({success: false, error: "Ese correo electrónico ya está registrado."});
            }

            const passwordHash = await hashPassword(password);
            const {user, token} = await ctx.kysely.transaction().execute(async trx => {
                const created = await trx.insertInto("user").values({
                    id: randomUUID(),
                    username,
                    email,
                    password_hash: passwordHash,
                }).returning(["id", "username"]).executeTakeFirstOrThrow();

                return {user: created, token: await createSession(trx, created.id)};
            });
            setSessionCookie(res, token);
            const value: AuthOutput = {user: publicUser(user)};
            return res.status(201).json({success: true, value});
        } catch (error) {
            const {code, constraint} = getDatabaseError(error);
            if (code === "23505") {
                const message = constraint?.includes("username")
                    ? "Ese nombre de usuario ya está en uso."
                    : constraint?.includes("email")
                        ? "Ese correo electrónico ya está registrado."
                        : "El usuario o correo electrónico ya está registrado.";
                return res.status(409).json({success: false, error: message});
            }
            ctx.logger.pino.error({error, databaseCode: code, databaseConstraint: constraint}, "registration failed");
            return res.status(500).json({success: false, error: "No pudimos crear tu cuenta. Intentá nuevamente más tarde."});
        }
    });

    api.post("/auth/login", async (req, res) => {
        const input = req.body;
        const identifier = typeof input.identifier === "string" ? input.identifier.trim().toLowerCase() : "";
        const password = typeof input.password === "string" ? input.password : "";

        if (!identifier || !password || password.length > 128) {
            return res.status(401).json({success: false, error: "Usuario, correo o contraseña incorrectos."});
        }

        const user = await ctx.kysely
            .selectFrom("user")
            .select(["id", "username", "password_hash"])
            .where(identifier.includes("@") ? "email" : "username", "=", identifier)
            .executeTakeFirst();

        const passwordIsValid = await verifyPassword(password, user?.password_hash ?? await DUMMY_PASSWORD_HASH);
        if (!user || !passwordIsValid) {
            return res.status(401).json({success: false, error: "Usuario, correo o contraseña incorrectos."});
        }

        const token = await createSession(ctx.kysely, user.id);
        setSessionCookie(res, token);
        const value: AuthOutput = {user: publicUser(user)};
        return res.json({success: true, value});
    });

    api.get('/auth/me', requireSession(ctx), (req, res) => {
        return res.json({success: true, value: {user: requiredUser(req)}});
    });

    api.get("/auth/session", withBrowserSession(ctx), (req, res) => {
        const value: SessionOutput = {user: currentUser(req)};
        return res.json({success: true, value});
    });

    api.post("/auth/logout", withBrowserSession(ctx), async (req, res) => {
        const token = readSessionToken(req);
        if (token) await revokeSession(ctx, token);
        clearSessionCookie(res);
        return res.json({success: true, value: {}});
    });

    return router;
};
