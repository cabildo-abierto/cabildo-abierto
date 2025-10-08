import {RefetchInterval, useAPI} from "@/queries/utils";
import {Session} from "@/lib/types";
import {useEffect} from "react";
import { useQueryClient } from "@tanstack/react-query";

export const useSession = (
    inviteCode?: string,
    key: string = "session",
    refetchInterval: RefetchInterval<Session> = false) => {
    const qc = useQueryClient()

    const res = useAPI<Session>(
        "/session" + (inviteCode ? "/" + inviteCode : ""),
        [key],
        undefined,
        undefined,
        refetchInterval
    )

    useEffect(() => {
        if(res.data){
            if(key == "session"){
                qc.setQueryData(["sidebar-session"], old => {
                    return res.data
                })
            }
        }
    }, [res]);

    return {...res, user: res.data}
}