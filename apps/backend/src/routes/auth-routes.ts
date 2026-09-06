import {randomUUID} from "node:crypto";
import express, {type Router} from "express";
import type {AuthOutput, LoginInput, PublicUser, RegisterInput, SessionOutput} from "@cabildo-abierto/api";
import type {AppContext} from "#/setup.js";
import {hashPassword, verifyPassword} from "#/auth/password.js";
import {
    clearSessionCookie,
    createSession,
    readSessionToken,
    revokeSession,
    setSessionCookie,
} from "#/auth/session.js";
import {currentUser, withSession} from "#/auth/middleware.js";

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

    router.post("/auth/register", async (req, res) => {
        const input = (req.body ?? {}) as Partial<RegisterInput>;
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

    router.post("/auth/login", async (req, res) => {
        const input = (req.body ?? {}) as Partial<LoginInput>;
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

    router.get("/auth/session", withSession(ctx), (req, res) => {
        const value: SessionOutput = {user: currentUser(req)};
        return res.json({success: true, value});
    });

    router.post("/auth/logout", async (req, res) => {
        const token = readSessionToken(req);
        if (token) await revokeSession(ctx, token);
        clearSessionCookie(res);
        return res.json({success: true, value: {}});
    });

    return router;
};
