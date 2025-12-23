import {CAHandlerNoAuth} from "#/utils/handler.js";
import {AppBskyActorDefs, ArCabildoabiertoActorDefs, ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api";
import {hydrateProfileViewBasic} from "#/services/hydration/profile.js";
import {cleanText} from "@cabildo-abierto/utils";
import {AppContext} from "#/setup.js";
import {hydrateTopicViewBasicFromUri} from "#/services/wiki/topics.js";
import {Dataplane, joinMaps} from "#/services/hydration/dataplane.js";
import {Agent} from "#/utils/session-agent.js";
import {stringListIncludes, stringListIsEmpty} from "#/services/dataset/read.js";
import {$Typed} from "@atproto/api";
import {sql} from "kysely";
import {sortByKey, unique} from "@cabildo-abierto/utils";
import {getTopicTitle} from "#/services/wiki/utils.js";
import dice from "fast-dice-coefficient"


export async function searchUsersInCA(ctx: AppContext, query: string, limit: number): Promise<string[]> {
    const MIN_SIMILARITY_THRESHOLD = 0.1

    let users = await ctx.kysely
        .selectFrom("User")
        .select([
            "did",
            eb => sql<number>`GREATEST(
                similarity(${eb.ref('User.displayName')}::text, ${eb.val(query)}::text),
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
        .execute()

    return users.map(a => a.did)
}


export async function searchUsersInBsky(agent: Agent, query: string, dataplane: Dataplane, limit: number): Promise<string[]> {
    const {data} = await agent.bsky.app.bsky.actor.searchActorsTypeahead({q: query, limit})

    dataplane.bskyBasicUsers = joinMaps(
        dataplane.bskyBasicUsers,
        new Map<string, $Typed<AppBskyActorDefs.ProfileViewBasic>>(data.actors.map(a => [a.did, {
            $type: "app.bsky.actor.defs#profileViewBasic", ...a
        }]))
    )

    return data.actors.map(a => a.did)
}


export const searchUsers: CAHandlerNoAuth<{
    params: { query: string }, query?: {limit?: number}
}, ArCabildoabiertoActorDefs.ProfileViewBasic[]> = async (ctx, agent, {params, query}) => {
    const {query: searchQuery} = params
    const limit = query?.limit ?? 25

    const dataplane = new Dataplane(ctx, agent)

    let [caSearchResults, bskySearchResults] = await Promise.all([
        searchUsersInCA(ctx, searchQuery, limit),
        searchUsersInBsky(agent, searchQuery, dataplane, limit)
    ])

    let usersList: string[] = []
    for(let i = 0; i < limit; i++){
        if(caSearchResults.length > i){
            if(!usersList.includes(caSearchResults[i])) usersList.push(caSearchResults[i])
        }
        if(bskySearchResults.length > i) {
            if(!usersList.includes(bskySearchResults[i])) usersList.push(bskySearchResults[i])
        }
    }
    usersList = usersList.slice(0, limit)

    await dataplane.fetchProfileViewHydrationData(usersList)

    const users = usersList.map(did => hydrateProfileViewBasic(ctx, did, dataplane))

    return {data: users.filter(x => x != null)}
}


async function searchTopicsSkeleton(ctx: AppContext, query: string, categories?: string[], limit?: number) {
    const terms = query.trim().split(/\s+/).filter(Boolean);
    const lastTerm = terms.pop()

    let tsQuery;

    if (!lastTerm) {
        return []
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

    return await ctx.kysely
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
        .execute()
}


export const searchTopics: CAHandlerNoAuth<{params: {q: string}, query: {c: string | string[] | undefined}}, ArCabildoabiertoWikiTopicVersion.TopicViewBasic[]> = async (ctx, agent, {params, query}) => {
    let {q} = params;
    const categories = query.c == undefined ? undefined : (typeof query.c == "string" ? [query.c] : query.c);
    const searchQuery = cleanText(q)

    let topics: {id: string, title: string, uri: string}[] = []
    try {
        topics = await searchTopicsSkeleton(
            ctx,
            searchQuery,
            categories,
            20
        )
    } catch (error) {
        ctx.logger.pino.error({error, searchQuery, categories}, "error getting search topics skeleton")
        return {error: "Error en la búsqueda."}
    }

    const dataplane = new Dataplane(ctx, agent)
    await dataplane.fetchTopicsBasicByUris(topics.map(t => t.uri))

    const data: ArCabildoabiertoWikiTopicVersion.TopicViewBasic[] = topics
        .map(t => hydrateTopicViewBasicFromUri(ctx, t.uri, dataplane).data)
        .filter(x => x != null)

    return {
        data
    }
}

type UserOrTopicBasic = $Typed<ArCabildoabiertoActorDefs.ProfileViewBasic> | $Typed<ArCabildoabiertoWikiTopicVersion.TopicViewBasic>

function calculateScore(query: string, text: string): number {
    return dice(cleanText(query), cleanText(text))
}

export const searchUsersAndTopics: CAHandlerNoAuth<{
    params: { query: string }, query?: {limit?: number}
}, UserOrTopicBasic[]> = async (ctx, agent, {params, query}) => {
    const {query: searchQuery} = params
    const limit = query?.limit ?? 25

    const dataplane = new Dataplane(ctx, agent)

    const limitByKind = Math.ceil(limit / 2)

    const [caUsers, caTopics, bskyUsers] = await Promise.all([
        searchUsersInCA(ctx, searchQuery, limitByKind),
        searchTopicsSkeleton(ctx, searchQuery, undefined, limitByKind),
        searchUsersInBsky(agent, searchQuery, dataplane, limitByKind)
    ])

    const userDids = unique([...caUsers, ...bskyUsers])
    await Promise.all([
        dataplane.fetchProfileViewBasicHydrationData(userDids),
        dataplane.fetchTopicsBasicByUris(caTopics.map(t => t.uri)),
    ])

    let users: $Typed<ArCabildoabiertoActorDefs.ProfileViewBasic>[] = userDids
        .map(d => hydrateProfileViewBasic(ctx, d, dataplane))
        .filter(x => x != null)
        .map(x => ({$type: "ar.cabildoabierto.actor.defs#profileViewBasic", ...x}))

    let topics = caTopics
        .map(t => hydrateTopicViewBasicFromUri(ctx, t.uri, dataplane).data)
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

    return {data: data}
}