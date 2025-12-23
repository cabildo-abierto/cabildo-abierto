import {
    MainFeedOption
} from "@/lib/types";
import {EnDiscusionMetric, EnDiscusionTime, FeedFormatOption, FollowingFeedFilter} from "@cabildo-abierto/api";


export const defaultTopicMentionsMetric: EnDiscusionMetric = "Recientes"
export const defaultTopicMentionsTime: EnDiscusionTime = "Último mes"
export const defaultTopicMentionsFormat: FeedFormatOption = "Todos"

export const defaultEnDiscusionMetric: EnDiscusionMetric = "Recientes"
export const defaultEnDiscusionTime: EnDiscusionTime = "Último año"
export const defaultEnDiscusionFormat: FeedFormatOption = "Todos"

export function mainFeedOptionToSearchParam(v: MainFeedOption) {
    if (v == "Siguiendo") return "siguiendo"
    if (v == "En discusión") return "discusion"
    if (v == "Descubrir") return "descubrir"
    return "siguiendo"
}

export function searchParamToMainFeedOption(v: string): MainFeedOption {
    if (v == "siguiendo") return "Siguiendo"
    if (v == "discusion") return "En discusión"
    if (v == "descubrir") return "Descubrir"
    return "Siguiendo"
}

export const enDiscusionMetricOptions: EnDiscusionMetric[] = ["Me gustas", "Interacciones", "Popularidad relativa", "Recientes"]
export const enDiscusionTimeOptions: EnDiscusionTime[] = ["Último día", "Última semana", "Último mes", "Último año"]
export const feedFormatOptions: FeedFormatOption[] = ["Todos", "Artículos"]
export const followingFeedFilterOption: FollowingFeedFilter[] = ["Todos", "Solo Cabildo Abierto"]