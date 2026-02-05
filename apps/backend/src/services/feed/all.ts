import {FeedPipelineProps, getFeed, GetSkeletonProps} from "#/services/feed/feed.js";
import {min} from "@cabildo-abierto/utils";
import {EffHandler} from "#/utils/handler.js";
import {SessionRequiredError} from "#/services/feed/discover/discover.js";
import {Effect} from "effect";

import {DBSelectError} from "#/utils/errors.js";

const getAllCAFeedPipeline: GetSkeletonProps = (
    ctx, agent, cursor) => Effect.gen(function* () {
    if (!agent.hasSession()) {
        return yield* Effect.fail(new SessionRequiredError())
    }

    let dateSince = new Date()
    let firstFetchDate = new Date()
    if (cursor) {
        const s = cursor.split("::")
        if (s.length == 2) {
            dateSince = new Date(s[1])
            firstFetchDate = new Date(s[0])
        } else {
            throw Error("Cursor inválido")
        }
    }

    const skeleton = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("Content")
            .select(["uri", "created_at_tz"])
            .where("Content.created_at_tz", "<", firstFetchDate)
            .where("Content.created_at_tz", "<", dateSince)
            .orderBy("Content.created_at_tz", "desc")
            .distinct()
            .limit(25)
            .execute(),
        catch: () => new DBSelectError()
    })

    const newDateSince = min(skeleton, x => x.created_at_tz?.getTime() ?? 0)?.created_at_tz

    const newCursor = newDateSince ? [
        newDateSince.toISOString(),
        firstFetchDate.toISOString()
    ].join("::") : undefined

    return {
        skeleton: skeleton.map(u => ({post: u.uri})),
        cursor: newCursor
    }
})

export const allCAFeedPipeline: FeedPipelineProps = {
    getSkeleton: getAllCAFeedPipeline,
    sortKey: (a) => [0]
}


export const getAllCAFeed: EffHandler<{query: {cursor?: string}}, {}> = (ctx, agent, {query}) => {
    return getFeed({ctx, agent, pipeline: allCAFeedPipeline, cursor: query?.cursor})
        .pipe(
            Effect.catchTag("SessionRequiredError", () => Effect.fail("Iniciá sesión para ver este muro.")),
            Effect.catchAll(() => Effect.fail("Ocurrió un error al obtener el muro."))
        )
}