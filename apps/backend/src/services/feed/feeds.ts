import {CAHandler} from "#/utils/handler.js";
import {getTopics} from "#/services/wiki/topics.js";
import {searchTopics} from "#/services/search/search.js";
import {FeedView, GetFeedOutput} from "@cabildo-abierto/api";
import {getTopicSynonyms, getTopicTitle} from "#/services/wiki/utils.js";
import {Agent} from "#/utils/session-agent.js";
import {AppBskyFeedDefs} from "@atproto/api";


const murosRecomendados: string[] = [
    "at://did:plc:2nmad7f6xvkdyys2i42673or/app.bsky.feed.generator/aaaknhd6vtsp4", // cielito de argentina
    "at://did:plc:k6dtgnln2icoq4z4i6kuhr5w/app.bsky.feed.generator/aaaky3azfmkum", // noticias de argentina
    "at://did:plc:jupasj2qzpxnulq2xa7evmmh/app.bsky.feed.generator/argentina", // Argentina
    "at://did:plc:5u4creriyluprnxzvwaltmrm/app.bsky.feed.generator/gamedevarg", // Game Dev Argentina
]


async function getSuggestedFeeds(agent: Agent, cursor?: string): Promise<{
    feeds: AppBskyFeedDefs.GeneratorView[]
    cursor?: string
}> {
    const [suggested, recomendados] = await Promise.all([
        agent.bsky.app.bsky.feed.getSuggestedFeeds({cursor}),
        !cursor ? agent.bsky.app.bsky.feed.getFeedGenerators({
            feeds: murosRecomendados
        }) : null
    ])

    return {
        feeds: [
            ...(recomendados?.data.feeds ?? []),
            ...suggested.data.feeds
        ],
        cursor: suggested.data.cursor
    }
}


export const getCustomFeeds: CAHandler<{
    query: { q?: string, limit?: number, cursor?: string }
}, GetFeedOutput<FeedView>> = async (ctx, agent, {query}) => {

    const q = query?.q

    ctx.logger.pino.info({query}, "gettin custom feeds")

    const feeds = !q || q.length == 0 ?
        await getSuggestedFeeds(agent, query?.cursor) :
        (await agent.bsky.app.bsky.unspecced.getPopularFeedGenerators({
            query: q
        })).data

    const feed: FeedView[] = feeds.feeds.map(f => ({
        type: "custom",
        feed: f
    }))

    return {
        data: {
            feed,
            cursor: feeds.cursor
        },
    }
}


export const getTopicFeeds: CAHandler<{
    query: { q?: string, c?: string | string[], cursor?: string, limit?: number }
}, FeedView[]> = async (ctx, agent, {query}) => {
    const q = query?.q
    const limit = query?.limit ?? 50

    const categories = typeof query?.c == "string" ? [query.c] : query?.c ?? []

    const res = !q || q.length == 0 ?
        await getTopics(ctx, categories, "popular", "week") :
        await searchTopics(ctx, agent, {params: {q}, query: {c: query?.c, cursor: query?.cursor, limit}})

    if (res.error || !res.data) {
        ctx.logger.pino.error({error: res.error}, "error getting topic feeds")
        return {error: "Ocurrió un error al obtener los muros."}
    } else {
        return {
            data: res.data.map(f => {
                return {
                    type: "topic",
                    subtype: "mentions",
                    id: f.id,
                    title: getTopicTitle(f),
                    synonyms: getTopicSynonyms(f)
                }
            })
        }
    }
}