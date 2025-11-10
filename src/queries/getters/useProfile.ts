import {useAPI} from "@/queries/utils";
import {ArCabildoabiertoActorDefs} from "@/lex-api"

export function useProfile(handle: string, enabled: boolean = true) {
    return useAPI<ArCabildoabiertoActorDefs.ProfileViewDetailed>("/profile/" + handle, ["profile", handle], undefined, enabled)
}