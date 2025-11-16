import {useAPI} from "@/components/utils/react/queries";
import {ArCabildoabiertoActorDefs} from "@cabildo-abierto/api"

export function useFollowSuggestions(limit: number, offset: number = 0) {
    return useAPI<{profiles: ArCabildoabiertoActorDefs.ProfileViewBasic[]}>(`/follow-suggestions/${limit}/${offset}`, ["follow-suggestions", limit, offset])
}