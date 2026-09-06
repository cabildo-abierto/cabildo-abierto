import {createHash, randomBytes} from "node:crypto";
import type {Request, Response} from "express";
import type {Kysely, Transaction} from "kysely";
import type {AppContext} from "#/setup.js";
import type {DB} from "#/db/types.js";
import type {PublicUser} from "@cabildo-abierto/api";

export const SESSION_COOKIE = "ca_session";
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export function hashSessionToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

export function readSessionToken(req: Request): string | null {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return null;

    for (const cookie of cookieHeader.split(";")) {
        const separator = cookie.indexOf("=");
        if (separator === -1) continue;
        const name = cookie.slice(0, separator).trim();
        if (name !== SESSION_COOKIE) continue;

        try {
            return decodeURIComponent(cookie.slice(separator + 1));
        } catch {
            return null;
        }
    }

    return null;
}

export function setSessionCookie(res: Response, token: string): void {
    res.cookie(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: SESSION_DURATION_MS,
    });
}

export function clearSessionCookie(res: Response): void {
    res.clearCookie(SESSION_COOKIE, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
    });
}

export async function createSession(database: Kysely<DB> | Transaction<DB>, userId: string): Promise<string> {
    const token = randomBytes(32).toString("base64url");
    const now = new Date();

    await database.insertInto("session").values({
        token_hash: hashSessionToken(token),
        user_id: userId,
        created_at: now,
        expires_at: new Date(now.getTime() + SESSION_DURATION_MS),
    }).execute();

    return token;
}

export async function getSessionUser(ctx: AppContext, token: string): Promise<PublicUser | null> {
    const tokenHash = hashSessionToken(token);
    const session = await ctx.kysely
        .selectFrom("session")
        .innerJoin("user", "user.id", "session.user_id")
        .select(["session.expires_at", "user.id", "user.username"])
        .where("session.token_hash", "=", tokenHash)
        .executeTakeFirst();

    if (!session) return null;
    if (new Date(session.expires_at).getTime() <= Date.now()) {
        await ctx.kysely.deleteFrom("session").where("token_hash", "=", tokenHash).execute();
        return null;
    }

    return {id: session.id, username: session.username};
}

export async function revokeSession(ctx: AppContext, token: string): Promise<void> {
    await ctx.kysely.deleteFrom("session").where("token_hash", "=", hashSessionToken(token)).execute();
}
