import {EnDiscusionMetric, EnDiscusionTime, FeedFormatOption, FollowingFeedFilter} from "../index";


export const defaultTopicMentionsMetric: EnDiscusionMetric = "Recientes"
export const defaultTopicMentionsTime: EnDiscusionTime = "Último mes"
export const defaultTopicMentionsFormat: FeedFormatOption = "Todos"

export const defaultEnDiscusionMetric: EnDiscusionMetric = "Interacciones"
export const defaultEnDiscusionTime: EnDiscusionTime = "Último mes"
export const defaultEnDiscusionFormat: FeedFormatOption = "Todos"


export const enDiscusionMetricOptions: EnDiscusionMetric[] = ["Me gustas", "Interacciones", "Popularidad relativa", "Recientes"]
export const enDiscusionTimeOptions: EnDiscusionTime[] = ["Último día", "Última semana", "Último mes", "Último año"]
export const feedFormatOptions: FeedFormatOption[] = ["Todos", "Artículos"]
export const followingFeedFilterOption: FollowingFeedFilter[] = ["Todos", "Solo Cabildo Abierto"]