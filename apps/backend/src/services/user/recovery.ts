import {Effect} from "effect";
import {EffHandlerNoAuth} from "#/utils/handler.js";
import {EmailSender} from "#/services/emails/email-sender.js";
import {v4 as uuidv4} from "uuid";
import {env} from "#/lib/env.js";
import {AppContext} from "#/setup.js";
import {DBDeleteError, DBInsertError, DBSelectError} from "#/utils/errors.js";
import {isValidEmail} from "#/services/emails/subscriptions.js";
import {getServiceEndpointForDid} from "#/services/blob.js";
import type {
    RecoverPasswordTokenData,
    RecoverPasswordTokenQuery, RecoveryPdsType,
    RequestPasswordRecoveryBody,
    ResetPasswordBody,
    SendAccountRecoveryEmailBody,
} from "@cabildo-abierto/api";
import {isValidHandle} from "@atproto/syntax";

const VERIFICATION_COOLDOWN_SECONDS = 30;
const TOKEN_EXPIRY_HOURS = 24;
const RECOVERY_PASSWORD_TEMPLATE = "password-recovery";
const RECOVERY_ACCOUNT_TEMPLATE = "account-recovery";


export const requestPasswordRecovery: EffHandlerNoAuth<RequestPasswordRecoveryBody, {}> = (ctx, agent, {account}) => {
    return Effect.gen(function* () {
        account = account.trim()

        let user: {did: string, email: string} | null = null
        if(isValidEmail(account)) {
            const res = yield* Effect.tryPromise({
                try: () => ctx.kysely
                    .selectFrom("User")
                    .select(["did", "handle", "email"])
                    .where("email", "=", account)
                    .executeTakeFirst(),
                catch: (error) => new DBSelectError(error)
            })
            if(!res) return yield* Effect.fail(
                "No encontramos ninguna cuenta asociada a ese correo electrónico."
            )
            user = {did: res.did, email: account}
        } else if(isValidHandle(account)) {
            const res = yield* Effect.tryPromise({
                try: () => ctx.kysely
                    .selectFrom("User")
                    .select(["did", "handle", "email"])
                    .where("handle", "=", account)
                    .executeTakeFirst(),
                catch: (error) => new DBSelectError(error)
            })
            if(!res) return yield* Effect.fail(
                "No encontramos ninguna cuenta asociada a ese nombre de usuario."
            )
            if (!res?.email) {
                return yield* Effect.fail(
                    "No es posible recuperar tu cuenta porque no tiene un correo asociado. Podés contactarnos a soporte@cabildoabierto.ar."
                )
            }
            user = {did: res.did, email: res.email}
        } else {
            return yield* Effect.fail(
                "Ingresá un nombre de usuario o correo electrónico válido."
            )
        }

        const endpoint = yield* getServiceEndpointForDid(ctx, user!.did)
        if(endpoint != "https://cabildo.ar") {
            return yield* Effect.fail(`No podemos recuperar tu contraseña porque tu cuenta no está alojada en este servidor. Está alojada en ${endpoint}.`)
        }

        const recentToken = yield* Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("RecoverPasswordToken")
                .select("id")
                .where("userId", "=", user!.did)
                .where("createdAt", ">", new Date(Date.now() - VERIFICATION_COOLDOWN_SECONDS * 1000))
                .executeTakeFirst(),
            catch: (error) => new DBSelectError(error)
        });

        if (recentToken) {
            return {}
        }

        const template = yield* Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("EmailTemplate")
                .where("name", "=", RECOVERY_PASSWORD_TEMPLATE)
                .select(["id", "html", "text", "subject"])
                .executeTakeFirstOrThrow(),
            catch: (error) => new DBSelectError(error)
        })

        const token = uuidv4();
        const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

        yield* Effect.tryPromise({
            try: () => ctx.kysely
                .insertInto("RecoverPasswordToken")
                .values({
                    id: uuidv4(),
                    token,
                    userId: user!.did,
                    expiresAt,
                    createdAt: new Date()
                })
                .execute(),
            catch: (error) => new DBInsertError(error)
        });

        const recoveryLink = `https://cabildoabierto.ar/recuperacion/clave/${token}`;

        const emailSender = new EmailSender(ctx);

        yield* Effect.tryPromise({
            try: () => emailSender.sendMail({
                from: "Cabildo Abierto <soporte@cabildoabierto.ar>",
                to: user!.email!,
                template: {
                    id: template.id,
                    html: template.html,
                    text: template.text
                },
                emailId: uuidv4(),
                subject: template.subject,
                vars: {recovery_link: recoveryLink},
                unsubscribe: false,
                replyTo: null
            }),
            catch: () => "Ocurrió un error al enviar el correo de recuperación."
        });

        return {}
    }).pipe(
        Effect.withSpan("requestPasswordRecovery")
    ).pipe(
        Effect.catchAll(error => {
            if(typeof error == "string") {
                return Effect.fail(error)
            } else  {
                return Effect.fail("Ocurrió un error al intentar recuperar tu contraseña.")
            }
        })
    );
};

export function getPdsType(endpoint: string): RecoveryPdsType {
    return endpoint == "https://cabildo.ar" ?
        "cabildo" :
        endpoint.endsWith("bsky.network") ? "bsky" : "other"

}

type VerifyRecoverPasswordTokenParams = { query: RecoverPasswordTokenQuery };

export const verifyRecoverPasswordToken: EffHandlerNoAuth<VerifyRecoverPasswordTokenParams, RecoverPasswordTokenData> = (
    ctx,
    agent,
    {query}
) => {
    return Effect.gen(function* () {
        const token = typeof query.token === "string" ? query.token : undefined;
        if (!token) {
            return yield* Effect.fail("El enlace de recuperación venció o es inválido.");
        }

        const tokenRecord = yield* Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("RecoverPasswordToken")
                .innerJoin(
                    "User",
                    "User.did",
                    "RecoverPasswordToken.userId"
                )
                .select([
                    "RecoverPasswordToken.id",
                    "RecoverPasswordToken.userId",
                    "RecoverPasswordToken.expiresAt",
                    "User.handle",
                    "RecoverPasswordToken.token"
                ])
                .where("RecoverPasswordToken.token", "=", token)
                .executeTakeFirst(),
            catch: (error) => new DBSelectError(error)
        });

        if (!tokenRecord) {
            return yield* Effect.fail("El enlace de recuperación venció o es inválido.");
        }

        if (new Date() > tokenRecord.expiresAt) {
            yield* Effect.tryPromise({
                try: () => ctx.kysely
                    .deleteFrom("RecoverPasswordToken")
                    .where("id", "=", tokenRecord.id)
                    .execute(),
                catch: (error) => new DBDeleteError(error)
            });
            return yield* Effect.fail("El enlace de recuperación venció o es inválido.");
        }
        const handle = tokenRecord.handle
        if(!handle) {
            return yield* Effect.fail("No pudimos obtener tu cuenta.")
        }

        const endpoint = yield* getServiceEndpointForDid(
            ctx,
            tokenRecord.userId
        )

        const pdsType: RecoveryPdsType = getPdsType(endpoint)
        return {
            handle: handle,
            pdsType,
            token: tokenRecord.token
        };
    }).pipe(
        Effect.withSpan("verifyRecoverPasswordToken")
    ).pipe(
        Effect.catchAll(() => Effect.fail("Ocurrió un error en la recuperación."))
    )
};

async function resetPasswordOnCabildoPDS(
    ctx: AppContext,
    did: string,
    newPassword: string
): Promise<void> {
    const basicAuth = Buffer.from(`admin:${env.PDS_PASSWORD}`).toString("base64");

    const res = await fetch("https://cabildo.ar/xrpc/com.atproto.admin.updateAccountPassword", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${basicAuth}`,
        },
        body: JSON.stringify({did, password: newPassword}),
    });

    if (!res.ok) {
        const err = await res.text();
        ctx.logger.pino.warn({status: res.status, err}, "PDS updateAccountPassword failed");
        throw new Error("No se pudo cambiar la contraseña.");
    }
}

export const resetPassword: EffHandlerNoAuth<ResetPasswordBody, {}> = (ctx, agent, {token, newPassword}) => {
    return Effect.gen(function* () {
        if (!token || !newPassword) {
            return yield* Effect.fail("Token o contraseña inválidos.");
        }

        const tokenRecord = yield* Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("RecoverPasswordToken")
                .innerJoin("User", "User.did", "RecoverPasswordToken.userId")
                .select(["RecoverPasswordToken.id", "RecoverPasswordToken.userId", "RecoverPasswordToken.expiresAt", "User.handle"])
                .where("RecoverPasswordToken.token", "=", token)
                .executeTakeFirst(),
            catch: (error) => new DBSelectError(error)
        });

        if (!tokenRecord) {
            return yield* Effect.fail("Enlace inválido o vencido.");
        }

        if (new Date() > tokenRecord.expiresAt) {
            yield* Effect.tryPromise({
                try: () => ctx.kysely
                    .deleteFrom("RecoverPasswordToken")
                    .where("id", "=", tokenRecord.id)
                    .execute(),
                catch: (error) => new DBDeleteError(error)
            });
            return yield* Effect.fail("Enlace inválido o vencido.");
        }

        const handle = tokenRecord.handle
        if(!handle) {
            return yield* Effect.fail("Ocurrió un error al cambiar la contraseña.")
        }

        const endpoint = yield* getServiceEndpointForDid(ctx, tokenRecord.userId)
        const pdsType = getPdsType(endpoint);

        if (pdsType !== "cabildo") {
            return yield* Effect.fail("Solo las cuentas de Cabildo Abierto pueden cambiar la contraseña aquí.");
        }

        yield* Effect.tryPromise({
            try: () => resetPasswordOnCabildoPDS(ctx, tokenRecord.userId, newPassword),
            catch: () => "Ocurrió un error al cambiar la contraseña."
        });

        yield* Effect.tryPromise({
            try: () => ctx.kysely
                .deleteFrom("RecoverPasswordToken")
                .where("id", "=", tokenRecord.id)
                .execute(),
            catch: (error) => new DBDeleteError(error)
        });

        return {};
    }).pipe(
        Effect.withSpan("resetPassword")
    ).pipe(
    Effect.catchAll(() => Effect.fail("Ocurrió un error al cambiar la contraseña.")),
    );
};

export const sendAccountRecoveryEmail: EffHandlerNoAuth<SendAccountRecoveryEmailBody, {}> = (ctx, agent, {email}) => {
    return Effect.gen(function* () {
        if (env.NODE_ENV === "test") {
            return {}
        }

        const trimmed = email.trim();
        if (!isValidEmail(trimmed)) {
            return {}
        }

        const user = yield* Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("User")
                .select(["did", "handle", "email"])
                .where("email", "=", trimmed)
                .executeTakeFirst(),
            catch: (error) => new DBSelectError(error)
        });

        if (!user?.email || !user.handle) {
            return {}
        }

        const userEmail = user.email
        const userHandle = user.handle

        const template = yield* Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("EmailTemplate")
                .where("name", "=", RECOVERY_ACCOUNT_TEMPLATE)
                .select(["id", "html", "text", "subject"])
                .executeTakeFirst(),
            catch: (error) => new DBSelectError(error)
        });

        if (!template) {
            return {}
        }

        const emailSender = new EmailSender(ctx);

        yield* Effect.tryPromise({
            try: () => emailSender.sendMail({
                from: "Cabildo Abierto <soporte@cabildoabierto.ar>",
                to: userEmail,
                template: {
                    id: template.id,
                    html: template.html,
                    text: template.text
                },
                emailId: uuidv4(),
                subject: template.subject,
                vars: {handle: userHandle},
                unsubscribe: false,
                replyTo: null
            }),
            catch: () => "Ocurrió un error al enviar el correo."
        });

        return {}
    }).pipe(
        Effect.catchAll(() => Effect.succeed({})),
        Effect.withSpan("sendAccountRecoveryEmail")
    );
};
