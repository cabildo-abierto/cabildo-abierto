import {EffHandlerNoAuth} from "#/utils/handler.js";
import {EnDiscusionMetric, EnDiscusionTime, FeedFormatOption} from "#/services/feed/inicio/discusion.js";
import {ArCabildoabiertoEmbedSelectionQuote, ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api";
import {
    getCollectionFromUri,
    getDidFromUri,
    getUri,
    isTopicVersion,
    listOrderDesc,
    sortByKey
} from "@cabildo-abierto/utils";
import {Effect} from "effect";
import {getTopicIdFromTopicVersionUri} from "#/services/wiki/current-version.js";
import {getTopicCurrentVersionFromDB} from "#/services/wiki/topics.js";
import {DataPlane, FetchFromBskyError, makeDataPlane} from "#/services/hydration/dataplane.js";
import {DBSelectError} from "#/utils/errors.js";
import {AppContext} from "#/setup.js";
import {FeedSkeleton} from "#/services/feed/feed.js";
import {Agent} from "#/utils/session-agent.js";
import {hydrateThreadViewContent, ThreadSkeleton} from "#/services/hydration/hydrate.js";
import {creationDateSortKey} from "#/services/feed/utils.js";
import {$Typed} from "@atproto/api";
import {ThreadViewContent} from "@cabildo-abierto/api/dist/client/types/ar/cabildoabierto/feed/defs.js";
import {HydrationDataUnavailableError} from "#/services/polls/polls.js";


function buildRootReplySubtree(uri: string, replies: Map<string, string[]>): ThreadSkeleton {
    return {
        post: uri,
        replies: replies.get(uri)?.map(r => buildRootReplySubtree(r, replies)) ?? undefined,
    }
}


function buildThreadRepliesTree(nodes: {uri: string, replyToId: string}[]): ThreadSkeleton["replies"] {
    const m = new Map<string, string[]>()

    for(const n of nodes) {
        m.set(n.replyToId, [...(m.get(n.replyToId) ?? []), n.uri])
    }

    const roots = Array.from(m.keys()).filter(x => isTopicVersion(getCollectionFromUri(x)))

    return roots.flatMap(r => buildRootReplySubtree(r, m).replies ?? [])
}


const getTopicRepliesSkeleton = (ctx: AppContext, id: string): Effect.Effect<ThreadSkeleton["replies"], DBSelectError> => Effect.gen(function* () {

    const subtree = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("Post")
            .innerJoin("Record", "Record.uri", "Post.uri")
            .innerJoin("Record as Parent", "Parent.uri", "Post.rootId")
            .innerJoin("TopicVersion", "TopicVersion.uri", "Parent.uri")
            .select([
                "Post.uri",
                "Post.replyToId"
            ])
            .where("TopicVersion.topicId", "=", id)
            .orderBy("Record.created_at desc")
            .execute(),
        catch: (error) => new DBSelectError(error)
    })

    return buildThreadRepliesTree(subtree
        .map(x => !x.replyToId ? null : {...x, replyToId: x.replyToId})
        .filter(x => x != null))
})


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

function addVotesContextToDiscussionFeed(ctx: AppContext, uri: string, feed: $Typed<ArCabildoabiertoFeedDefs.ThreadViewContent>[], votes: VoteBasicQueryResult[]): $Typed<ArCabildoabiertoFeedDefs.ThreadViewContent>[] {
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

function flattenRepliesSkeleton(skeleton: ThreadSkeleton["replies"]): FeedSkeleton {
    return (skeleton?.flatMap(e => {
        return [{post: e.post}, ...flattenRepliesSkeleton(e.replies ?? []), e.parent ? {post: e.parent.post} : null]
    }) ?? []).filter(x => x != null)
}


const hydrateRepliesSkeleton = (
    ctx: AppContext,
    agent: Agent,
    skeleton: ThreadSkeleton["replies"]
): Effect.Effect<$Typed<ThreadViewContent>[], HydrationDataUnavailableError, DataPlane> => Effect.gen(function* () {
    const res: $Typed<ThreadViewContent>[] = yield* Effect.all(skeleton?.map(s => {
        return hydrateThreadViewContent(ctx, agent, s, true, false)
    }) ?? [])
    return res
})


const getHydratedTopicRepliesSkeleton = (
    ctx: AppContext,
    agent: Agent,
    skeleton: ThreadSkeleton["replies"],
    uri: string
): Effect.Effect<ArCabildoabiertoFeedDefs.ThreadViewContent[], HydrationDataUnavailableError | DBSelectError | FetchFromBskyError, DataPlane> => Effect.gen(function* () {
    const dataplane = yield* DataPlane
    const [votes] = yield* Effect.all([
        getTopicVotesForDiscussion(ctx, uri),
        dataplane.fetchFeedHydrationData(flattenRepliesSkeleton(skeleton)),
    ], {concurrency: "unbounded"})

    let feed = yield* hydrateRepliesSkeleton(ctx, agent, skeleton)

    feed = addVotesContextToDiscussionFeed(ctx, uri, feed, votes)

    return sortByKey(
        feed,
        creationDateSortKey,
        listOrderDesc
    )
})
export const getTopicVersionReplies = (
    ctx: AppContext,
    agent: Agent,
    id: string,
    uri: string
): Effect.Effect<ArCabildoabiertoFeedDefs.ThreadViewContent[], DBSelectError | FetchFromBskyError | HydrationDataUnavailableError, DataPlane> => Effect.gen(function* () {
    const skeleton = yield* getTopicRepliesSkeleton(ctx, id)

    return yield* getHydratedTopicRepliesSkeleton(
        ctx,
        agent,
        skeleton,
        uri
    )
})

export class TopicCurrentVersionNotFoundError {
    readonly _tag = "TopicCurrentVersionNotFoundError"
}

export const getTopicDiscussionHandler: EffHandlerNoAuth<{
    query: {
        i?: string,
        did?: string,
        rkey?: string,
        metric?: EnDiscusionMetric,
        time?: EnDiscusionTime,
        format?: FeedFormatOption
    }
}, ArCabildoabiertoFeedDefs.ThreadViewContent[]> = (ctx, agent, {query}) => {
    let {i: id, did, rkey} = query

    const uri: string | undefined = did && rkey ? getUri(did, "ar.cabildoabierto.wiki.topicVersion", rkey) : undefined

    if (!id && (!did || !rkey)) {
        return Effect.fail("Se requiere un id o un par did y rkey.")
    }

    return Effect.provideServiceEffect(Effect.gen(function* () {
        const topicId = id ?? (yield* getTopicIdFromTopicVersionUri(ctx, did!, rkey!))

        const versionUri = uri ?? (yield* getTopicCurrentVersionFromDB(ctx, topicId)
            .pipe(Effect.catchTag("NotFoundError", () => Effect.fail(new TopicCurrentVersionNotFoundError()))))

        return yield * getTopicVersionReplies(ctx, agent, topicId, versionUri)
    }).pipe(Effect.withSpan("getTopicDiscussion")).pipe(
        Effect.catchTag("HydrationDataUnavailableError", () => Effect.fail("Ocurrió un error al obtener la discusión.")),
        Effect.catchTag("TopicCurrentVersionNotFoundError", () => Effect.fail("No se encontró la versión del tema.")),
        Effect.catchTag("NotFoundError", () => Effect.fail("No se encontró el tema.")),
        Effect.catchTag("FetchFromBskyError", () => Effect.fail("Ocurrió un error al obtener la discusión.")),
        Effect.catchTag("DBSelectError", () => Effect.fail("Ocurrió un error al obtener la discusión."))
    ), DataPlane, makeDataPlane(ctx, agent))
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

        const hydrated = yield* getHydratedTopicRepliesSkeleton(ctx, agent, skeleton, uri)

        const posts: ArCabildoabiertoFeedDefs.PostView[] = hydrated
            .map(c => c.content)
            .filter(c => ArCabildoabiertoFeedDefs.isPostView(c))
            .filter(c => ArCabildoabiertoEmbedSelectionQuote.isView(c.embed))

        return posts
    }).pipe(
        Effect.catchAll(() => Effect.fail("Ocurrió un error al obtener las respuestas con citas.")
        )
    ), DataPlane, makeDataPlane(ctx, agent))