import {
    EnDiscusionMetric,
    EnDiscusionTime,
    FeedFormatOption,
    FollowingFeedFilterOption,
    MainFeedOption
} from "@/lib/types";


export const defaultTopicMentionsMetric: EnDiscusionMetric = "Recientes"
export const defaultTopicMentionsTime: EnDiscusionTime = "Último mes"
export const defaultTopicMentionsFormat: FeedFormatOption = "Todos"

export const defaultEnDiscusionMetric: EnDiscusionMetric = "Interacciones"
export const defaultEnDiscusionTime: EnDiscusionTime = "Último mes"
export const defaultEnDiscusionFormat: FeedFormatOption = "Todos"

export function mainFeedOptionToSearchParam(v: MainFeedOption) {
    if (v == "Siguiendo") return "siguiendo"
    if (v == "En discusión") return "discusion"
    if (v == "Descubrir") return "descubrir"
    if (v == "Artículos") return "articulos"
    return "siguiendo"
}

export function searchParamToMainFeedOption(v: string): MainFeedOption {
    if (v == "siguiendo") return "Siguiendo"
    if (v == "discusion") return "En discusión"
    if (v == "descubrir") return "Descubrir"
    if (v == "articulos") return "Artículos"
    return "Siguiendo"
}

export const enDiscusionMetricOptions: EnDiscusionMetric[] = ["Me gustas", "Interacciones", "Popularidad relativa", "Recientes"]
export const enDiscusionTimeOptions: EnDiscusionTime[] = ["Último día", "Último mes", "Última semana"]
export const feedFormatOptions: FeedFormatOption[] = ["Todos", "Artículos"]
export const followingFeedFilterOption: FollowingFeedFilterOption[] = ["Todos", "Solo Cabildo Abierto"]