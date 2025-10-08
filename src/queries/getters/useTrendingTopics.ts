import {useAPI} from "@/queries/utils";
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api"

export type TimePeriod = "day" | "week" | "month" | "all"

export const useTrendingTopics = (time: TimePeriod) => {
    return useAPI<ArCabildoabiertoWikiTopicVersion.TopicViewBasic[]>(`/trending-topics/${time}`, ["trending-topics", time])
}