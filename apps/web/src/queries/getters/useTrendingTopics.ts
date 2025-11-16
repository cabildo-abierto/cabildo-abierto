import {useAPI} from "@/components/utils/react/queries";
import {ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api"

export type TimePeriod = "day" | "week" | "month" | "all"

export const useTrendingTopics = (time: TimePeriod) => {
    return useAPI<ArCabildoabiertoWikiTopicVersion.TopicViewBasic[]>(`/trending-topics/${time}`, ["trending-topics", time])
}