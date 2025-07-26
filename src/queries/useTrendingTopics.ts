import {useAPI} from "@/queries/utils";
import {TopicViewBasic} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";

export type TimePeriod = "day" | "week" | "month" | "all"

export const useTrendingTopics = (time: TimePeriod) => {
    return useAPI<TopicViewBasic[]>(`/trending-topics/${time}`, ["trending-topics", time])
}