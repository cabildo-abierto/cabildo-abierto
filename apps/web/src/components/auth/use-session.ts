import {useEffect} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {RefetchInterval, useAPI} from "@/components/utils/react/queries";
import {Session} from "@cabildo-abierto/api";


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
        if (res.data) {
            if (key == "session") {
                qc.setQueryData(["sidebar-session"], old => {
                    return res.data
                })
            }
        }
    }, [res]);

    return {...res, user: res.data}
}