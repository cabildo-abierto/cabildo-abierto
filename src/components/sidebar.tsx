import React, {useEffect, useState} from "react";
import { SidebarButton } from "./sidebar-button";
import { CustomLink as Link } from './custom-link';
import PersonIcon from '@mui/icons-material/Person';
import { useUser } from "../hooks/user";
import { UserProps } from "../app/lib/definitions";
import { userUrl } from "./utils";
import { DashboardIcon } from "./icons/dashboard-icon";
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
import {Button, IconButton} from "@mui/material";
import { useLayoutConfig } from "./layout/layout-config-context";
import {WriteButtonIcon} from "./icons/write-button-icon";
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import CollectionsBookmarkOutlinedIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';


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


export const SupportButton = ({user, onClose}: {user?: UserProps, onClose: () => void}) => {

    const newSupportCount = user ? unseenSupportMessagesCount(user) : 0
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
    const count = 0 // TO DO: Implement
    return <SidebarButton showText={showText} setShowText={setShowText} icon={<SupportIcon newCount={count}/>} onClick={onClose} text="Responder" href="/soporte/responder"/>
}


const SidebarUsername = ({user}: {user: {displayName?: string, handle: string, avatar?: string}}) => {
    return <Link href={userUrl(user.handle)}>
        <ProfilePic user={user} className={"w-12 h-12 rounded-full border"}/>
    </Link>
}


const SidebarUsernameNoUser = () => {
    return <div className="flex flex-col items-center">
        <Link href="/" className="link3 text-center text-[var(--text-light)] px-1 text-sm mb-4">Creá una cuenta o iniciá sesión para acceder a todas las funcionalidades del sitio</Link>
    </div>
}


const SidebarWriteButton = ({onClick, showText}: {showText: boolean, onClick: () => void}) => {
    return <div className={"my-2 h-12"}>
        {showText ? <BasicButton
            fullWidth={true}
            startIcon={<WriteButtonIcon/>}
            size={"large"}
            sx={{
                borderRadius: "20px",
                width: "160px",
                marginLeft: "10px"
            }}
            color={"primary"}
            onClick={(e) => {onClick()}}
        >
            Escribir
        </BasicButton> :
            <Button
                color={"primary"}
                onClick={(e) => {onClick()}}
                variant={"text"}
                size={"large"}
            >
                <WriteButtonIcon/>
            </Button>
        }
    </div>
}


export const SidebarContent = ({onClose}: { onClose: () => void }) => {
    const user = useUser()
    const pathname = usePathname()
    const [writePanelOpen, setWritePanelOpen] = useState(false)
    const {layoutConfig, setLayoutConfig} = useLayoutConfig()

    useEffect(() => {
        if((!layoutConfig.spaceForLeftSide && layoutConfig.openSidebar) || (layoutConfig.spaceForLeftSide && !layoutConfig.openSidebar && layoutConfig.defaultSidebarState)){
            setLayoutConfig((prev) => ({
                ...prev,
                openSidebar: layoutConfig.spaceForLeftSide
            }))
        }
    }, [layoutConfig.spaceForLeftSide])

    const showText = layoutConfig.openSidebar
    function setShowText(v: boolean){
        if(v != layoutConfig.openSidebar){
            setLayoutConfig((prev) => ({
                ...prev,
                openSidebar: v
            }))
        }
    }

    return <div
        className={"pt-4 px-2 bg-[var(--background)] h-screen " + (showText ? "w-56" : "w-20")}
    >
        <div className={"h-full flex flex-col justify-between"}>
            <div className={"flex flex-col space-y-2 " + (showText ? "" : "items-center")}>

            <div className={"mb-4"}>
                {user.user && <div className={"w-full flex justify-center"}>
                    <SidebarUsername
                    user={user.user}
                /></div>}

                {!user.isLoading && !user.user && <SidebarUsernameNoUser/>}
            </div>

            <SidebarButton
                showText={showText}
                setShowText={setShowText}
                onClick={onClose}
                icon={<CabildoIcon/>}
                iconInactive={<HomeOutlinedIcon/>}
                text="Inicio"
                href="/inicio"
                selected={pathname.startsWith("/inicio")}
            />
            <SidebarButton
                showText={showText}
                setShowText={setShowText}
                icon={<SearchIcon sx={{ strokeWidth: 1, stroke: "var(--text)" }}/>}
                iconInactive={<SearchIcon/>}
                onClick={onClose}
                text="Buscar"
                selected={pathname.startsWith("/buscar")}
                href="/buscar"
            />
            <SidebarButton
                showText={showText} setShowText={setShowText}
                onClick={onClose}
                icon={<NotificationsIcon count={0}/>}
                iconInactive={<NotificationsOutlinedIcon/>}
                text="Notificaciones" href="/notificaciones" selected={pathname.startsWith("/notificaciones")}
            />
            <SidebarButton
                icon={<TopicsIcon fontSize="medium"/>}
                iconInactive={<CollectionsBookmarkOutlinedIcon/>}
                onClick={onClose}
                text="Temas"
                href="/temas"
                showText={showText}
                setShowText={setShowText}
                selected={pathname.startsWith("/temas")}
            />
            <SidebarButton
                icon={<VisualizationsIcon sx={{ strokeWidth: 1, stroke: "var(--text)" }}/>}
                iconInactive={<VisualizationsIcon/>}
                onClick={onClose}
                text="Explorar datos"
                href="/datos"
                selected={pathname.startsWith("/datos")}
                showText={showText}
                setShowText={setShowText}
            />
            {user.user &&
            <SidebarButton
                icon={<PersonIcon/>}
                iconInactive={<PersonOutlinedIcon/>}
                onClick={onClose}
                text="Perfil"
                href={userUrl(user.user.handle)}
                selected={pathname == userUrl(user.user.handle)}
                showText={showText}
                setShowText={setShowText}
            />}
            <SidebarButton
                icon={<DashboardIcon/>}
                iconInactive={<AccountBalanceOutlinedIcon/>}
                onClick={onClose}
                text="Mis estadísticas"
                href="/panel"
                selected={pathname.startsWith("/panel")}
                showText={showText}
                setShowText={setShowText}
            />
            {user.user && user.user.editorStatus == "Administrator" &&
                <HelpDeskButton
                    showText={showText}
                    setShowText={setShowText}
                    user={user.user}
                    onClose={onClose}
                />
            }
            <SidebarButton
                icon={<SettingsIcon/>}
                iconInactive={<SettingsOutlinedIcon/>}
                onClick={onClose}
                text="Ajustes"
                href="/ajustes"
                selected={pathname.startsWith("/ajustes")}
                showText={showText}
                setShowText={setShowText}
            />
            <SidebarWriteButton showText={showText} onClick={() => {setWritePanelOpen(true)}}/>
        </div>
        <div className={"text-[var(--text-light)] flex justify-end mb-2"}>
            <IconButton
                size={"small"}
                color={"inherit"}
                onClick={() => {setShowText(!showText)}}
            >
                {showText ? <KeyboardDoubleArrowLeftIcon/> : <KeyboardDoubleArrowRightIcon/>}
            </IconButton>
        </div>
    </div>
        <WritePanel open={writePanelOpen} onClose={() => {setWritePanelOpen(false)}}/>
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