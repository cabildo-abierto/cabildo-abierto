import {useAPI} from "@/queries/utils";
import {ProfileViewBasic} from "@/lex-api/types/ar/cabildoabierto/actor/defs";

export function useFollowSuggestions(limit: number, offset: number = 0) {
    return useAPI<{profiles: ProfileViewBasic[]}>(`/follow-suggestions/${limit}/${offset}`, ["follow-suggestions", limit, offset])
}