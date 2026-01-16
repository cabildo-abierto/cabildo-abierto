import {CAHandlerNoAuth} from "#/utils/handler.js";
import {FeedSkeleton, getFeed, GetSkeletonProps} from "#/services/feed/feed.js";
import {AppContext} from "#/setup.js";
import {Agent} from "#/utils/session-agent.js";
import {creationDateSortKey} from "#/services/feed/utils.js";
import {hydrateFeedViewContent} from "#/services/hydration/hydrate.js";
import {listOrderDesc, sortByKey} from "@cabildo-abierto/utils";
import {Dataplane} from "#/services/hydration/dataplane.js";
import {getTopicIdFromTopicVersionUri} from "#/services/wiki/current-version.js";
import {getTopicTitle} from "#/services/wiki/utils.js";
import {getCollectionFromUri, getDidFromUri, getUri} from "@cabildo-abierto/utils";
import {
    ArCabildoabiertoWikiTopicVersion,
    ArCabildoabiertoFeedDefs,
    ArCabildoabiertoEmbedSelectionQuote, defaultTopicMentionsMetric, defaultTopicMentionsTime,
    defaultTopicMentionsFormat
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


const getTopicRepliesSkeleton = async (ctx: AppContext, id: string) => {
    const replies = await ctx.kysely
        .selectFrom("Post")
        .innerJoin("Record", "Record.uri", "Post.uri")
        .innerJoin("Record as Parent", "Parent.uri", "Post.replyToId")
        .innerJoin("TopicVersion", "TopicVersion.uri", "Parent.uri")
        .select([
            "Post.uri",
        ])
        .where("TopicVersion.topicId", "=", id)
        .orderBy("Record.created_at desc")
        .execute()
    return replies.map(r => ({post: r.uri}))
}


const getTopicMentionsSkeletonQuery: (id: string, metric: EnDiscusionMetric, time: EnDiscusionTime, format: FeedFormatOption) => SkeletonQuery<EnDiscusionSkeletonElement> = (id, metric, time, format) => {
    return async (ctx, agent, from, to, limit) => {
        const startDate = metric != "Recientes" ? getEnDiscusionStartDate(time) : new Date(0)
        const collections = format == "Artículos" ? ["ar.cabildoabierto.feed.article"] : ["ar.cabildoabierto.feed.article", "app.bsky.feed.post"]

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
        } else if(metric == "Interacciones"){
            const offsetFrom = from != null ? Number(from)+1 : 0
            const offsetTo = to != null ? Number(to) : undefined
            if(offsetTo != null){
                limit = Math.min(limit, offsetTo - offsetFrom)
            }

            if(limit == 0) return []
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
        } else if(metric == "Popularidad relativa"){
            const offsetFrom = from != null ? Number(from)+1 : 0
            const offsetTo = to != null ? Number(to) : undefined
            if(offsetTo != null){
                limit = Math.min(limit, offsetTo - offsetFrom)
            }

            if(limit == 0) return []

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
        } else if(metric == "Recientes"){
            const offsetFrom = from != null ? new Date(from) : undefined
            const offsetTo = to != null ? new Date(to) : undefined

            if(offsetFrom && offsetTo && offsetFrom.getTime() <= offsetTo.getTime()) return []

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


const getTopicMentionsSkeleton = async (
    ctx: AppContext,
    agent: Agent,
    data: Dataplane,
    id: string,
    cursor: string | undefined,
    metric: EnDiscusionMetric,
    time: EnDiscusionTime,
    format: FeedFormatOption
): Promise<{skeleton: FeedSkeleton, cursor: string | undefined}> => {

    const limit = 25

    const skeleton = await getTopicMentionsSkeletonQuery(
        id, metric, time, format
    )(ctx, agent, cursor, undefined, limit)

    return {
        skeleton: skeleton.map(x => ({post: x.uri})),
        cursor: getNextCursorEnDiscusion(metric, time, format)(cursor, skeleton, limit)
    }
}


export async function getTopicMentionsInTopics(ctx: AppContext, id: string){
    const topics = await ctx.kysely
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
        .execute()

    return topics.map(t => {
        return {
            id: t.topicId,
            title: getTopicTitle({id: t.topicId, props: t.props as ArCabildoabiertoWikiTopicVersion.TopicProp[]})
        }
    })
}


type VoteBasicQueryResult = {
    voteUri: string
    topicVersionUri: string
    topicVersionCreatedAt: Date
    reasonUri: string | null
}


async function getTopicVotesForDiscussion(ctx: AppContext, uri: string): Promise<VoteBasicQueryResult[]> {
    const votes = await ctx.kysely
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
        .execute()
    return votes.map(v => {
        if(v.subjectId && v.subjectCreatedAt) {
            return {
                voteUri: v.uri,
                topicVersionUri: v.subjectId,
                topicVersionCreatedAt: v.subjectCreatedAt,
                reasonUri: v.reasonUri
            }
        }
        return null
    }).filter(x => x != null)
}


function addVotesContextToDiscussionFeed(ctx: AppContext, uri: string, feed: $Typed<ArCabildoabiertoFeedDefs.FeedViewContent>[], votes: VoteBasicQueryResult[]): $Typed<ArCabildoabiertoFeedDefs.FeedViewContent>[] {
    const authorVotingStates = new Map<string, "accept" | "reject">()
    const reasonToVote = new Map<string, VoteBasicQueryResult>()
    votes.forEach(v => {
        if(v.topicVersionUri == uri) {
            const accept = getCollectionFromUri(v.voteUri) == "ar.cabildoabierto.wiki.voteAccept"
            authorVotingStates.set(getDidFromUri(v.voteUri), accept ? "accept" : "reject")
        }
        if(v.reasonUri){
            reasonToVote.set(v.reasonUri, v)
        }
    })

    return feed.map(e => {
        if(!ArCabildoabiertoFeedDefs.isPostView(e.content)){
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


async function hydrateRepliesSkeleton(ctx: AppContext, agent: Agent, skeleton: FeedSkeleton, uri: string){
    const data = new Dataplane(ctx, agent)
    const [votes] = await Promise.all([
        getTopicVotesForDiscussion(ctx, uri),
        data.fetchFeedHydrationData(skeleton),
    ])

    let feed = skeleton
        .map((e) => (hydrateFeedViewContent(ctx, e, data)))
        .filter(x => x != null)

    feed = addVotesContextToDiscussionFeed(ctx, uri, feed, votes)

    return sortByKey(
        feed,
        creationDateSortKey,
        listOrderDesc
    )
}


export const getTopicVersionReplies = async (
    ctx: AppContext, agent: Agent, id: string, uri: string): Promise<{data?: ArCabildoabiertoFeedDefs.FeedViewContent[], error?: string}> => {
    const skeleton = await getTopicRepliesSkeleton(ctx, id)
    const res = await hydrateRepliesSkeleton(
        ctx,
        agent,
        skeleton,
        uri
    )

    return {data: res}
}


export const getTopicFeed: CAHandlerNoAuth<{ params: {kind: "mentions" | "discussion"}, query: { i?: string, did?: string, rkey?: string, cursor?: string, metric?: EnDiscusionMetric, time?: EnDiscusionTime, format?: FeedFormatOption } }, {
    feed: ArCabildoabiertoFeedDefs.FeedViewContent[],
    cursor?: string
}> = async (ctx, agent, {query, params}) => {
    let {i: id, did, rkey, cursor, metric, time, format} = query
    const {kind} = params

    let uri: string | undefined = did && rkey ? getUri(did, "ar.cabildoabierto.wiki.topicVersion", rkey) : undefined
    if(!id){
        if(!did || !rkey){
            return {error: "Se requiere un id o un par did y rkey."}
        } else {
            id = await getTopicIdFromTopicVersionUri(ctx, did, rkey) ?? undefined
            if(!id){
                return {error: "No se encontró esta versión del tema."}
            }
        }
    }

    if(kind == "discussion"){
        if(!uri) {
            const {data, error} = await getTopicCurrentVersionFromDB(ctx, id)
            if(error || !data) {
                return {error: "No se encontró el tema."}
            }
            uri = data
        }
        const replies = await getTopicVersionReplies(ctx, agent, id, uri)
        if(!replies.data) return {error: replies.error}

        return {
            data: {
                feed: replies.data,
                cursor: undefined
            }
        }
    } else if(kind == "mentions"){
        const getSkeleton: GetSkeletonProps = async (ctx, agent, data, cursor) => {
            return await getTopicMentionsSkeleton(
                ctx,
                agent,
                data,
                id,
                cursor,
                metric ?? defaultTopicMentionsMetric,
                time ?? defaultTopicMentionsTime,
                format ?? defaultTopicMentionsFormat
            )
        }

        try {
            return await getFeed({
                ctx,
                agent,
                pipeline: {
                    getSkeleton,
                    debugName: `topic:${metric}:${time}:${format}`
                },
                cursor
            })
        } catch (error) {
            ctx.logger.pino.error({error}, "error getting mentions feed")
            return {error: "Ocurrió un error al obtener el muro."}
        }
    } else {
        return {error: "Solicitud inválida."}
    }
}


export const getTopicMentionsInTopicsFeed: CAHandlerNoAuth<{ query: { i?: string, did?: string, rkey?: string } }, {
    feed: {id: string, title: string}[],
    cursor: string | undefined
}> = async (ctx, agent, {query}) => {
    let {i: id, did, rkey} = query

    if(!id){
        if(!did || !rkey){
            return {error: "Se requiere un id o un par did y rkey."}
        } else {
            id = await getTopicIdFromTopicVersionUri(ctx, did, rkey) ?? undefined
            if(!id){
                return {error: "No se encontró esta versión del tema."}
            }
        }
    }

    const topicMentions = await getTopicMentionsInTopics(ctx, id)

    return {
        data: {
            feed: topicMentions,
            cursor: undefined
        }
    }
}


export const getTopicQuoteReplies: CAHandlerNoAuth<{params: {did: string, rkey: string}}, ArCabildoabiertoFeedDefs.PostView[]> = async (ctx, agent, {params}) => {
    const {did, rkey} = params
    const uri = getUri(did, "ar.cabildoabierto.wiki.topicVersion", rkey)

    const skeleton = (await ctx.kysely
        .selectFrom("Post")
        .where("Post.replyToId", "=", uri)
        .select("uri")
        .execute()).map(p => ({post: p.uri}))

    const hydrated = await hydrateRepliesSkeleton(ctx, agent, skeleton, uri)

    const posts: ArCabildoabiertoFeedDefs.PostView[] = hydrated
        .map(c => c.content)
        .filter(c => ArCabildoabiertoFeedDefs.isPostView(c))
        .filter(c => ArCabildoabiertoEmbedSelectionQuote.isMain(c.embed))

    return {
        data: posts
    }
}