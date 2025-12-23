import {CAHandler} from "#/utils/handler.js";
import {getTrendingTopics} from "#/services/wiki/topics.js";
import {searchTopics} from "#/services/search/search.js";
import {FeedView} from "@cabildo-abierto/api";
import {getTopicTitle} from "#/services/wiki/utils.js";


export const getCustomFeeds: CAHandler<{query: {q?: string}}, FeedView[]> = async  (ctx, agent, {query}) => {

    const q = query?.q

    const res = !q || q.length == 0 ? await agent.bsky.app.bsky.feed.getSuggestedFeeds() : await agent.bsky.app.bsky.unspecced.getPopularFeedGenerators({
        query: q
    })

    if(res.success) {
        return {data: res.data.feeds.map(f => ({
            type: "custom",
            feed: f
        }))}
    }
    return {error: "Ocurrió un error al obtener los muros."}
}


export const getTopicFeeds: CAHandler<{query: {q?: string}}, FeedView[]> = async  (ctx, agent, {query}) => {

    const q = query?.q

    const res = !q || q.length == 0 ?
        await getTrendingTopics(ctx, agent, {params: {time: "week"}}) :
        await searchTopics(ctx, agent, {params: {q}, query: {c: undefined}})

    if(res.error || !res.data) {
        ctx.logger.pino.error({error: res.error}, "error getting topic feeds")
        return {error: "Ocurrió un error al obtener los muros."}
    } else {
        return {
            data: res.data.map(f => {
                return {
                    type: "topic",
                    subtype: "mentions",
                    id: f.id,
                    title: getTopicTitle(f)
                }
            })
        }
    }
}