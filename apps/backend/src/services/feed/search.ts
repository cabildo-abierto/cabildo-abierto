import {cleanText, getCollectionFromUri, unique} from "@cabildo-abierto/utils";
import {EffHandlerNoAuth} from "#/utils/handler.js";
import {FeedPipelineProps, getFeed, GetSkeletonProps} from "#/services/feed/feed.js";
import {sql} from "kysely";
import {
    ArCabildoabiertoFeedDefs,
    ArCabildoabiertoWikiTopicVersion,
    MainSearchOutput, SearchOption
} from "@cabildo-abierto/api";
import {Effect} from "effect";
import {AppContext} from "#/setup.js";
import {searchTopicsSkeleton, searchUsers} from "#/services/search/search.js";
import {DBSelectError} from "#/utils/errors.js";


function searchTopicsByText(ctx: AppContext, q: string) {
    return Effect.tryPromise({
        try: () => {
            if (q.length <= 2) {
                return ctx.kysely
                    .selectFrom("SearchableContent")
                    .innerJoin("Content", "Content.uri", "SearchableContent.uri")
                    .innerJoin("TopicVersion", "Content.uri", "TopicVersion.uri")
                    .where("SearchableContent.collection", "=", "ar.cabildoabierto.wiki.topicVersion")
                    .where(sql<boolean>`"SearchableContent"."text_tsv" @@ to_tsquery('public.spanish_unaccent',
                    ${cleanText(q) + ":*"}
                    )`)
                    .select(["SearchableContent.uri", "topicId"])
                    .orderBy("SearchableContent.created_at desc")
                    .limit(25)
                    .execute()
            } else {
                return ctx.kysely
                    .selectFrom("SearchableContent")
                    .innerJoin("Content", "Content.uri", "SearchableContent.uri")
                    .innerJoin("TopicVersion", "Content.uri", "TopicVersion.uri")
                    .where("SearchableContent.collection", "=", "ar.cabildoabierto.wiki.topicVersion")
                    .where(sql<boolean>`"SearchableContent"."text_tsv" @@ plainto_tsquery('public.spanish_unaccent',
                    ${cleanText(q)}
                    )`)
                    .select(["SearchableContent.uri", "topicId"])
                    .orderBy("SearchableContent.created_at desc")
                    .limit(25)
                    .execute()
            }
        },
        catch: error => new DBSelectError(error)
    })
}


// TO DO: Agregar paginación
const getSearchContentsSkeleton: (q: string, kind: "Publicaciones" | "Artículos" | "Temas") => GetSkeletonProps = (q, kind) => (
    ctx,
    agent,
    cursor
) => {
    const collection: string = kind == "Publicaciones" ? "app.bsky.feed.post" : kind == "Artículos" ? "ar.cabildoabierto.feed.article" : "ar.cabildoabierto.wiki.topicVersion"

    if (kind == "Publicaciones" || kind == "Artículos") {
        return Effect.tryPromise({
            try: () => {
                if (q.length <= 2) {
                    return ctx.kysely
                        .selectFrom("SearchableContent")
                        .where("collection", "=", collection)
                        .where(sql<boolean>`"SearchableContent"."text_tsv" @@ to_tsquery('public.spanish_unaccent',
                        ${cleanText(q) + ":*"}
                        )`)
                        .select("SearchableContent.uri")
                        .orderBy("SearchableContent.created_at desc")
                        .limit(25)
                        .execute()
                } else {
                    return ctx.kysely
                        .selectFrom("SearchableContent")
                        .where("collection", "=", collection)
                        .where(sql<boolean>`"SearchableContent"."text_tsv" @@ plainto_tsquery('public.spanish_unaccent',
                        ${cleanText(q)}
                        )`)
                        .select("SearchableContent.uri")
                        .orderBy("SearchableContent.created_at desc")
                        .limit(25)
                        .execute()
                }
            },
            catch: () => new DBSelectError()
        }).pipe(
            Effect.map(uris => {
                return {
                    skeleton: uris.map(u => ({post: u.uri})),
                    cursor: undefined
                }
            }),
            Effect.withSpan("getSearchContentsSkeleton", {attributes: {kind, q}})
        )
    } else {
        return Effect.all([
            searchTopicsByText(ctx, q),
            searchTopicsSkeleton(ctx, q, undefined, 25)
        ], {concurrency: "unbounded"}).pipe(
            Effect.map(([byText, byTitle]) => {
                const res: { id: string, uri: string }[] = unique([
                    ...byTitle,
                    ...byText.map(t => ({...t, id: t.topicId}))
                ], k => k.id).slice(0, 25)
                return {
                    skeleton: res.map(u => ({post: u.uri})),
                    cursor: undefined
                }
            }),
            Effect.withSpan("getSearchContentsSkeleton", {attributes: {kind, q}})
        )
    }
}


function removeTopicAuthors(feed: ArCabildoabiertoFeedDefs.FeedViewContent[]) {
    return feed.map(e => {
        if(ArCabildoabiertoWikiTopicVersion.isTopicViewBasic(e.content)) {
            return {
                ...e,
                content: {
                    ...e.content,
                    versionAuthor: undefined,
                    versionRef: undefined
                }
            }
        } else {
            return e
        }
    })
}


export const mainSearch: EffHandlerNoAuth<{
    params: { q: string, kind: SearchOption }
}, MainSearchOutput> = (ctx, agent, {params}) => {
    let {q, kind} = params
    if (q.length == 0) return Effect.succeed({kind, value: {feed: [], cursor: undefined}})

    if (kind == "Usuarios") {
        return searchUsers(ctx, agent, {params: {query: q}}).pipe(
            Effect.map(users => {
                const res: MainSearchOutput = {
                    kind,
                    value: {
                        feed: users,
                        cursor: undefined
                    }
                }
                return res
            })
        )
    } else {
        const pipeline: FeedPipelineProps = {
            getSkeleton: getSearchContentsSkeleton(q, kind),
        }

        return getFeed({ctx, agent, pipeline}).pipe(
            Effect.catchAll(() => Effect.fail("Ocurrió un error al buscar.")),
            Effect.map(result => {

                const res: MainSearchOutput = {
                    kind,
                    value: {
                        ...result,
                        feed: kind != "Temas" ? result.feed : removeTopicAuthors(result.feed)
                    }
                }

                return res
            }),
            Effect.withSpan("mainSearch", {attributes: {query: q, kind}})
        )
    }
}


export async function backfillSearchableContents(ctx: AppContext) {
    const batchSize = 2000
    let offset = 0
    const t1 = Date.now()
    while (true) {
        const contents = await ctx.kysely
            .selectFrom("Content")
            .select([
                "text",
                "created_at_tz",
                "uri"
            ])
            .where("text", "is not", null)
            .where("created_at_tz", "is not", null)
            .limit(batchSize)
            .offset(offset)
            .execute()

        const values = contents.map(c => (c.created_at_tz && c.text ? {
            uri: c.uri,
            created_at: c.created_at_tz,
            collection: getCollectionFromUri(c.uri),
            text: c.text
        } : null)).filter(x => x != null)

        if (values.length == 0) break
        const elapsed = Date.now() - t1
        ctx.logger.pino.info({
            offset,
            batchSize,
            elapsed,
            sps: (offset + batchSize) / elapsed
        }, "inserting searchable contents")
        await ctx.kysely
            .insertInto("SearchableContent")
            .values(values)
            .onConflict(oc => oc.column("uri").doNothing())
            .execute()

        offset += batchSize

        if (contents.length < batchSize) break
    }
}