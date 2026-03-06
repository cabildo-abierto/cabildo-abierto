import {useAPI} from "@/components/utils/react/queries";
import {ArCabildoabiertoActorDefs, GetFeedOutput} from "@cabildo-abierto/api"

export function useFollowSuggestions(limit: number, offset: number = 0) {
    return useAPI<GetFeedOutput<ArCabildoabiertoActorDefs.ProfileViewBasic>>(`/follow-suggestions/${limit}/${offset}`, ["follow-suggestions", limit, offset])
}