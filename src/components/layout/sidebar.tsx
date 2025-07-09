import React, {useState} from "react";
import {usePathname} from "next/navigation";
import {CustomLink as Link} from '../../../modules/ui-utils/src/custom-link';
import {ProfilePic} from "../profile/profile-pic";
import {profileUrl} from "@/utils/uri";
import {useConversations, useSession, useUnreadNotificationsCount} from "@/queries/api";
import {useLayoutConfig} from "./layout-config-context";
import {dimOnHoverClassName} from "../../../modules/ui-utils/src/dim-on-hover-link";
import {SidebarButton} from "./sidebar-button";
import {Button} from "../../../modules/ui-utils/src/button";
import {IconButton} from "../../../modules/ui-utils/src/icon-button";
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from "../icons/settings-icon";
import {WriteButtonIcon} from "../icons/write-button-icon";
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

import CabildoIcon from "../icons/home-icon";
import SupportIcon from "../icons/support-icon";
import NotificationsIcon from "../icons/notifications-icon";

import dynamic from "next/dynamic";
import TopicsIcon from "@/components/icons/topics-icon";
import MessagesIcon from "../icons/messages-icon";
import {sum} from "@/utils/arrays";
import {RightPanelButtons} from "@/components/layout/right-panel-buttons";

const WritePanel = dynamic(() => import('../writing/write-panel/write-panel'));
const FloatingWriteButton = dynamic(() => import('../writing/floating-write-button'));


const HelpDeskButton = ({user, onClose, showText, setShowText}: {
    showText: boolean,
    setShowText: (v: boolean) => void,
    user?: {},
    onClose: () => void
}) => {
    const count = 0 // TO DO: Implementar
    return <SidebarButton showText={showText} icon={<SupportIcon newCount={count}/>} onClick={onClose} text="Responder"
                          href="/soporte/responder"/>
}


const SidebarWriteButton = ({onClick, showText}: { showText: boolean, onClick: () => void }) => {
    return <>
        <FloatingWriteButton onClick={onClick}/>
        <div className={"my-2 h-12"}>
            {showText ? <Button
                    fullWidth={true}
                    startIcon={<WriteButtonIcon/>}
                    size={"large"}
                    sx={{
                        borderRadius: "20px",
                        width: "160px",
                        marginLeft: "10px"
                    }}
                    color={"primary"}
                    onClick={() => {
                        onClick()
                    }}
                    id={"write-button"}
                >
                    <span className={"font-bold text-[14px]"}>
                        Escribir
                    </span>
                </Button> :
                <IconButton
                    color={"primary"}
                    onClick={() => {
                        onClick()
                    }}
                    sx={{borderRadius: "16px"}}
                    size={"medium"}
                    id={"write-button"}
                >
                    <WriteButtonIcon/>
                </IconButton>
            }
        </div>
    </>
}


export const SidebarContent = ({onClose}: { onClose: () => void }) => {
    const user = useSession()
    const pathname = usePathname()
    const [writePanelOpen, setWritePanelOpen] = useState(false)
    const {layoutConfig, setLayoutConfig} = useLayoutConfig()
    const {data: unreadNotificationsCount} = useUnreadNotificationsCount()
    const {data: conversations} = useConversations()

    let unreadMessagesCount = undefined
    if (conversations) {
        unreadMessagesCount = sum(conversations.map(c => c.unreadCount))
    }

    const showText = layoutConfig.openSidebar

    function setShowText(v: boolean) {
        if (v != layoutConfig.openSidebar) {
            setLayoutConfig((prev) => ({
                ...prev,
                openSidebar: v
            }))
        }
    }

    return (
        <>
            <div
                className={"pt-4 px-2 overflow-scroll no-scrollbar h-screen " + (showText ? "w-56" : "w-20 hidden min-[500px]:block")}
            >
                <div className={"h-full flex flex-col justify-between"}>
                    <div className={"flex flex-col sm:space-y-2 space-y-1 " + (showText ? "" : "items-center")}>

                        <div className={"mb-4"}>
                            <div className={"w-full flex justify-center"}>
                                <Link href={profileUrl(user.user.handle)} id={"sidebar-profile-pic"}>
                                    <ProfilePic
                                        user={user.user}
                                        className={"w-12 h-12 rounded-full border " + dimOnHoverClassName}
                                        descriptionOnHover={false}
                                    />
                                </Link>
                            </div>
                        </div>

                        <SidebarButton
                            showText={showText}
                            onClick={onClose}
                            icon={<CabildoIcon/>}
                            iconInactive={<HomeOutlinedIcon/>}
                            text="Inicio"
                            href="/inicio"
                            selected={pathname.startsWith("/inicio")}
                            id={"inicio"}
                        />

                        <SidebarButton
                            icon={<TopicsIcon/>}
                            iconInactive={<TopicsIcon outlined={true}/>}
                            onClick={onClose}
                            text="Temas"
                            href="/temas"
                            id={"temas"}
                            showText={showText}
                            selected={pathname.startsWith("/temas") && !pathname.startsWith("/temas/congreso")}
                        />
                        <SidebarButton
                            showText={showText}
                            icon={<SearchIcon sx={{strokeWidth: 1, stroke: "var(--text)"}}/>}
                            iconInactive={<SearchIcon/>}
                            onClick={onClose}
                            text="Buscar"
                            selected={pathname.startsWith("/buscar")}
                            href="/buscar"
                        />
                        <SidebarButton
                            showText={showText}
                            onClick={onClose}
                            icon={<NotificationsIcon count={unreadNotificationsCount}/>}
                            iconInactive={<NotificationsIcon count={unreadNotificationsCount} active={false}/>}
                            text="Notificaciones"
                            href="/notificaciones"
                            selected={pathname.startsWith("/notificaciones")}
                        />
                        <SidebarButton
                            showText={showText}
                            onClick={onClose}
                            icon={<MessagesIcon active={true} count={unreadMessagesCount}/>}
                            iconInactive={<MessagesIcon active={false} count={unreadMessagesCount}/>}
                            text="Mensajes"
                            href="/mensajes"
                            selected={pathname.startsWith("/mensajes")}
                        />
                        {user.user && <SidebarButton
                            icon={<PersonIcon/>}
                            iconInactive={<PersonOutlinedIcon/>}
                            onClick={onClose}
                            text="Perfil"
                            href={profileUrl(user.user.handle)}
                            selected={pathname == profileUrl(user.user.handle)}
                            showText={showText}
                        />}
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
                        />
                        <div>
                            <SidebarWriteButton showText={showText} onClick={() => {
                                setWritePanelOpen(true)
                            }}/>
                        </div>
                        {showText && <div className={"sm:hidden text-xs"}>
                            <RightPanelButtons/>
                        </div>}
                    </div>
                    <div className={"text-[var(--text-light)] flex justify-end mb-2 max-[500px]:hidden"}>
                        <IconButton
                            size={"small"}
                            color={"background-dark"}
                            onClick={() => {
                                setShowText(!showText)
                            }}
                        >
                            {showText ? <KeyboardDoubleArrowLeftIcon/> : <KeyboardDoubleArrowRightIcon/>}
                        </IconButton>
                    </div>
                </div>
            </div>
            <WritePanel
                open={writePanelOpen}
                onClose={() => {
                    setWritePanelOpen(false)
                }}
            />
        </>
    )
}