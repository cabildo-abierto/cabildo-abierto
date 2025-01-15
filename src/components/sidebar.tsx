import React, {useState} from "react";
import { SidebarButton } from "./sidebar-button";
import { CustomLink as Link } from './custom-link';
import PersonIcon from '@mui/icons-material/Person';
import { useChat, useSupportNotRespondedCount, useUser } from "../hooks/user";
import { ChatMessage } from "@prisma/client";
import { UserProps } from "../app/lib/definitions";
import { supportDid, userUrl } from "./utils";
import { DashboardIcon } from "./icons/dashboard-icon";
import { DonateIcon } from "./icons/donate-icon";
import { CabildoIcon } from "./icons/home-icon";
import { SupportIcon } from "./icons/support-icon";
import VisualizationsIcon from "@mui/icons-material/AutoGraph";
import {ProfilePic} from "./feed/profile-pic";
import SettingsIcon from "./icons/settings-icon";
import TopicsIcon from "@mui/icons-material/CollectionsBookmark";
import {NotificationsIcon} from "./icons/notifications-icon";
import {usePathname} from "next/navigation";
import SearchIcon from "@mui/icons-material/Search";
import {BasicButton} from "./ui-utils/basic-button";
import {WritePanel} from "./write-panel";
import {WriteButtonIcon} from "./icons/write-button-icon";
import {IconButton} from "@mui/material";
import {People} from "@mui/icons-material";


function unseenCount(chat: ChatMessage[], userId: string){
    let count = 0
    for(let i = chat.length-1; i >= 0; i--){
        if(chat[i].fromUserId == userId) break
        if(!chat[i].seen) count ++
        else break
    }
    return count
}


export const SupportButton = ({user, onClose}: {user?: UserProps, onClose: () => void}) => {
    const chat = useChat(user.did, supportDid)
    const newSupportCount = chat.chat ? unseenCount(chat.chat, user.did) : 0
    return <Link href={"/soporte"} className={"text-[var(--text-light)]"}>
        <BasicButton
            variant={"text"}
            size={"small"}
            color={"inherit"}
            startIcon={<SupportIcon newCount={newSupportCount}/>} onClick={onClose}
        >
            Soporte
        </BasicButton>
    </Link>
}


const HelpDeskButton = ({user, onClose, showText, setShowText}: {showText: boolean, setShowText: (v: boolean) => void, user?: UserProps, onClose: () => void}) => {
    const count = useSupportNotRespondedCount()

    return <SidebarButton showText={showText} setShowText={setShowText} icon={<SupportIcon newCount={count.count}/>} onClick={onClose} text="Responder" href="/soporte/responder"/>
}


const SidebarUsername = ({user}: {user: {displayName?: string, handle: string, avatar?: string}}) => {
    return <div className="ml-4 py-2">
        <Link href={userUrl(user.handle)}>
            <ProfilePic user={user} className={"w-12 h-12 rounded-full border"}/>
        </Link>
    </div>
}


const SidebarUsernameNoUser = () => {
    return <div className="flex flex-col items-center">
        <Link href="/" className="link3 text-center text-[var(--text-light)] px-1 text-sm mb-4">Creá una cuenta o iniciá sesión para acceder a todas las funcionalidades del sitio</Link>
    </div>
}


const SidebarWriteButton = ({onClick, showText}: {showText: boolean, onClick: () => void}) => {
    return <div className={"my-2"}>
        {showText ? <BasicButton
            fullWidth={true}
            startIcon={<WriteButtonIcon/>}
            size={"large"}
            color={"primary"}
            onClick={(e) => {onClick()}}
        >
            Escribir
        </BasicButton> :
            <IconButton
                color={"primary"}
                onClick={(e) => {onClick()}}
            >
                <WriteButtonIcon/>
            </IconButton>
        }
    </div>
}


export const SidebarContent = ({onClose, startClosed=false}: { onClose: () => void, startClosed?: boolean }) => {
    const user = useUser()
    const pathname = usePathname()
    const [writePanelOpen, setWritePanelOpen] = useState(false)
    const [showText, setShowText] = useState(!startClosed)

    return <div className={"mt-4 w-56 px-2"}>
        <div className={"flex flex-col"} onMouseEnter={() => {setShowText(true)}} onMouseLeave={() => {if(startClosed) setShowText(false)}}>
        {user.user && <SidebarUsername
            user={user.user}
        />}
        {!user.isLoading && !user.user && <SidebarUsernameNoUser/>}
        <SidebarButton
            showText={showText} setShowText={setShowText}
            onClick={onClose} icon={<CabildoIcon/>} text="Inicio" href="/inicio" selected={pathname.startsWith("/inicio")}/>

        <SidebarButton
            showText={showText} setShowText={setShowText}
            icon={<SearchIcon fontSize={"medium"}/>} onClick={onClose} text="Buscar"
                       href="/buscar"
        />

        <SidebarButton
            showText={showText} setShowText={setShowText}
            onClick={onClose} icon={<NotificationsIcon count={0}/>}
            text="Notificaciones" href="/notificaciones" selected={pathname.startsWith("/notificaciones")}
        />

        <SidebarButton icon={<TopicsIcon fontSize="medium"/>} onClick={onClose}
                       text="Temas"
                       href="/temas"
                       showText={showText} setShowText={setShowText}
                       selected={pathname.startsWith("/temas")}
        />
        <SidebarButton icon={<VisualizationsIcon fontSize="medium"/>} onClick={onClose}
                       text="Datos"
                       href="/datos"
                       selected={pathname.startsWith("/datos")}
                       showText={showText} setShowText={setShowText}
        />
        <SidebarButton icon={<People fontSize={"medium"}/>} onClick={onClose}
                       text="Cabildos"
                       href="/cabildos"
                       selected={pathname.startsWith("/cabildos")}
                       showText={showText} setShowText={setShowText}
        />
        {user.user &&
        <SidebarButton icon={<PersonIcon/>} onClick={onClose} text="Perfil"
                       href={userUrl(user.user.handle)}
                       selected={pathname == userUrl(user.user.handle)}
                       showText={showText} setShowText={setShowText}
        />}
        <SidebarButton icon={<DonateIcon fontSize="medium"/>} onClick={onClose} text="Aportar"
                       href="/aportar"
                       showText={showText} setShowText={setShowText}
        />
        <SidebarButton icon={<DashboardIcon/>} onClick={onClose} text="Remuneración" href="/panel"
               selected={pathname.startsWith("/panel")}
                       showText={showText} setShowText={setShowText}
        />
        {user.user && user.user.editorStatus == "Administrator" &&
            <HelpDeskButton showText={showText} setShowText={setShowText} user={user.user} onClose={onClose}/>}
        <SidebarButton icon={<SettingsIcon/>} onClick={onClose} text="Ajustes" href="/ajustes"
                       selected={pathname.startsWith("/ajustes")}
                       showText={showText} setShowText={setShowText}
        />
        <SidebarWriteButton showText={showText} onClick={() => {setWritePanelOpen(true)}}/>
        <WritePanel open={writePanelOpen} onClose={() => {setWritePanelOpen(false)}}/>
    </div>
    </div>
}


export default function Sidebar({onClose}: { onClose: () => void }) {
    const mobile = false

    if(mobile){
        return <div className="h-screen w-screen fixed top-0 left-0 z-[51]">
            <div className="flex">
                <div
                    className="h-screen lg:w-72 w-128 flex flex-col justify-between bg-[var(--background)] safe-padding-mobile">
                    <SidebarContent onClose={onClose}/>
                </div>
                <button
                    className="h-screen w-full"
                    onClick={onClose}
                >
                </button>
            </div>
        </div>
    } else {
        return <div className="h-screen flex justify-end">
            <SidebarContent onClose={onClose}/>
        </div>
    }
}