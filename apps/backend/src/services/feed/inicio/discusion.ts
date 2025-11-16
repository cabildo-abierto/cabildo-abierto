import {FeedPipelineProps, GetSkeletonProps} from "#/services/feed/feed.js";
import {CAHandler} from "#/utils/handler.js";
import {AppBskyFeedPost, ArCabildoabiertoFeedArticle} from "@cabildo-abierto/api"
import {isSelfLabels} from "@atproto/api/dist/client/types/com/atproto/label/defs.js";
import {$Typed} from "@atproto/api";
import {sql} from "kysely";
import {
    GetNextCursor,
    getNextFollowingFeedCursor,
    SkeletonQuery
} from "#/services/feed/inicio/following.js";
import {PostRecordProcessor} from "#/services/sync/event-processing/post.js";
import {ArticleRecordProcessor} from "#/services/sync/event-processing/article.js";


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

export type EnDiscusionSkeletonElement = {uri: string, createdAt: Date}

const getEnDiscusionSkeletonQuery: (metric: EnDiscusionMetric, time: EnDiscusionTime, format: FeedFormatOption) => SkeletonQuery<EnDiscusionSkeletonElement> = (metric, time, format) => {
    return async (ctx, agent, from, to, limit) => {
        const startDate = metric != "Recientes" ? getEnDiscusionStartDate(time) : new Date(0)
        const collections = format == "Artículos" ?
            ["ar.cabildoabierto.feed.article"] :
            ["ar.cabildoabierto.feed.article", "app.bsky.feed.post"]
        const label = 'ca:en discusión'

        if(limit == 0){
            return []
        }

        if(metric == "Me gustas"){
            const offsetFrom = from != null ? Number(from)+1 : 0
            const offsetTo = to != null ? Number(to) : undefined
            if(offsetTo != null){
                limit = Math.min(limit, offsetTo - offsetFrom)
            }

            if(limit == 0) return []

            const res = await ctx.kysely
                .selectFrom('Content')
                .innerJoin('Record', 'Record.uri', 'Content.uri')
                .where('Record.collection', 'in', collections)
                .where(sql<boolean>`"Content"."selfLabels" @> ARRAY[${label}]::text[]`)
                .where("Record.created_at", ">", startDate)
                .select([
                    "Content.uri",
                    "Content.created_at as createdAt"
                ])
                .orderBy(["likesScore desc", "Content.created_at desc"])
                .limit(limit)
                .offset(offsetFrom)
                .execute()

            return res.map((r, i) => ({
                ...r,
                score: -(i + offsetFrom)
            }))
        } else if(metric == "Interacciones"){
            const offsetFrom = from != null ? Number(from)+1 : 0
            const offsetTo = to != null ? Number(to) : undefined
            if(offsetTo != null){
                limit = Math.min(limit, offsetTo - offsetFrom)
            }

            if(limit == 0) return []
            const res = await ctx.kysely
                .selectFrom('Record')
                .where('Record.collection', 'in', collections)
                .where("Record.created_at", ">", startDate)
                .innerJoin('Content', 'Record.uri', 'Content.uri')
                .where(sql<boolean>`"Content"."selfLabels" @> ARRAY[${label}]::text[]`)
                .select([
                    "Content.uri",
                    "Content.created_at as createdAt"
                ])
                .where("interactionsScore", "is not", null)
                .orderBy(["interactionsScore desc", "Content.created_at desc"])
                .limit(limit)
                .offset(offsetFrom)
                .execute()

            return res.map((r, i) => ({
                ...r,
                score: -(i + offsetFrom)
            }))
        } else if(metric == "Popularidad relativa"){
            const offsetFrom = from != null ? Number(from)+1 : 0
            const offsetTo = to != null ? Number(to) : undefined
            if(offsetTo != null){
                limit = Math.min(limit, offsetTo - offsetFrom)
            }

            if(limit == 0) return []

            const res = await ctx.kysely.selectFrom('Record')
                .where('Record.collection', 'in', collections)
                .where("Record.created_at", ">", startDate)
                .innerJoin('Content', 'Record.uri', 'Content.uri')
                .where(sql<boolean>`"Content"."selfLabels" @> ARRAY[${label}]::text[]`)
                .select(eb => [
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
        } else if(metric == "Recientes"){
            const offsetFrom = from != null ? new Date(from) : undefined
            const offsetTo = to != null ? new Date(to) : undefined

            if(offsetFrom && offsetTo && offsetFrom.getTime() <= offsetTo.getTime()) return []

            const res = await ctx.kysely.with("EnDiscusionContent", eb => eb.selectFrom('Record')
                .where('Record.collection', 'in', collections)
                .innerJoin('Content', 'Record.uri', 'Content.uri')
                .where(sql<boolean>`"Content"."selfLabels" @> ARRAY[${label}]::text[]`)
                .orderBy("Record.authorId")
                .orderBy("Record.created_at desc")
                .distinctOn("Record.authorId")
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
        if(metric == "Recientes"){
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
            if(skeleton.length < limit) return undefined
            return (cur - 1 + skeleton.length).toString()
        }
    }
}


export const getEnDiscusionSkeleton: (metric: EnDiscusionMetric, time: EnDiscusionTime, format: FeedFormatOption) => GetSkeletonProps = (metric, time, format) => async (
    ctx, agent, data, cursor
) => {
    const limit = 25

    const res = await getEnDiscusionSkeletonQuery(metric, time, format)(
        ctx, agent, cursor, undefined, limit
    )

    return {
        skeleton: res.map(r => ({post: r.uri})),
        cursor: getNextCursorEnDiscusion(metric, time, format)(cursor, res, limit)
    }
}


export const getEnDiscusionFeedPipeline = (
    metric: EnDiscusionMetric = "Me gustas", time: EnDiscusionTime = "Último día", format: FeedFormatOption = "Todos"): FeedPipelineProps => {
    return {
        getSkeleton: getEnDiscusionSkeleton(metric, time, format)
    }
}


export const addToEnDiscusion: CAHandler<{
    params: { collection: string, rkey: string }
}, {}> = async (ctx, agent, {params}) => {
    // TO DO: Pasar a processUpdate
    const {collection, rkey} = params
    const did = agent.did

    const res = await agent.bsky.com.atproto.repo.getRecord({
        repo: did,
        collection,
        rkey
    })

    if (!res.success) {
        return {error: "No se pudo agregar a en discusión."}
    }

    const record = res.data.value

    const validatePost = AppBskyFeedPost.validateRecord(record)
    const validateArticle = ArCabildoabiertoFeedArticle.validateRecord(record)

    let validRecord: $Typed<AppBskyFeedPost.Record> | $Typed<ArCabildoabiertoFeedArticle.Record> | undefined
    if (validatePost.success) {
        validRecord = {...validatePost.value, $type: "app.bsky.feed.post"}
    } else if (validateArticle.success) {
        validRecord = {...validateArticle.value, $type: "ar.cabildoabierto.feed.article"}
    }

    if (validRecord) {
        if (validRecord.labels && isSelfLabels(validRecord.labels)) {
            validRecord.labels.values.push({val: "ca:en discusión"})
        } else if (!validRecord.labels) {
            validRecord.labels = {
                $type: "com.atproto.label.defs#selfLabels",
                values: [{val: "ca:en discusión"}]
            }
        }

        const ref = await agent.bsky.com.atproto.repo.putRecord({
            repo: did,
            collection,
            rkey,
            record: validRecord
        })

        if (ArCabildoabiertoFeedArticle.isRecord(validRecord)) {
            await new ArticleRecordProcessor(ctx).processValidated([{ref: {uri: ref.data.uri, cid: ref.data.cid}, record: validRecord}])
        } else {
            await new PostRecordProcessor(ctx).processValidated([{ref: {uri: ref.data.uri, cid: ref.data.cid}, record: validRecord}])
        }
    } else {
        return {error: "No se pudo agregar a en discusión."}
    }

    return {data: {}}
}


export const removeFromEnDiscusion: CAHandler<{
    params: { collection: string, rkey: string }
}, {}> = async (ctx, agent, {params}) => {
    // TO DO: Pasar a processUpdate
    const {collection, rkey} = params
    const did = agent.did

    const res = await agent.bsky.com.atproto.repo.getRecord({
        repo: did,
        collection,
        rkey
    })

    if (!res.success) {
        return {error: "No se pudo remover de en discusión."}
    }

    const record = res.data.value

    const validatePost = AppBskyFeedPost.validateRecord(record)
    const validateArticle = ArCabildoabiertoFeedArticle.validateRecord(record)

    let validRecord: AppBskyFeedPost.Record | ArCabildoabiertoFeedArticle.Record | undefined
    if (validatePost.success) {
        validRecord = validatePost.value
    } else if (validateArticle.success) {
        validRecord = validateArticle.value
    }

    if (validRecord) {
        if (validRecord.labels && isSelfLabels(validRecord.labels)) {
            validRecord.labels.values = validRecord.labels.values.filter(v => v.val != "ca:en discusión")
        }

        const ref = await agent.bsky.com.atproto.repo.putRecord({
            repo: did,
            collection,
            rkey,
            record: validRecord
        })

        if (ArCabildoabiertoFeedArticle.isRecord(validRecord)) {
            await new ArticleRecordProcessor(ctx).process([{ref: {uri: ref.data.uri, cid: ref.data.cid}, record: validRecord}])
        } else if(AppBskyFeedPost.isRecord(validRecord)) {
            await new PostRecordProcessor(ctx).process([{ref: {uri: ref.data.uri, cid: ref.data.cid}, record: validRecord}])
        }
    } else {
        return {error: "No se pudo remover de en discusión."}
    }

    return {data: {}}
}