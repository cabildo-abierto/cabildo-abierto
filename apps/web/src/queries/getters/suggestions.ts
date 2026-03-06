import {useAPI} from "@/components/utils/react/queries";
import {FollowSuggestionsOutput} from "@cabildo-abierto/api"

export function useFollowSuggestions(limit: number, offset: number = 0) {
    return useAPI<FollowSuggestionsOutput>(`/follow-suggestions/${limit}/${offset}`, ["follow-suggestions", limit, offset])
}