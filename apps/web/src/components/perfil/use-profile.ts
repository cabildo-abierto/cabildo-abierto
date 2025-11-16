import {ArCabildoabiertoActorDefs} from "@cabildo-abierto/api/dist"
import {useAPI} from "@/components/utils/react/queries";

export function useProfile(handle: string, enabled: boolean = true) {
    return useAPI<ArCabildoabiertoActorDefs.ProfileViewDetailed>("/profile/" + handle, ["profile", handle], undefined, enabled)
}