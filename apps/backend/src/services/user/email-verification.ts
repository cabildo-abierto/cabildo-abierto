import {Effect} from "effect";
import {EffHandler} from "#/utils/handler.js";
import {EmailSender} from "#/services/emails/email-sender.js";
import {v4 as uuidv4} from "uuid";
import {env} from "#/lib/env.js";
import {DBDeleteError, DBSelectError} from "#/utils/errors.js";

const VERIFICATION_COOLDOWN_SECONDS = 30;
const TOKEN_EXPIRY_HOURS = 24;
const TEMPLATE_NAME = "verification-email";

export const sendVerificationEmail: EffHandler<{}, {}> = (ctx, agent) => {
    return Effect.gen(function* () {
        if (env.NODE_ENV === "test") {
            return {}
        }

        const user = yield* Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("User")
                .select(["email", "emailVerified"])
                .where("did", "=", agent.did)
                .executeTakeFirst(),
            catch: () => "Error al obtener los datos del usuario."
        })

        if (!user?.email) {
            return yield* Effect.fail("Agregá un correo electrónico primero.")
        }

        if (user.emailVerified) {
            return yield* Effect.fail("Tu correo ya está verificado.")
        }

        const recentToken = yield* Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("EmailVerificationToken")
                .select("id")
                .where("userId", "=", agent.did)
                .where("createdAt", ">", new Date(Date.now() - VERIFICATION_COOLDOWN_SECONDS * 1000))
                .executeTakeFirst(),
            catch: () => "Error al verificar el límite de envío."
        })

        if (recentToken) {
            return yield* Effect.fail("Esperá 30 segundos antes de enviar otro correo.")
        }

        const template = yield* Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("EmailTemplate")
                .where("name", "=", TEMPLATE_NAME)
                .select(["id", "html", "text", "subject"])
                .executeTakeFirst(),
            catch: (error) => new DBSelectError(error)
        })

        if (!template) {
            return yield* Effect.fail("Ocurrió un error al enviar el correo de verificación.")
        }

        const token = uuidv4()
        const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)

        yield* Effect.tryPromise({
            try: () => ctx.kysely
                .insertInto("EmailVerificationToken")
                .values({
                    id: uuidv4(),
                    token,
                    userId: agent.did,
                    expiresAt,
                    createdAt: new Date()
                })
                .execute(),
            catch: () => "Error al crear el token de verificación."
        })

        const verificationLink = `https://cabildoabierto.ar/verificar-email/${token}`

        const emailSender = new EmailSender(ctx)

        yield* Effect.tryPromise({
            try: () => emailSender.sendMail({
                from: "Cabildo Abierto <soporte@cabildoabierto.ar>",
                to: user.email!,
                template: {
                    id: template.id,
                    html: template.html,
                    text: template.text
                },
                emailId: uuidv4(),
                subject: template.subject,
                vars: {verification_link: verificationLink},
                unsubscribe: false,
                replyTo: null
            }),
            catch: () => "Ocurrió un error al enviar el correo."
        })

        return {}
    }).pipe(
        Effect.catchTag("DBSelectError", () => Effect.fail("Ocurrió un error al enviar el correo de verificación.")),
        Effect.withSpan("sendVerificationEmail")
    )
}

type VerifyEmailParams = {
    query: { token?: string }
}

export const verifyEmailFromToken: EffHandler<VerifyEmailParams, {}> = (ctx, agent, {query}) => {
    return Effect.gen(function* () {
        const token = typeof query.token === "string" ? query.token : undefined
        if (!token) {
            return yield* Effect.fail("Token inválido.")
        }

        const tokenRecord = yield* Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("EmailVerificationToken")
                .select(["id", "userId", "expiresAt"])
                .where("token", "=", token)
                .executeTakeFirst(),
            catch: (error) => new DBSelectError(error)
        })

        if (!tokenRecord) {
            return yield* Effect.fail("Enlace inválido o vencido.")
        }

        if (tokenRecord.userId !== agent.did) {
            return yield* Effect.fail("Este enlace no corresponde a tu cuenta.")
        }

        if (new Date() > tokenRecord.expiresAt) {
            yield* Effect.tryPromise({
                try: () => ctx.kysely
                    .deleteFrom("EmailVerificationToken")
                    .where("id", "=", tokenRecord.id)
                    .execute(),
                catch: (error) => new DBDeleteError(error)
            })
            return yield* Effect.fail("Enlace inválido o vencido.")
        }

        yield* Effect.tryPromise({
            try: () => ctx.kysely
                .updateTable("User")
                .set("emailVerified", true)
                .where("did", "=", agent.did)
                .execute(),
            catch: () => "Error al verificar el correo."
        })

        yield* Effect.tryPromise({
            try: () => ctx.kysely
                .deleteFrom("EmailVerificationToken")
                .where("id", "=", tokenRecord.id)
                .execute(),
            catch: (error) => new DBDeleteError(error)
        })

        return {}
    }).pipe(
        Effect.catchTag("DBDeleteError", () => Effect.fail("Ocurrió un error al verificar el correo.")),
        Effect.catchTag("DBSelectError", () => Effect.fail("Ocurrió un error al verificar el correo.")),
        Effect.withSpan("verifyEmailFromToken")
    )
}

export const unverifyOwnEmail: EffHandler<{}, {}> = (ctx, agent) => {
    return Effect.gen(function* () {
        yield* Effect.tryPromise({
            try: () => ctx.kysely
                .updateTable("User")
                .set("emailVerified", false)
                .where("did", "=", agent.did)
                .execute(),
            catch: () => "Error al actualizar el estado de verificación."
        })
        return {}
    }).pipe(
        Effect.catchAll((error) => Effect.fail(error)),
        Effect.withSpan("unverifyOwnEmail")
    )
}
