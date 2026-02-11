import {EffHandlerNoAuth} from "#/utils/handler.js";
import {
    FeedPipelineProps,
    FeedSkeleton,
    getFeed,
    GetSkeletonError,
    GetSkeletonOutput,
    GetSkeletonProps
} from "#/services/feed/feed.js";
import {AppContext} from "#/setup.js";
import {Agent} from "#/utils/session-agent.js";
import {creationDateSortKey} from "#/services/feed/utils.js";
import {hydrateFeedViewContent} from "#/services/hydration/hydrate.js";
import {listOrderDesc, sortByKey} from "@cabildo-abierto/utils";
import {getTopicIdFromTopicVersionUri} from "#/services/wiki/current-version.js";
import {getTopicTitle} from "#/services/wiki/utils.js";
import {getCollectionFromUri, getDidFromUri, getUri} from "@cabildo-abierto/utils";
import {
    ArCabildoabiertoWikiTopicVersion,
    ArCabildoabiertoFeedDefs,
    ArCabildoabiertoEmbedSelectionQuote, defaultTopicMentionsMetric, defaultTopicMentionsTime,
    defaultTopicMentionsFormat, GetFeedOutput
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
import {getTopicCurrentVersionFromDB} from "#/services/wiki/topics.js";
import {$Typed} from "@atproto/api";
import {Effect} from "effect";
import {DataPlane, FetchFromBskyError, makeDataPlane} from "#/services/hydration/dataplane.js";

import {DBSelectError} from "#/utils/errors.js";


const getTopicRepliesSkeleton = (ctx: AppContext, id: string): Effect.Effect<FeedSkeleton, DBSelectError> => {
    return Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("Post")
            .innerJoin("Record", "Record.uri", "Post.uri")
            .innerJoin("Record as Parent", "Parent.uri", "Post.replyToId")
            .innerJoin("TopicVersion", "TopicVersion.uri", "Parent.uri")
            .select([
                "Post.uri",
            ])
            .where("TopicVersion.topicId", "=", id)
            .orderBy("Record.created_at desc")
            .execute(),
        catch: () => new DBSelectError()
    }).pipe(
        Effect.map(replies => replies.map(r => ({post: r.uri}))),
    Effect.withSpan("getTopicRepliesSkeleton")
    )
}


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

            const t1 = Date.now()

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

            const t2 = Date.now()

            ctx.logger.logTimes("topic mentions skeleton", [t1, t2], {
                id, collections, offsetFrom, offsetTo, limit
            })

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
        catch: () => new DBSelectError()
    }).pipe(Effect.map(skeleton => {
        return {
            skeleton: skeleton.map(x => ({post: x.uri})),
            cursor: getNextCursorEnDiscusion(metric, time, format)(cursor, skeleton, limit)
        }
    }))
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


type VoteBasicQueryResult = {
    voteUri: string
    topicVersionUri: string
    topicVersionCreatedAt: Date
    reasonUri: string | null
}


function getTopicVotesForDiscussion(ctx: AppContext, uri: string): Effect.Effect<VoteBasicQueryResult[], DBSelectError> {
    return Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("Reaction")
            .innerJoin("Record", "Record.uri", "Reaction.uri")
            .innerJoin("Record as SubjectRecord", "SubjectRecord.uri", "Reaction.subjectId")
            .where("Record.collection", "in", ["ar.cabildoabierto.wiki.voteAccept", "ar.cabildoabierto.wiki.voteReject"])
            .where("Reaction.subjectId", "=", uri)
            .leftJoin("VoteReject", "VoteReject.uri", "Reaction.uri")
            .leftJoin("Post as Reason", "Reason.uri", "VoteReject.reasonId")
            .select([
                "Reaction.uri",
                "Reaction.subjectId",
                "SubjectRecord.created_at_tz as subjectCreatedAt",
                "Reason.uri as reasonUri"
            ])
            .execute(),
        catch: () => new DBSelectError()
    }).pipe(Effect.map(votes => {
        return votes.map(v => {
            if (v.subjectId && v.subjectCreatedAt) {
                return {
                    voteUri: v.uri,
                    topicVersionUri: v.subjectId,
                    topicVersionCreatedAt: v.subjectCreatedAt,
                    reasonUri: v.reasonUri
                }
            }
            return null
        }).filter(x => x != null)
    }))
}


function addVotesContextToDiscussionFeed(ctx: AppContext, uri: string, feed: $Typed<ArCabildoabiertoFeedDefs.FeedViewContent>[], votes: VoteBasicQueryResult[]): $Typed<ArCabildoabiertoFeedDefs.FeedViewContent>[] {
    const authorVotingStates = new Map<string, "accept" | "reject">()
    const reasonToVote = new Map<string, VoteBasicQueryResult>()
    votes.forEach(v => {
        if (v.topicVersionUri == uri) {
            const accept = getCollectionFromUri(v.voteUri) == "ar.cabildoabierto.wiki.voteAccept"
            authorVotingStates.set(getDidFromUri(v.voteUri), accept ? "accept" : "reject")
        }
        if (v.reasonUri) {
            reasonToVote.set(v.reasonUri, v)
        }
    })

    return feed.map(e => {
        if (!ArCabildoabiertoFeedDefs.isPostView(e.content)) {
            return e
        } else {
            const reason = reasonToVote.get(e.content.uri)
            const authorState = authorVotingStates.get(e.content.author.did)
            // información de qué voto está justificando este post
            const voteContext: ArCabildoabiertoFeedDefs.PostView["voteContext"] = {
                authorVotingState: authorState ?? "none",
                vote: reason ? {
                    uri: reason.voteUri,
                    subject: reason.topicVersionUri,
                    subjectCreatedAt: reason.topicVersionCreatedAt.toISOString()
                } : undefined
            }

            return {
                ...e,
                content: {
                    ...e.content,
                    voteContext
                }
            }
        }
    })
}


const getHydratedRepliesFromSkeleton = (
    ctx: AppContext,
    agent: Agent,
    skeleton: FeedSkeleton,
    uri: string
): Effect.Effect<ArCabildoabiertoFeedDefs.FeedViewContent[], DBSelectError | FetchFromBskyError, DataPlane> =>
    Effect.gen(function* () {
        const dataplane = yield* DataPlane
        const [votes] = yield* Effect.all([
            getTopicVotesForDiscussion(ctx, uri),
            dataplane.fetchFeedHydrationData(skeleton),
        ], {concurrency: "unbounded"})

        let feed = (yield* Effect.all(skeleton
            .map((e) => (hydrateFeedViewContent(ctx, agent, e)))))
            .filter(x => x != null)

        feed = addVotesContextToDiscussionFeed(ctx, uri, feed, votes)

        return sortByKey(
            feed,
            creationDateSortKey,
            listOrderDesc
        )
    }).pipe(Effect.withSpan("getHydratedRepliesFromSkeleton", {attributes: {uri}}))


export const getTopicVersionReplies = (
    ctx: AppContext,
    agent: Agent,
    id: string,
    uri: string
): Effect.Effect<ArCabildoabiertoFeedDefs.FeedViewContent[], DBSelectError | FetchFromBskyError, DataPlane> => {
    return getTopicRepliesSkeleton(ctx, id).pipe(
        Effect.flatMap(skeleton => getHydratedRepliesFromSkeleton(
            ctx,
            agent,
            skeleton,
            uri
        ))
    )
}


export class TopicCurrentVersionNotFoundError {
    readonly _tag = "TopicCurrentVersionNotFoundError"
}


export const getTopicDiscussion: EffHandlerNoAuth<{
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
    let {i: id, did, rkey} = query

    const uri: string | undefined = did && rkey ? getUri(did, "ar.cabildoabierto.wiki.topicVersion", rkey) : undefined

    if (!id && (!did || !rkey)) {
        return Effect.fail("Se requiere un id o un par did y rkey.")
    }

    return Effect.provideServiceEffect(Effect.gen(function* () {
        const topicId = id ?? (yield* getTopicIdFromTopicVersionUri(ctx, did!, rkey!))

        const versionUri = uri ?? (yield* getTopicCurrentVersionFromDB(ctx, topicId)
            .pipe(Effect.catchTag("NotFoundError", () => Effect.fail(new TopicCurrentVersionNotFoundError()))))

        const replies = yield* getTopicVersionReplies(ctx, agent, topicId, versionUri)
        return {
            feed: replies,
            cursor: undefined
        }
    }).pipe(Effect.withSpan("getTopicDiscussion", {attributes: {id, did, rkey}})).pipe(
        Effect.catchTag("TopicCurrentVersionNotFoundError", () => Effect.fail("No se encontró la versión del tema.")),
        Effect.catchTag("NotFoundError", () => Effect.fail("No se encontró el tema.")),
        Effect.catchTag("FetchFromBskyError", () => Effect.fail("Ocurrió un error al obtener la discusión.")),
        Effect.catchTag("DBSelectError", () => Effect.fail("Ocurrió un error al obtener la discusión."))
    ), DataPlane, makeDataPlane(ctx, agent))
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


export const getTopicQuoteReplies: EffHandlerNoAuth<{
    params: { did: string, rkey: string }
}, ArCabildoabiertoFeedDefs.PostView[]> = (ctx, agent, {params}) =>
    Effect.provideServiceEffect(Effect.gen(function* () {
    const {did, rkey} = params
    const uri = getUri(did, "ar.cabildoabierto.wiki.topicVersion", rkey)

    const skeleton = (yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("Post")
            .where("Post.replyToId", "=", uri)
            .select("uri")
            .execute(),
        catch: () => new DBSelectError()
    })).map(p => ({post: p.uri}))

    const hydrated = yield* getHydratedRepliesFromSkeleton(ctx, agent, skeleton, uri)

    const posts: ArCabildoabiertoFeedDefs.PostView[] = hydrated
        .map(c => c.content)
        .filter(c => ArCabildoabiertoFeedDefs.isPostView(c))
        .filter(c => ArCabildoabiertoEmbedSelectionQuote.isView(c.embed))

    return posts
}).pipe(
    Effect.catchAll(() => Effect.fail("Ocurrió un error al obtener las respuestas con citas.")
    )
), DataPlane, makeDataPlane(ctx, agent))


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