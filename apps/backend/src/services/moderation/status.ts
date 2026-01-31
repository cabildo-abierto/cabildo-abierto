import {PendingModeration} from "@cabildo-abierto/api";
import {DataPlane, makeDataPlane} from "#/services/hydration/dataplane.js";
import {hydrateFeedViewContent} from "#/services/hydration/hydrate.js";
import {EffHandler} from "#/utils/handler.js";
import {Effect} from "effect";
import {DBError} from "#/services/write/article.js";


export const getPendingModeration: EffHandler<{}, PendingModeration> = (
    ctx,
    agent,
    {}
) => Effect.provideServiceEffect(Effect.gen(function* () {

    const records = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("RecordModerationProcess")
            .select(["recordId", "id"])
            .where("result", "is", null)
            .orderBy("created_at asc")
            .limit(25)
            .execute(),
        catch: () => new DBError()
    })

    const data = yield* DataPlane

    const skeleton = records
        .map(r => r.recordId ? {post: r.recordId} : null)
        .filter(x => x != null)

    yield* data.fetchFeedHydrationData(skeleton)

    const hydrated = (yield* Effect.all(
        records.map(e => e.recordId ? hydrateFeedViewContent(ctx, agent, {post: e.recordId}) : Effect.succeed(null))))
        .filter(x => x != null)

    const contents = records
        .map((r, i) => {
        return {
            view: hydrated[i],
            uri: r.recordId,
            id: r.id
        }
    })

    return {
        contents
    }
}).pipe(Effect.catchAll(() => Effect.fail("Ocurrió un error al obtener los datos."))), DataPlane, makeDataPlane(ctx, agent))