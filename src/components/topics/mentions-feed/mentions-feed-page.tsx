import {useTopicPageParams} from "@/components/topics/topic/topic-page";
import {get} from "@/utils/fetch";
import {GetFeedOutput} from "@/lib/types";
import {useMemo} from "react";
import FeedViewContentFeed from "@/components/feed/feed/feed-view-content-feed";
import {ArCabildoabiertoFeedDefs} from "@/lex-api";
import {useTopicFeedParams} from "@/components/topics/topic/use-topic-feed-params";
import {useSession} from "@/queries/getters/useSession";


export const MentionsFeedPage = () => {
    const {topicId} = useTopicPageParams()
    const {user} = useSession()
    const {metric, time, format} = useTopicFeedParams(user)

    async function getMentionsFeed(cursor: string) {
        return await get<GetFeedOutput<ArCabildoabiertoFeedDefs.FeedViewContent>>(
            `/topic-feed/mentions?i=${encodeURIComponent(topicId)}&metric=${metric}&time=${time}&format=${format}${cursor ? `&cursor=${cursor}` : ""}`
        )
    }

    return useMemo(() => {
        return <FeedViewContentFeed
            queryKey={["topic-feed", topicId, "mentions", metric, time, format]}
            getFeed={getMentionsFeed}
            onClickQuote={() => {
            }}
            noResultsText={"El tema todavía no fue mencionado."}
            endText={"Fin del feed."}
        />
    }, [metric, time, format, topicId])
}