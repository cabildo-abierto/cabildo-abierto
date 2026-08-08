import {CreateUserEventBody, CreateUserEventOutput} from "@cabildo-abierto/api";
import {EffHandler} from "#/utils/handler.js";
import {Effect} from "effect";
import {v4 as uuidv4} from "uuid";
import {DBInsertError} from "#/utils/errors.js";
import {AppContext} from "#/setup.js";

export const recordUserEventHandler: EffHandler<CreateUserEventBody, CreateUserEventOutput> = (
    ctx,
    agent,
    {eventId}
) => Effect.gen(function* () {

    const id = uuidv4()

    yield* createEvent(ctx, agent.did, eventId)

    return {id}
})
    .pipe(Effect.withSpan("recordUserEventHandler"))
    .pipe(Effect.catchTag("DBInsertError", () => Effect.fail("Ocurrió un error al guardar el evento.")))


export const createEvent = (ctx: AppContext, userId: string, eventTypeId: string) => {
    return Effect.tryPromise({
        try: () => ctx.kysely.insertInto("Event").values([{
            id: uuidv4(),
            eventTypeId,
            userId,
            date: new Date()
        }]).execute(),
        catch: (error) => new DBInsertError(error)
    })
}