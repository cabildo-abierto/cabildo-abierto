import {EffHandlerNoAuth} from "#/utils/handler.js";
import {AppBskyActorDefs, ArCabildoabiertoActorDefs, ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api";
import {hydrateProfileView, hydrateProfileViewBasic} from "#/services/hydration/profile.js";
import {cleanText} from "@cabildo-abierto/utils";
import {AppContext} from "#/setup.js";
import {hydrateTopicViewBasicFromUri} from "#/services/wiki/topics.js";
import {
    DataPlane,
    FetchFromBskyError,
    joinMapsInPlace,
    makeDataPlane
} from "#/services/hydration/dataplane.js";
import {Agent} from "#/utils/session-agent.js";
import {stringListIncludes, stringListIsEmpty} from "#/services/dataset/read.js";
import {$Typed} from "@atproto/api";
import {sql} from "kysely";
import {sortByKey, unique} from "@cabildo-abierto/utils";
import {getTopicTitle} from "#/services/wiki/utils.js";
import dice from "fast-dice-coefficient"
import {Effect} from "effect";
import {DBSelectError} from "#/utils/errors.js";


export function searchUsersInCA(ctx: AppContext, query: string, limit: number): Effect.Effect<string[], DBSelectError> {
    const MIN_SIMILARITY_THRESHOLD = 0.1

    return Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("User")
            .select([
                "did",
                eb => sql<number>`GREATEST(similarity(${eb.ref('User.displayName')}::text, ${eb.val(query)}::text),
                similarity(${eb.ref('User.handle')}::text, ${eb.val(query)}::text)
            )`.as('match_score')

            ])
            .where("User.inCA", "=", true)
            .where(eb => eb.or([
                eb(sql<number>`similarity(${eb.ref('User.displayName')}::text, ${eb.val(query)}::text)`, ">=", MIN_SIMILARITY_THRESHOLD),
                eb(sql<number>`similarity(${eb.ref('User.handle')}::text, ${eb.val(query)}::text)`, ">=", MIN_SIMILARITY_THRESHOLD)
            ]))
            .orderBy("match_score desc")
            .limit(limit)
            .execute(),
        catch: () => new DBSelectError()
    }).pipe(
        Effect.map(res => res.map(r => r.did)),
        Effect.withSpan("searchUsersInCA")
    )
}


export const searchUsersInBsky = (
    agent: Agent,
    query: string,
    limit: number
): Effect.Effect<string[], FetchFromBskyError, DataPlane> => Effect.gen(function* () {
    const {data} = yield* Effect.tryPromise({
        try: () => agent.bsky.app.bsky.actor.searchActorsTypeahead({q: query, limit}),
        catch: () => new FetchFromBskyError()
    })

    const dataplane = yield* DataPlane
    const state = dataplane.getState()
    yield* Effect.log(`storing bsky basic users ${data.actors.length}`)
    joinMapsInPlace(
        state.bskyBasicUsers,
        new Map<string, $Typed<AppBskyActorDefs.ProfileViewBasic>>(data.actors.map(a => [a.did, {
            $type: "app.bsky.actor.defs#profileViewBasic", ...a
        }]))
    )

    return data.actors.map(a => a.did)
}).pipe(Effect.withSpan("searchUsersInBsky"))


function combineSearchResults(a: string[], b: string[], limit: number) {
    const usersList: string[] = []
    for(let i = 0; i < limit; i++){
        if(a.length > i){
            if(!usersList.includes(a[i]))
                usersList.push(a[i])
        }
        if(b.length > i) {
            if(!usersList.includes(b[i]))
                usersList.push(b[i])
        }
    }
    return usersList.slice(0, limit)
}


export const searchUsers: EffHandlerNoAuth<{
    params: { query: string }, query?: {limit?: number}
}, ArCabildoabiertoActorDefs.ProfileView[]> = (
    ctx,
    agent,
    {params, query}
) => Effect.provideServiceEffect(Effect.gen(function* () {
    const {query: searchQuery} = params
    const limit = query?.limit ?? 25

    const dataplane = yield* DataPlane

    let [caSearchResults, bskySearchResults] = yield* Effect.all([
        searchUsersInCA(ctx, searchQuery, limit),
        searchUsersInBsky(agent, searchQuery, limit)
    ], {concurrency: "unbounded"})

    let usersList: string[] = combineSearchResults(caSearchResults, bskySearchResults, limit)

    yield* dataplane.fetchProfileViewHydrationData(usersList)

    const users = yield* Effect.all(usersList
        .map(did => hydrateProfileView(ctx, did)))

    return users.filter(x => x != null)
}).pipe(
    Effect.catchAll(() => Effect.fail("Ocurrió un error al buscar.")),
    Effect.withSpan("searchUsers", {attributes: params})
), DataPlane, makeDataPlane(ctx, agent))


export function searchTopicsSkeleton(ctx: AppContext, query: string, categories?: string[], limit?: number) {
    const terms = query.trim().split(/\s+/).filter(Boolean);
    const lastTerm = terms.pop()

    let tsQuery;

    if (!lastTerm) {
        return Effect.succeed([])
    }

    if (terms.length === 0) {
        tsQuery = sql`to_tsquery('public.spanish_simple_unaccent', ${lastTerm} || ':*')`;
    } else {
        const baseQueryString = terms.join(' ');
        const baseQuery = sql`websearch_to_tsquery('public.spanish_simple_unaccent', ${baseQueryString})`;
        const prefixQuery = sql`to_tsquery('public.spanish_simple_unaccent', ${lastTerm} || ':*')`;
        tsQuery = sql`(${baseQuery} && ${prefixQuery})`;
    }

    const tsVector = sql`to_tsvector('public.spanish_simple_unaccent', title)`;

    return Effect.tryPromise({
        try: () => ctx.kysely
            .with('topics_with_titles', (eb) =>
                eb.selectFrom('Topic')
                    .innerJoin('TopicVersion', 'TopicVersion.uri', 'Topic.currentVersionId')
                    .select([
                        'Topic.id',
                        eb => eb.fn.coalesce(
                            eb.cast<string>(eb.fn('jsonb_path_query_first', [
                                eb.ref('TopicVersion.props'),
                                eb.val('$[*] ? (@.name == "Título").value.value')
                            ]), "text"),
                            eb.cast(eb.ref('Topic.id'), 'text')
                        ).as('title'),
                        "TopicVersion.uri",
                        "TopicVersion.props"
                    ])
            )
            .selectFrom('topics_with_titles')
            .select(["id", "title", "uri"])
            .select(eb => [
                sql<number>`ts_rank(${tsVector}, ${tsQuery}, 1)`.as('match_score')
            ])
            .$if(categories != null, qb => qb.where(eb => categories!.includes("Sin categoría") ?
                eb.val(stringListIsEmpty("Categorías")) :
                eb.and(categories!.map(c => stringListIncludes("Categorías", c)))))
            .where(eb => sql`${tsVector} @@ ${tsQuery}`)
            .where(sql<number>`ts_rank(${tsVector}, ${tsQuery}, 1)`, ">", 0)
            .orderBy('match_score', 'desc')
            .limit(limit ?? 20)
            .execute(),
        catch: error => new DBSelectError(error)
    })
}


export const searchTopics: EffHandlerNoAuth<
    {params: {q: string}, query: {c: string | string[] | undefined, cursor?: string, limit?: number}},
    ArCabildoabiertoWikiTopicVersion.TopicViewBasic[]
> = (ctx, agent, {params, query}) => Effect.provideServiceEffect(Effect.gen(function* () {
    let {q} = params;
    const categories = query.c == undefined ? undefined : (typeof query.c == "string" ? [query.c] : query.c);
    const searchQuery = cleanText(q)
    const dataplane = yield* DataPlane

    const topics = yield* searchTopicsSkeleton(
        ctx,
        searchQuery,
        categories,
        20
    )

    yield* dataplane.fetchTopicsBasicByUris(topics.map(t => t.uri))

    return (yield* Effect.all(topics
        .map(t => hydrateTopicViewBasicFromUri(ctx, t.uri))
    )).filter(x => x != null)

}).pipe(
    Effect.catchAll(() => Effect.fail("Ocurrió un error al buscar.")),
    Effect.withSpan("searchTopics", {attributes: params})
), DataPlane, makeDataPlane(ctx, agent))

type UserOrTopicBasic = $Typed<ArCabildoabiertoActorDefs.ProfileViewBasic> | $Typed<ArCabildoabiertoWikiTopicVersion.TopicViewBasic>

function calculateScore(query: string, text: string): number {
    return dice(cleanText(query), cleanText(text))
}

export const searchUsersAndTopics: EffHandlerNoAuth<{
    params: { query: string }, query?: {limit?: number}
}, UserOrTopicBasic[]> = (
    ctx,
    agent,
    {params, query}
) => Effect.provideServiceEffect(Effect.gen(function* () {
    const {query: searchQuery} = params
    const limit = query?.limit ?? 25

    const dataplane = yield* DataPlane

    const limitByKind = Math.ceil(limit / 2)

    const [caUsers, caTopics, bskyUsers] = yield* Effect.all([
        searchUsersInCA(ctx, searchQuery, limitByKind),
        searchTopicsSkeleton(ctx, searchQuery, undefined, limitByKind),
        searchUsersInBsky(agent, searchQuery, limitByKind)
    ], {concurrency: "unbounded"})

    const userDids = unique([...caUsers, ...bskyUsers])
    yield* Effect.all([
        dataplane.fetchProfileViewBasicHydrationData(userDids),
        dataplane.fetchTopicsBasicByUris(caTopics.map(t => t.uri)),
    ], {concurrency: "unbounded"})

    let users: $Typed<ArCabildoabiertoActorDefs.ProfileViewBasic>[] = (yield* Effect.all(
        userDids
        .map(d => hydrateProfileViewBasic(ctx, d))
    ))
        .filter(x => x != null)
        .map(x => ({$type: "ar.cabildoabierto.actor.defs#profileViewBasic", ...x}))

    let topics = (yield* Effect.all(caTopics
        .map(t => hydrateTopicViewBasicFromUri(ctx, t.uri))))
        .filter(x => x != null)

    const score = (x: UserOrTopicBasic) => {
        if(ArCabildoabiertoActorDefs.isProfileViewBasic(x)){
            const d = Math.max(
                calculateScore(x.handle, searchQuery),
                x.displayName ? calculateScore(x.displayName, searchQuery) : -10000
            )
            return d * (x.caProfile ? 1.5 : 1)
        } else {
            return calculateScore(getTopicTitle(x), searchQuery) * 1.5
        }
    }

    users = sortByKey(users, score, (a, b) => b-a)
    topics = sortByKey(topics, score, (a, b) => b-a)

    let data = [
        ...users.slice(0, limitByKind),
        ...topics.slice(0, limitByKind)
    ]

    data = sortByKey(
        data,
        score,
        (a, b) => b-a
    )

    return data
}).pipe(Effect.catchAll(() => Effect.fail("Ocurrió un error al buscar."))), DataPlane, makeDataPlane(ctx, agent))