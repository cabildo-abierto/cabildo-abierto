import {useSearchParams} from "next/navigation";
import {stringToEnum} from "@cabildo-abierto/utils";
import {
    defaultTopicMentionsFormat,
    defaultTopicMentionsMetric,
    defaultTopicMentionsTime
} from "../feed/config/defaults";
import {TopicFeedOption} from "./feed/topic-feed-config";
import {EnDiscusionMetric, EnDiscusionTime, Session} from "@cabildo-abierto/api";


const enDiscusionMetricOptions: EnDiscusionMetric[] = ["Me gustas", "Interacciones", "Popularidad relativa", "Recientes"]
const enDiscusionTimeOptions: EnDiscusionTime[] = ["Último día", "Último mes", "Última semana"]


function topicFeedParamToTopicFeedOption(v: string | undefined, minimized: boolean): TopicFeedOption {
    if (v) {
        return v == "discusion" ? "Discusión" : v == "menciones" ? "Menciones" : "Otros temas"
    } else {
        return "Menciones"
    }
}


export const useTopicFeedParams = (user: Session) => {
    const params = useSearchParams()
    const s = params.get("s")
    const minimized = !s || s == "minimized"

    const defaultMetric = user?.algorithmConfig.topicMentions?.metric ?? defaultTopicMentionsMetric
    const defaultTime = user?.algorithmConfig.topicMentions?.time ?? defaultTopicMentionsTime
    const defaultFormat = user?.algorithmConfig.topicMentions?.format ?? defaultTopicMentionsFormat
    const metric = stringToEnum(params.get("m"), enDiscusionMetricOptions, defaultMetric)
    const time = stringToEnum(params.get("p"), enDiscusionTimeOptions, defaultTime)
    const format = stringToEnum(params.get("formato"), ["Todos", "Artículos"], defaultFormat)

    return {
        metric,
        time,
        format,
        selected: topicFeedParamToTopicFeedOption(params.get("f"), minimized)
    }
}