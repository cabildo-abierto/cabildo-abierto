import {useAPI} from "@/queries/utils";
import {Session} from "@/lib/types";


export const useSession = (inviteCode?: string) => {
    const res = useAPI<Session>("/session" + (inviteCode ? "/" + inviteCode : ""), ["session"])
    return {...res, user: res.data}
}