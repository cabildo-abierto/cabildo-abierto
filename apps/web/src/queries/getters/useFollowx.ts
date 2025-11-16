import {useAPI} from "@/components/utils/react/queries";
import {FollowKind} from "@/components/perfil/follows";
import {ArCabildoabiertoActorDefs} from "@cabildo-abierto/api"


export function useFollowx(handle: string, kind: FollowKind) {
    const route = kind == "seguidores" ? "followers" : "follows"
    return useAPI<ArCabildoabiertoActorDefs.ProfileViewBasic[]>(`/${route}/` + handle, [route, handle])
}