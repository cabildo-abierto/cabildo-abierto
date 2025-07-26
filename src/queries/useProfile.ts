import {useAPI} from "@/queries/utils";
import {
    Profile,
} from "@/lib/types"

export function useProfile(handle: string) {
    return useAPI<Profile>("/profile/" + handle, ["profile", handle])
}