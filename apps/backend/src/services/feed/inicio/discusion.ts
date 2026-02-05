import {FeedPipelineProps, GetSkeletonProps} from "#/services/feed/feed.js";
import {EffHandler} from "#/utils/handler.js";
import {
    defaultEnDiscusionFormat,
    defaultEnDiscusionMetric,
    defaultEnDiscusionTime
} from "@cabildo-abierto/api"
import {ComAtprotoLabelDefs} from "@atproto/api";
import {sql} from "kysely";
import {
    GetNextCursor,
    getNextFollowingFeedCursor,
    SkeletonQuery
} from "#/services/feed/inicio/following.js";
import {Effect} from "effect";
import {DBSelectError} from "#/utils/errors.js";
import {FetchFromBskyError} from "#/services/hydration/dataplane.js";
import {ATCreateRecordError} from "#/services/wiki/votes.js";
import {AppContext} from "#/setup.js";
import {SessionAgent} from "#/utils/session-agent.js";
import {getUri, shortCollectionToCollection, splitUri} from "@cabildo-abierto/utils";
import {getRecordProcessor} from "#/services/sync/event-processing/get-record-processor.js";


export function getEnDiscusionStartDate(time: EnDiscusionTime) {
    const oneDay = 3600 * 24 * 1000
    if (time == "Último día") {
        return new Date(Date.now() - oneDay)
    } else if (time == "Última semana") {
        return new Date(Date.now() - 7 * oneDay)
    } else if (time == "Último mes") {
        return new Date(Date.now() - 30 * oneDay)
    } else if (time == "Último año") {
        return new Date(Date.now() - 365 * oneDay)
    } else {
        throw Error(`Período de tiempo inválido: ${time}`)
    }
}


export type EnDiscusionMetric = "Me gustas" | "Interacciones" | "Popularidad relativa" | "Recientes"
export type EnDiscusionTime = "Último día" | "Última semana" | "Último mes" | "Último año"
export type FeedFormatOption = "Todos" | "Artículos"

export type EnDiscusionSkeletonElement = { uri: string, createdAt: Date }

const getEnDiscusionSkeletonQuery: (
    metric: EnDiscusionMetric,
    time: EnDiscusionTime,
    format: FeedFormatOption
) => SkeletonQuery<EnDiscusionSkeletonElement> = (metric, time, format) => {
    return async (ctx, agent, from, to, limit) => {
        const startDate = metric != "Recientes" ? getEnDiscusionStartDate(time) : new Date(0)
        const collections = format == "Artículos" ?
            ["ar.cabildoabierto.feed.article"] :
            ["ar.cabildoabierto.feed.article", "app.bsky.feed.post"]
        const label = 'ca:en discusión'

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
                .selectFrom('Content')
                .innerJoin('Record', 'Record.uri', 'Content.uri')
                .where('Record.collection', 'in', collections)
                .where(sql<boolean>`"Content"."selfLabels" @> ARRAY[
                ${label}
                ]
                ::
                text
                [
                ]`)
                .where("Record.created_at", ">", startDate)
                .select([
                    "Content.uri",
                    "Content.created_at as createdAt"
                ])
                .where("Content.caModeration", "=", "Ok")
                .orderBy(["likesScore desc", "Content.created_at desc"])
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
                .selectFrom('Record')
                .where('Record.collection', 'in', collections)
                .where("Record.created_at", ">", startDate)
                .innerJoin('Content', 'Record.uri', 'Content.uri')
                .where(sql<boolean>`"Content"."selfLabels" @> ARRAY[
                ${label}
                ]
                ::
                text
                [
                ]`)
                .select([
                    "Content.uri",
                    "Content.created_at as createdAt"
                ])
                .where("Content.caModeration", "=", "Ok")
                .where("interactionsScore", "is not", null)
                .orderBy(["interactionsScore desc", "Content.created_at desc"])
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

            const res = await ctx.kysely.selectFrom('Record')
                .where('Record.collection', 'in', collections)
                .where("Record.created_at", ">", startDate)
                .innerJoin('Content', 'Record.uri', 'Content.uri')
                .where(sql<boolean>`"Content"."selfLabels" @> ARRAY[
                ${label}
                ]
                ::
                text
                [
                ]`)
                .select(eb => [
                    'Record.uri',
                    "Record.created_at as createdAt"
                ])
                .where("Content.caModeration", "=", "Ok")
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

            const res = await ctx.kysely.with("EnDiscusionContent", eb => eb.selectFrom('Record')
                .where('Record.collection', 'in', collections)
                .innerJoin('Content', 'Record.uri', 'Content.uri')
                .where(sql<boolean>`"Content"."selfLabels" @> ARRAY[
                ${label}
                ]
                ::
                text
                [
                ]`)
                .orderBy("Record.authorId")
                .orderBy("Record.created_at desc")
                .distinctOn("Record.authorId")
                .where("Content.caModeration", "=", "Ok")
                .select([
                    'Record.uri',
                    "Record.authorId",
                    "Record.created_at as createdAt"
                ]))
                .selectFrom("EnDiscusionContent")
                .select([
                    "EnDiscusionContent.uri",
                    "EnDiscusionContent.createdAt"
                ])
                .$if(offsetFrom != null, qb => qb.where("EnDiscusionContent.createdAt", "<", offsetFrom!))
                .$if(offsetTo != null, qb => qb.where("EnDiscusionContent.createdAt", ">", offsetTo!))
                .orderBy('EnDiscusionContent.createdAt', 'desc')
                .limit(limit)
                .execute()
            return res.map(r => ({
                uri: r.uri,
                createdAt: r.createdAt ?? new Date(),
                score: r.createdAt?.getTime() ?? 0
            }))
        } else {
            throw Error(`Métrica desconocida! ${metric}`)
        }
    }
}


export const getNextCursorEnDiscusion: (metric: EnDiscusionMetric, time: EnDiscusionTime, format: FeedFormatOption) => GetNextCursor<EnDiscusionSkeletonElement> = (metric, time, format) => {
    return (cursor, skeleton, limit) => {
        if (metric == "Recientes") {
            return getNextFollowingFeedCursor(
                cursor,
                skeleton.map(s => ({
                    ...s,
                    repostedRecordUri: undefined
                })),
                limit
            )
        } else {
            const cur = cursor ? Number(cursor) : 0
            if (skeleton.length < limit) return undefined
            return (cur - 1 + skeleton.length).toString()
        }
    }
}


export const getEnDiscusionSkeleton: (
    metric: EnDiscusionMetric,
    time: EnDiscusionTime,
    format: FeedFormatOption
) => GetSkeletonProps = (metric, time, format) => (
    ctx, agent, cursor
) => {
    const limit = 25

    return Effect.tryPromise({
        try: () => getEnDiscusionSkeletonQuery(metric, time, format)(
            ctx, agent, cursor, undefined, limit
        ),
        catch: () => new DBSelectError()
    }).pipe(Effect.map(res => {
        return {
            skeleton: res.map(r => ({post: r.uri})),
            cursor: getNextCursorEnDiscusion(metric, time, format)(cursor, res, limit)
        }
    }))

}


export const getEnDiscusionFeedPipeline = (
    metric: EnDiscusionMetric = defaultEnDiscusionMetric, time: EnDiscusionTime = defaultEnDiscusionTime, format: FeedFormatOption = defaultEnDiscusionFormat): FeedPipelineProps => {
    return {
        getSkeleton: getEnDiscusionSkeleton(metric, time, format),
        debugName: `discusion:${time}:${format}:${metric}`
    }
}


export class ATGetRecordError {
    readonly _tag = "ATGetRecordError"
}


export const addToEnDiscusion = (ctx: AppContext, agent: SessionAgent, uri: string) => {

    return Effect.gen(function* () {
        // TO DO: Pasar a processUpdate
        const {did, collection, rkey} = splitUri(uri)

        const res = yield* Effect.tryPromise({
            try: () => agent.bsky.com.atproto.repo.getRecord({
                repo: did,
                collection,
                rkey
            }),
            catch: () => new ATGetRecordError()
        })

        if (!res.success) return yield* Effect.fail(new ATGetRecordError())

        const record = res.data.value

        if(record.labels) {
            (record.labels as ComAtprotoLabelDefs.SelfLabels).values.push({val: "ca:en discusión"})
        } else {
            record.labels = {
                $type: "com.atproto.label.defs#selfLabels",
                values: [{val: "ca:en discusión"}]
            }
        }

        const ref = yield* Effect.tryPromise({
            try: () => agent.bsky.com.atproto.repo.putRecord({
                repo: did,
                collection,
                rkey,
                record
            }),
            catch: () => "Ocurrió un error al agregar el contenido a En discusión."
        })

        const processor = getRecordProcessor(ctx, collection)
        yield* processor.process([{
            ref: {uri: ref.data.uri, cid: ref.data.cid},
            record: record
        }])

        return {}
    }).pipe(
        Effect.withSpan("addToEnDiscusion", {attributes: {uri}})
    )

}


export const addToEnDiscusionHandler: EffHandler<{
    params: { collection: string, rkey: string }
}, {}> = (
    ctx,
    agent,
    {params}
) => {
    const did = agent.did
    const {collection, rkey} = params
    const uri = getUri(did, shortCollectionToCollection(collection), rkey)
    return addToEnDiscusion(ctx, agent, uri).pipe(
        Effect.catchAll(() => {
            return Effect.fail("Ocurrió un error al agregar el contenido a En discusión.")
        })
    )
}


const removeFromEnDiscusion = (ctx: AppContext, agent: SessionAgent, uri: string) => Effect.gen(function* () {
    // TO DO: Pasar a processUpdate
    const {did, collection, rkey} = splitUri(uri)

    const res = yield* Effect.tryPromise({
        try: () => agent.bsky.com.atproto.repo.getRecord({
            repo: did,
            collection,
            rkey
        }),
        catch: () => new FetchFromBskyError()
    })

    if (!res.success) return yield* Effect.fail(new FetchFromBskyError())

    const record = res.data.value

    const labels = record.labels as ComAtprotoLabelDefs.SelfLabels | undefined

    if (labels) {
        (record.labels as ComAtprotoLabelDefs.SelfLabels).values = labels.values.filter(v => v.val != "ca:en discusión")
    }

    const ref = yield* Effect.tryPromise({
        try: () => agent.bsky.com.atproto.repo.putRecord({
            repo: did,
            collection,
            rkey,
            record: record
        }),
        catch: () => new ATCreateRecordError()
    })

    const processor = getRecordProcessor(ctx, collection)

    yield* processor.process([{
        ref: {uri: ref.data.uri, cid: ref.data.cid},
        record
    }])

    return {}
}).pipe(
    Effect.withSpan("removeFromEnDiscusion", {attributes: {uri}})
)


export const removeFromEnDiscusionHandler: EffHandler<{
    params: { collection: string, rkey: string }
}, {}> = (
    ctx,
    agent,
    {params}
) => {
    const did = agent.did
    const {collection, rkey} = params
    const uri = getUri(did, shortCollectionToCollection(collection), rkey)
    return removeFromEnDiscusion(ctx, agent, uri).pipe(
        Effect.catchAll(() => {
            return Effect.fail("Ocurrió un error al remover el contenido de En discusión.")
        })
    )
}