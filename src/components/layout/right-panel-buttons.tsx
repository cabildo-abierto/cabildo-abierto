import {CustomLink as Link} from "../../../modules/ui-utils/src/custom-link";
import {topicUrl} from "@/utils/uri";
import InfoIcon from "@mui/icons-material/Info";
import {DonateIcon} from "@/components/icons/donate-icon";
import SettingsIcon from "@/components/icons/settings-icon";
import React, {ReactNode} from "react";
import {useUser} from "@/hooks/swr";
import {UserProps} from "@/lib/definitions";
import {SupportIcon} from "@/components/icons/support-icon";


export const RightPanelButton = ({children, icon, href}: {children: ReactNode, icon: ReactNode, href: string}) => {
    return (
        <Link href={href} className={"text-sm text-[var(--text-light)] flex items-center space-x-2 hover:text-[var(--text)] transition duration-200 p-1 rounded-lg"}>
            <div className={"w-6"}>
                {icon}
            </div>
            <div>
                {children}
            </div>
        </Link>
    )
}


function unseenSupportMessagesCount(user: UserProps){
    let count = 0
    function cmp(a, b) { return a.createdAt - b.createdAt}
    const chat = [...user.messagesReceived, ...user.messagesSent].sort(cmp)
    for(let i = user.messagesReceived.length-1; i >= 0; i--){
        if(chat[i].fromUserId == user.did) break
        if(!chat[i].seen) count ++
        else break
    }
    return count
}


export const SupportButton = () => {
    const {user} = useUser()
    const newSupportCount = user ? unseenSupportMessagesCount(user) : 0

    return (
        <RightPanelButton
            href={"/soporte"}
            icon={<SupportIcon color="inherit" newCount={newSupportCount}/>}
        >
            Soporte
        </RightPanelButton>
    )
}


export const RightPanelButtons = () => {
    const {user} = useUser()

    return <div className={"mt-4 px-3 w-full flex flex-col space-y-2"}>
        <SupportButton/>
        <RightPanelButton
            href={topicUrl("Cabildo Abierto")}
            icon={<InfoIcon color={"inherit"}/>}
        >
            Acerca de Cabildo Abierto
        </RightPanelButton>
        <RightPanelButton
            href={"/aportar"}
            icon={<DonateIcon color={"inherit"} fontSize={"small"}/>}
        >
            Aportar
        </RightPanelButton>
        {(user.platformAdmin) && <RightPanelButton
            href={"/admin"}
            icon={<SettingsIcon color={"inherit"} fontSize={"small"}/>}
        >
            Admin
        </RightPanelButton>}
    </div>
}