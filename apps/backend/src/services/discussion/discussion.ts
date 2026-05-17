import {EffHandlerNoAuth} from "#/utils/handler.js";
import {ArCabildoabiertoEmbedSelectionQuote, ArCabildoabiertoWikiComment, ArCabildoabiertoWikiDefs} from "@cabildo-abierto/api";
import {
    getCollectionFromUri,
    getUri,
    isTopicVersion,
    listOrderDesc,
    sortByKey
} from "@cabildo-abierto/utils";
import {Effect} from "effect";
import {getTopicIdFromTopicVersionUri} from "#/services/wiki/current-version.js";
import {getTopicCurrentVersionFromDB} from "#/services/wiki/topic.js";
import {DataPlane, FetchFromBskyError, makeDataPlane} from "#/services/hydration/dataplane.js";
import {DBSelectError} from "#/utils/errors.js";
import {AppContext} from "#/setup.js";
import {Agent} from "#/utils/session-agent.js";
import {hydrateThreadViewContent, ThreadSkeleton} from "#/services/hydration/hydrate.js";
import {$Typed} from "@atproto/api";
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
            .selectFrom("Comment")
            .innerJoin("Record", "Record.uri", "Comment.uri")
            .innerJoin("Record as Parent", "Parent.uri", "Comment.rootId")
            .innerJoin("TopicVersion", "TopicVersion.uri", "Parent.uri")
            .select([
                "Comment.uri",
                "Comment.replyToId"
            ])
            .where("TopicVersion.topicId", "=", id)
            .orderBy("Record.createdAt desc")
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
}

function getTopicVotesForDiscussion(ctx: AppContext, uri: string): Effect.Effect<VoteBasicQueryResult[], DBSelectError> {
    return Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("Reaction")
            .innerJoin("Record", "Record.uri", "Reaction.uri")
            .innerJoin("Record as SubjectRecord", "SubjectRecord.uri", "Reaction.subjectId")
            .where("Record.collection", "in", ["ar.cabildoabierto.wiki.vote"])
            .where("Reaction.subjectId", "=", uri)
            .select([
                "Reaction.uri",
                "Reaction.subjectId",
                "SubjectRecord.createdAt as subjectCreatedAt"
            ])
            .execute(),
        catch: (error) => new DBSelectError(error)
    }).pipe(Effect.map(votes => {
        return votes.map(v => {
            if (v.subjectId && v.subjectCreatedAt) {
                return {
                    voteUri: v.uri,
                    topicVersionUri: v.subjectId,
                    topicVersionCreatedAt: v.subjectCreatedAt
                }
            }
            return null
        }).filter(x => x != null)
    }))
}


const hydrateRepliesSkeleton = (
    ctx: AppContext,
    agent: Agent,
    skeleton: ThreadSkeleton["replies"]
): Effect.Effect<$Typed<ArCabildoabiertoWikiDefs.ThreadViewContent>[], HydrationDataUnavailableError, DataPlane> => Effect.gen(function* () {
    const res: $Typed<ArCabildoabiertoWikiDefs.ThreadViewContent>[] = yield* Effect.all(skeleton?.map(s => {
        return hydrateThreadViewContent(ctx, agent, s, true, false)
    }) ?? [])
    return res
})


const getHydratedTopicRepliesSkeleton = (
    ctx: AppContext,
    agent: Agent,
    skeleton: ThreadSkeleton["replies"],
    uri: string
): Effect.Effect<ArCabildoabiertoWikiDefs.ThreadViewContent[], HydrationDataUnavailableError | DBSelectError | FetchFromBskyError, DataPlane> => Effect.gen(function* () {
    /*
    const dataplane = yield* DataPlane
    const [votes] = yield* Effect.all([
        getTopicVotesForDiscussion(ctx, uri),
        dataplane.fetchFeedHydrationData(flattenRepliesSkeleton(skeleton)),
    ], {concurrency: "unbounded"})*/

    let feed = yield* hydrateRepliesSkeleton(ctx, agent, skeleton)

    //feed = addVotesContextToDiscussionFeed(ctx, uri, feed, votes)

    function creationDateSortKey(c: ArCabildoabiertoWikiDefs.ThreadViewContent): number[] {
        return [0]
    }

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
): Effect.Effect<ArCabildoabiertoWikiDefs.ThreadViewContent[], DBSelectError | FetchFromBskyError | HydrationDataUnavailableError, DataPlane> => Effect.gen(function* () {
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

export type TopicDiscussionMetric = ""
export type TopicDiscussionTime = ""

export const getTopicDiscussionHandler: EffHandlerNoAuth<{
    query: {
        i?: string,
        did?: string,
        rkey?: string,
        metric?: TopicDiscussionMetric,
        time?: TopicDiscussionTime
    }
}, ArCabildoabiertoWikiDefs.ThreadViewContent[]> = (ctx, agent, {query}) => {
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
}, ArCabildoabiertoWikiComment.View[]> = (ctx, agent, {params}) =>
    Effect.provideServiceEffect(Effect.gen(function* () {
        const {did, rkey} = params
        const uri = getUri(did, "ar.cabildoabierto.wiki.topicVersion", rkey)

        const skeleton = (yield* Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("Comment")
                .where("Comment.replyToId", "=", uri)
                .select("uri")
                .execute(),
            catch: (error) => new DBSelectError(error)
        })).map(p => ({post: p.uri}))

        const hydrated = yield* getHydratedTopicRepliesSkeleton(ctx, agent, skeleton, uri)

        const posts: ArCabildoabiertoWikiComment.View[] = hydrated
            .map(c => c.content)
            .filter(c => ArCabildoabiertoWikiComment.isView(c))
            .filter(c => ArCabildoabiertoEmbedSelectionQuote.isView(c.embed))

        return posts
    }).pipe(
        Effect.catchAll(() => Effect.fail("Ocurrió un error al obtener las respuestas con citas.")
        )
    ), DataPlane, makeDataPlane(ctx, agent))