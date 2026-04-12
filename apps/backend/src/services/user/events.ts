import {CreateUserEventBody, CreateUserEventOutput} from "@cabildo-abierto/api";
import {EffHandler} from "#/utils/handler.js";
import {Effect} from "effect";
import {v4 as uuidv4} from "uuid";
import {DBInsertError} from "#/utils/errors.js";

export const recordUserEventHandler: EffHandler<CreateUserEventBody, CreateUserEventOutput> = (
    ctx,
    agent,
    {eventId}
) => Effect.gen(function* () {
    const trimmedEventId = eventId.trim()

    if (trimmedEventId.length === 0) {
        return yield* Effect.fail("El evento es inválido.")
    }

    const id = uuidv4()
    const now = new Date()

    yield* Effect.tryPromise({
        try: () => ctx.kysely
            .insertInto("Event")
            .values([{
                id,
                date: now,
                userId: agent.did,
                eventTypeId: trimmedEventId
            }])
            .execute(),
        catch: (error) => new DBInsertError(error)
    })

    return {id}
})
    .pipe(Effect.withSpan("recordUserEventHandler"))
    .pipe(Effect.catchTag("DBInsertError", () => Effect.fail("Ocurrió un error al guardar el evento.")))
