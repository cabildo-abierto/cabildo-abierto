import {XRPCError} from "@atproto/xrpc";
import {EffHandler} from "#/utils/handler.js";
import * as Effect from "effect/Effect";
import {isValidHandle} from "@atproto/syntax";
import {DBInsertError} from "#/utils/errors.js";

function normalizeAccountHandleInput(raw: string): string {
    const t = raw.trim()
    if (t.startsWith("@")) {
        return t.slice(1)
    }
    return t
}


function userFacingHandleChangeError(err: unknown): string {
    if (err instanceof XRPCError) {
        const msg = (err.message || "").toLowerCase()
        const lex = (typeof err.error === "string" ? err.error : "").toLowerCase()
        if (
            msg.includes("invalid") ||
            lex.includes("invalidhandle") ||
            lex === "invalidhandle"
        ) {
            return "El nombre de usuario no es válido o el dominio no está bien configurado."
        }
        if (
            msg.includes("taken") ||
            msg.includes("in use") ||
            lex.includes("handlealreadyexists")
        ) {
            return "Ese nombre de usuario ya está en uso."
        }
        if (err.message) {
            return err.message
        }
    }
    if (err instanceof Error && err.message) {
        return err.message
    }
    return "No se pudo cambiar el nombre de usuario. Si usás un dominio propio, verificá el DNS."
}

export const changeHandle: EffHandler<{ handle: string }, {}> = (ctx, agent, {handle: rawHandle}) => {
    return Effect.gen(function* () {
        const newHandle = normalizeAccountHandleInput(rawHandle ?? "")
        if (!newHandle || !isValidHandle(newHandle)) {
            return yield* Effect.fail("El nombre de usuario no es válido.")
        }

        const existingDid = yield* ctx.resolver.resolveHandleToDid(newHandle)
        if (existingDid != null && existingDid !== agent.did) {
            return yield* Effect.fail("Ese nombre de usuario ya está en uso.")
        }

        yield* Effect.tryPromise({
            try: () => agent.bsky.com.atproto.identity.updateHandle({handle: newHandle}),
            catch: (e) => userFacingHandleChangeError(e)
        })

        yield* Effect.tryPromise({
            try: () => ctx.kysely
                .updateTable("User")
                .set({handle: newHandle})
                .where("did", "=", agent.did)
                .execute(),
            catch: (e) => new DBInsertError(e)
        })

        yield* Effect.promise(() =>
            ctx.redisCache.resolver.setHandle(agent.did, newHandle).catch(() => undefined)
        )

        return {}
    }).pipe(
        Effect.withSpan("changeHandle")
    ).pipe(
        Effect.catchAll(() => Effect.fail("Ocurrió un error al cambiar el nombre de usuario."))
    )
}


export const verifyCustomDomainHandle: EffHandler<{ handle: string, method: "dns" | "http" }, {}> = (ctx, agent, {handle: rawHandle, method}) => {
    return Effect.gen(function* () {
        const h = normalizeAccountHandleInput(rawHandle ?? "")
        if (!h || !isValidHandle(h)) {
            return yield* Effect.fail("Ingresá un dominio válido.")
        }

        if(method != "dns" && method != "http") {
            return yield* Effect.fail("Método inválido.")
        }

        const did = yield* (method == "dns" ?
            ctx.resolver.resolveHandleToDidDNS(h) :
            ctx.resolver.resolveHandleToDidHTTP(h))

        ctx.logger.pino.info({h, method, did, trueDid: agent.did}, "handle resolved")
        if(!did) {
            return yield* Effect.fail("No pudimos verificar el dominio.")
        } else if(did != agent.did) {
            return yield* Effect.fail("El dominio está asignado a otra cuenta.")
        } else {
            return {}
        }
    }).pipe(
        Effect.catchTag("HandleResolutionError", () => Effect.fail("Ocurrió un error al verificar el dominio.")),
        Effect.withSpan("verifyCustomDomainHandle")
    )
}