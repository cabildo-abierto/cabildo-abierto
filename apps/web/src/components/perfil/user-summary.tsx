import React, {ReactNode} from "react";
import {useProfile} from "./use-profile";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/utils/ui/hover-card";
import dynamic from "next/dynamic";

const UserSummaryCardContent = dynamic(() => import("./user-summary-card-content").then(mod => mod.UserSummaryCardContent), {ssr: false})


const UserSummaryOnHover = ({children, handle}: { children: ReactNode, handle: string }) => {
    const {data, refetch} = useProfile(handle, false);

    function prefetch() {
        if(!data) {
            refetch()
        }
    }

    if(data) {
        console.log("data", data)
    }

    return <HoverCard openDelay={500} closeDelay={300}>
        <HoverCardTrigger asChild onMouseEnter={prefetch}>
            {children}
        </HoverCardTrigger>
        <HoverCardContent
            className={"max-w-[360px] cursor-default portal group p-4 hidden md:flex flex-col space-y-2"}
            align={"start"}
            onClick={e => e.stopPropagation()}
        >
            <UserSummaryCardContent
                handle={handle}
            />
        </HoverCardContent>
    </HoverCard>

}


export default UserSummaryOnHover