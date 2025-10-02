import {useAPI} from "@/queries/utils";
import {Session} from "@/lib/types";


export const useSession = (inviteCode?: string) => {
    const res = useAPI<Session>(
        "/session" + (inviteCode ? "/" + inviteCode : ""),
        ["session"],
        undefined,
        undefined,
        10000
    )
    return {...res, user: res.data}
}