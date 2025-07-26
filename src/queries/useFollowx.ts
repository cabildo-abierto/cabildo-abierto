import {FollowKind} from "@/components/profile/follow/followx-page";
import {useAPI} from "@/queries/utils";
import {ProfileViewBasic} from "@/lex-api/types/ar/cabildoabierto/actor/defs";


export function useFollowx(handle: string, kind: FollowKind) {
    const route = kind == "seguidores" ? "followers" : "follows"
    return useAPI<ProfileViewBasic[]>(`/${route}/` + handle, [route, handle])
}