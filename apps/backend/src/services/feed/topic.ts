import {EffHandlerNoAuth} from "#/utils/handler.js";
import {
    FeedPipelineProps,
    getFeed,
    GetSkeletonError,
    GetSkeletonOutput,
    GetSkeletonProps
} from "#/services/feed/feed.js";
import {AppContext} from "#/setup.js";
import {Agent} from "#/utils/session-agent.js";
import {getTopicIdFromTopicVersionUri} from "#/services/wiki/current-version.js";
import {getTopicTitle} from "#/services/wiki/utils.js";
import {
    ArCabildoabiertoFeedDefs,
    ArCabildoabiertoWikiTopicVersion,
    defaultTopicMentionsFormat,
    defaultTopicMentionsMetric,
    defaultTopicMentionsTime,
    GetFeedOutput
} from "@cabildo-abierto/api"
import {
    EnDiscusionMetric,
    EnDiscusionSkeletonElement,
    EnDiscusionTime,
    FeedFormatOption,
    getEnDiscusionStartDate,
    getNextCursorEnDiscusion
} from "#/services/feed/inicio/discusion.js";
import {SkeletonQuery} from "#/services/feed/inicio/following.js";
import {Effect} from "effect";
import {DataPlane} from "#/services/hydration/dataplane.js";

import {DBSelectError} from "#/utils/errors.js";


const getTopicMentionsSkeletonQuery: (id: string, metric: EnDiscusionMetric, time: EnDiscusionTime, format: FeedFormatOption) => SkeletonQuery<EnDiscusionSkeletonElement> = (id, metric, time, format) => {
    return async (ctx, agent, from, to, limit) => {
        const startDate = metric != "Recientes" ? getEnDiscusionStartDate(time) : new Date(0)
        const collections = format == "Artículos" ? ["ar.cabildoabierto.feed.article"] : ["ar.cabildoabierto.feed.article", "app.bsky.feed.post"]

        if (limit == 0) {
            return []
        }

        if (metric == "Me gustas") {
            const offsetFrom = from != null ? Number(from) + 1 : 0
            const offsetTo = to != null ? Number(to) : undefined
            if (offsetTo != null) {
                limit = Math.min(limit, offsetTo - offsetFrom)
            }

            if (limit == 0) return []

            const res = await ctx.kysely
                .selectFrom("Reference")
                .where("Reference.referencedTopicId", "=", id)
                .where("Reference.referencingContentCreatedAt", ">", startDate)
                .innerJoin("Content", "Content.uri", "Reference.referencingContentId")
                .select([
                    'Reference.referencingContentId as uri',
                    "Reference.referencingContentCreatedAt as createdAt"
                ])
                .orderBy(["likesScore desc", "Reference.referencingContentCreatedAt desc"])
                .limit(limit)
                .offset(offsetFrom)
                .execute()

            return res.map((r, i) => ({
                ...r,
                score: -(i + offsetFrom)
            }))
        } else if (metric == "Interacciones") {
            const offsetFrom = from != null ? Number(from) + 1 : 0
            const offsetTo = to != null ? Number(to) : undefined
            if (offsetTo != null) {
                limit = Math.min(limit, offsetTo - offsetFrom)
            }

            if (limit == 0) return []
            const res = await ctx.kysely
                .selectFrom("Content")
                .innerJoin("Record", "Record.uri", "Content.uri")
                .innerJoin("Reference", "Reference.referencingContentId", "Record.uri")
                .leftJoin("Post", "Post.uri", "Record.uri")
                .where("Reference.referencedTopicId", "=", id)
                .where("Record.collection", "in", collections)
                .where("Record.created_at", ">", startDate)
                .where("interactionsScore", "is not", null)
                .select([
                    "Reference.referencingContentId as uri",
                    "Reference.referencingContentCreatedAt as createdAt"
                ])
                .orderBy(["interactionsScore desc", "Reference.referencingContentCreatedAt desc"])
                .limit(limit)
                .offset(offsetFrom)
                .execute()

            return res.map((r, i) => ({
                ...r,
                score: -(i + offsetFrom)
            }))
        } else if (metric == "Popularidad relativa") {
            const offsetFrom = from != null ? Number(from) + 1 : 0
            const offsetTo = to != null ? Number(to) : undefined
            if (offsetTo != null) {
                limit = Math.min(limit, offsetTo - offsetFrom)
            }

            if (limit == 0) return []

            const res = await ctx.kysely
                .selectFrom("Content")
                .innerJoin("Record", "Record.uri", "Content.uri")
                .innerJoin("Reference", "Reference.referencingContentId", "Record.uri")
                .leftJoin("Post", "Post.uri", "Record.uri")
                .leftJoin("TopicVersion", "TopicVersion.uri", "Post.rootId")
                .innerJoin("User", "User.did", "Record.authorId")
                .where("User.inCA", "=", true)
                .where("Reference.referencedTopicId", "=", id)
                .where("Record.collection", "in", collections)
                .where(eb => eb.or([
                    eb("TopicVersion.topicId", "!=", id),
                    eb("TopicVersion.uri", "is", null)
                ]))
                .where("Record.created_at", ">", startDate)
                .select([
                    'Record.uri',
                    "Record.created_at as createdAt"
                ])
                .orderBy(["relativePopularityScore desc", "Content.created_at desc"])
                .limit(limit)
                .offset(offsetFrom)
                .execute()

            return res.map((r, i) => ({
                ...r,
                score: -(i + offsetFrom)
            }))
        } else if (metric == "Recientes") {
            const offsetFrom = from != null ? new Date(from) : undefined
            const offsetTo = to != null ? new Date(to) : undefined

            if (offsetFrom && offsetTo && offsetFrom.getTime() <= offsetTo.getTime()) return []

            const res = await ctx.kysely
                .selectFrom("Reference")
                .innerJoin("Record", "Record.uri", "Reference.referencingContentId")
                .where("Reference.referencedTopicId", "=", id)
                .where("Record.collection", "in", collections)
                .$if(offsetFrom != null, qb => qb.where("Reference.referencingContentCreatedAt", "<", offsetFrom!))
                .$if(offsetTo != null, qb => qb.where("Reference.referencingContentCreatedAt", ">", offsetTo!))
                .select([
                    "Reference.referencingContentId as uri",
                    "Reference.referencingContentCreatedAt as createdAt"
                ])
                .orderBy('Reference.referencingContentCreatedAt', 'desc')
                .limit(limit)
                .execute()

            return res.map(r => ({
                uri: r.uri,
                createdAt: r.createdAt,
                score: r.createdAt.getTime()
            }))
        } else {
            throw Error(`Métrica desconocida! ${metric}`)
        }
    }
}


const getTopicMentionsSkeleton = (
    ctx: AppContext,
    agent: Agent,
    id: string,
    cursor: string | undefined,
    metric: EnDiscusionMetric,
    time: EnDiscusionTime,
    format: FeedFormatOption
): Effect.Effect<GetSkeletonOutput, GetSkeletonError, DataPlane> => {

    const limit = 25

    return Effect.tryPromise({
        try: () => getTopicMentionsSkeletonQuery(
            id, metric, time, format
        )(ctx, agent, cursor, undefined, limit),
        catch: (error) => new DBSelectError(error)
    }).pipe(
        Effect.map(skeleton => {
            return {
                skeleton: skeleton.map(x => ({post: x.uri})),
                cursor: getNextCursorEnDiscusion(metric, time, format)(cursor, skeleton, limit)
            }
        }),
        Effect.withSpan("getTopicMentionsSkeleton", {attributes: {metric, time, format, cursor, id}})
    )
}


export function getTopicMentionsInTopics(ctx: AppContext, id: string) {
    return Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("TopicVersion")
            .innerJoin("Record", "Record.uri", "TopicVersion.uri")
            .where("Record.collection", "=", "ar.cabildoabierto.wiki.topicVersion")
            .select("topicId")
            .where(eb => eb.exists(eb => eb
                .selectFrom("Reference")
                .where("Reference.referencedTopicId", "=", id)
                .whereRef("Reference.referencingContentId", "=", "TopicVersion.uri")
            ))
            .where("TopicVersion.topicId", "!=", id)
            .innerJoin("Topic", "Topic.currentVersionId", "TopicVersion.uri")
            .select(["TopicVersion.topicId", "TopicVersion.props"])
            .orderBy("created_at", "desc")
            .limit(25)
            .execute(),
        catch: () => new DBSelectError()
    }).pipe(Effect.map(topics => {
        return topics.map(t => {
            return {
                id: t.topicId,
                title: getTopicTitle({id: t.topicId, props: t.props as ArCabildoabiertoWikiTopicVersion.TopicProp[]})
            }
        })
    }))
}


export const getTopicFeed: EffHandlerNoAuth<{
    query: {
        i?: string,
        did?: string,
        rkey?: string,
        cursor?: string,
        metric?: EnDiscusionMetric,
        time?: EnDiscusionTime,
        format?: FeedFormatOption
    }
}, {
    feed: ArCabildoabiertoFeedDefs.FeedViewContent[],
    cursor?: string
}> = (ctx, agent, {query}) => {
    let {i: id, did, rkey, cursor, metric, time, format} = query

    if (!id && (!did || !rkey)) {
        return Effect.fail("Se requiere un id o un par did y rkey.")
    }

    return Effect.gen(function* () {
        const topicId = id ?? (yield* getTopicIdFromTopicVersionUri(ctx, did!, rkey!))

        const getSkeleton: GetSkeletonProps = (ctx, agent, cursor) => {
            return getTopicMentionsSkeleton(
                ctx,
                agent,
                topicId,
                cursor,
                metric ?? defaultTopicMentionsMetric,
                time ?? defaultTopicMentionsTime,
                format ?? defaultTopicMentionsFormat
            )
        }

        return yield* getFeed({
            ctx,
            agent,
            pipeline: {
                getSkeleton,
                debugName: `topic:${metric}:${time}:${format}`
            },
            cursor
        })
    }).pipe(
        Effect.catchTag("NotFoundError", () => {
            return Effect.fail("No se encontró el tema.")
        }),
        Effect.catchAll(() => {
            return Effect.fail("Ocurrió un error al obtener el muro.")
        })
    )
}


export const getTopicMentionsInTopicsFeed: EffHandlerNoAuth<{ query: { i?: string, did?: string, rkey?: string } }, {
    feed: { id: string, title: string }[],
    cursor: string | undefined
}> = (ctx, agent, {query}) => {
    let {i: id, did, rkey} = query

    return Effect.gen(function* () {
        if (!id) {
            if (!did || !rkey) {
                return yield* Effect.fail("Se requiere un id o un par did y rkey.")
            } else {
                id = yield* getTopicIdFromTopicVersionUri(ctx, did, rkey) ?? undefined
                if (!id) {
                    return yield* Effect.fail("No se encontró esta versión del tema.")
                }
            }
        }

        const topicMentions = yield* getTopicMentionsInTopics(ctx, id)

        return {
            feed: topicMentions,
            cursor: undefined
        }
    }).pipe(
        Effect.catchTag("NotFoundError", () => Effect.fail("No se encontró el tema.")),
        Effect.catchTag("DBSelectError", () => Effect.fail("Ocurrió un error al obtener las menciones."))
    )
}


export const getAllTopicEditsFeed: EffHandlerNoAuth<{
    query: { cursor: string | undefined }
}, GetFeedOutput<ArCabildoabiertoFeedDefs.FeedViewContent>> = (ctx, agent, {query}) => {
    const {cursor} = query

    const pipeline: FeedPipelineProps = {
        getSkeleton: (ctx, agent, cursor) => {
            return Effect.tryPromise({
                try: () => ctx.kysely
                    .selectFrom("TopicVersion")
                    .innerJoin("Record", "Record.uri", "TopicVersion.uri")
                    .select(["TopicVersion.uri", "Record.created_at_tz"])
                    .orderBy("Record.created_at_tz desc")
                    .limit(25)
                    .$if(cursor != null, qb => qb.where("Record.created_at_tz", "<", new Date(cursor!)))
                    .execute(),
                catch: () => new DBSelectError()
            }).pipe(Effect.map(edits => {
                const latest = edits[edits.length - 1]
                const newCursor = latest?.created_at_tz?.toISOString()

                return {
                    skeleton: edits.map(e => ({post: e.uri})),
                    cursor: newCursor
                }
            }))
        }
    }

    return getFeed({ctx, agent, pipeline, cursor})
        .pipe(Effect.catchAll(() => Effect.fail("Ocurrió un error al obtener el muro.")))
}