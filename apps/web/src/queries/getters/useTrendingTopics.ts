import {useAPI} from "@/components/utils/react/queries";
import {ArCabildoabiertoWikiTopic} from "@cabildo-abierto/api"

export type TimePeriod = "day" | "week" | "month" | "all"

export const useTrendingTopics = (time: TimePeriod) => {
    return useAPI<ArCabildoabiertoWikiTopic.TopicViewBasic[]>(`/trending-topics/${time}`, ["trending-topics", time])
}