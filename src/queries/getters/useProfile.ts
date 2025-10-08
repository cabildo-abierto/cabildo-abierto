import {useAPI} from "@/queries/utils";
import {ArCabildoabiertoActorDefs} from "@/lex-api"

export function useProfile(handle: string) {
    return useAPI<ArCabildoabiertoActorDefs.ProfileViewDetailed>("/profile/" + handle, ["profile", handle])
}