import {categoriesSearchParam, useAPI} from "@/queries/utils";
import {TopicViewBasic} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {TimePeriod} from "@/queries/useTrendingTopics";
import {TopicsGraph} from "@/lib/types";



export function useTopics(categories: string[], sortedBy: "popular" | "recent", time: TimePeriod) {
    const query = categoriesSearchParam(categories)
    const url = `/topics/${sortedBy}/${time}${query ? `?${query}` : ""}`;
    return useAPI<TopicViewBasic[]>(url, ["topic", sortedBy, ...categories, time]);
}


export function useCategories() {
    return useAPI<string[]>("/categories", ["categories"])
}


export function useCategoriesGraph() {
    return useAPI<TopicsGraph>("/categories-graph", ["categories-graph"])
}


export function useCategoryGraph(categories: string[]) {
    const query = categoriesSearchParam(categories)
    return useAPI<TopicsGraph>("/category-graph?" + query, ["category-graph", categories.sort()])
}