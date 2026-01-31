import {cleanText} from "@cabildo-abierto/utils";
import {EffHandlerNoAuth} from "#/utils/handler.js";
import {FeedPipelineProps, getFeed, GetSkeletonProps} from "#/services/feed/feed.js";
import {sql} from "kysely";
import {ArCabildoabiertoFeedDefs, GetFeedOutput} from "@cabildo-abierto/api";
import {Effect} from "effect";
import {DBError} from "#/services/write/article.js";


// TO DO: Agregar paginación
const getSearchContentsSkeleton: (q: string) => GetSkeletonProps = (q) => (
    ctx,
    agent,
    cursor
) => {
    return Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("Content")
            .innerJoin("Record", "Record.uri", "Content.uri")
            .where("Record.collection", "in", ["ar.cabildoabierto.feed.article", "app.bsky.feed.post"])
            .where(
                sql<boolean>`"Content"."text_tsv" @@ plainto_tsquery('simple', immutable_unaccent(${q}))`
            )
            .innerJoin("User", "User.did", "Record.authorId")
            .where("User.inCA", "=", true)
            .select("Content.uri")
            .limit(25)
            .orderBy("Record.created_at", "desc")
            .execute(),
        catch: () => new DBError()
    }).pipe(Effect.map(uris => {
        return {
            skeleton: uris.map(u => ({ post: u.uri })),
            cursor: undefined
        }
    }))
}


export const searchContents: EffHandlerNoAuth<{params: {q: string}}, GetFeedOutput<ArCabildoabiertoFeedDefs.FeedViewContent>> = (ctx, agent, {params}) => {
    let {q} = params
    if(q.length == 0) return Effect.succeed({feed: [], cursor: undefined})
    q = cleanText(q)

    const pipeline: FeedPipelineProps = {
        getSkeleton: getSearchContentsSkeleton(q),
    }

    return getFeed({ctx, agent, pipeline}).pipe(
        Effect.catchAll(() => Effect.fail("Ocurrió un error al buscar."))
    )
}