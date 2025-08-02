import React from "react";
import {usePathname} from "next/navigation";
import {CustomLink as Link} from '../../../modules/ui-utils/src/custom-link';
import {ProfilePic} from "../profile/profile-pic";
import {profileUrl, topicUrl} from "@/utils/uri";
import {useConversations} from "@/queries/useConversations";
import {useLayoutConfig} from "./layout-config-context";
import {dimOnHoverClassName} from "../../../modules/ui-utils/src/dim-on-hover-link";
import {SidebarButton} from "./sidebar-button";
import {Button} from "../../../modules/ui-utils/src/button";
import {IconButton} from "../../../modules/ui-utils/src/icon-button";
import {WriteButtonIcon} from "../icons/write-button-icon";
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import NotificationsIcon from "../icons/notifications-icon";
import TopicsIcon from "@/components/icons/topics-icon";
import MessagesIcon from "../icons/messages-icon";
import {sum} from "@/utils/arrays";
import {GearIcon, HouseLineIcon, MagnifyingGlassIcon, TrayIcon, UserIcon} from "@phosphor-icons/react";
import {SwipeableDrawer} from "@mui/material";
import NextMeetingInvite from "@/components/layout/next-meeting-invite";
import {useAPI} from "@/queries/utils";
import {useSession} from "@/queries/useSession";


const SidebarWriteButton = ({onClick, showText}: { showText: boolean, onClick: () => void }) => {

    return <>
        <div className={"my-2 h-12 " + (showText ? "pr-4 sm:w-[180px] w-full max-w-[300px]" : "")}>
            {showText ? <Button
                    startIcon={<WriteButtonIcon/>}
                    size={"large"}
                    fullWidth={true}
                    sx={{
                        borderRadius: "20px",
                        marginLeft: "10px"
                    }}
                    color={"primary"}
                    onClick={() => {
                        onClick()
                    }}
                    id={"write-button"}
                >
                    <span className={"font-bold text-[16px] sm:text-[14px]"}>
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


function useUnreadNotificationsCount() {
    return useAPI<number>("/notifications/unread-count", ["unread-notifications-count"])
}


const SidebarBottom = () => {
    const {layoutConfig, setLayoutConfig} = useLayoutConfig()


    function onClickLink() {
        setLayoutConfig({
            ...layoutConfig,
            openSidebar: false
        })
    }

    return <div className={"space-y-2 px-2"}>
        <div className={"flex gap-x-1 text-sm flex-wrap"}>
            <Link href={"/ajustes/compartir"} onClick={onClickLink}>
                Invitar
            </Link>
            <div>
                •
            </div>
            <Link href={"/aportar"} onClick={onClickLink}>
                Aportar
            </Link>
            <div>
                •
            </div>
            <Link href={"/soporte"} onClick={onClickLink}>
                Soporte
            </Link>
            <div>
                •
            </div>
            <Link href={topicUrl("Cabildo Abierto: Solicitudes de usuarios", undefined, "normal")} onClick={onClickLink}>
                Sugerencias
            </Link>
            <div>
                •
            </div>
            <Link href={"/ajustes/solicitar-validacion"} onClick={onClickLink}>
                Verificar mi cuenta
            </Link>
            <div>
                •
            </div>
            <Link href={topicUrl("Cabildo Abierto", undefined, "normal")} onClick={onClickLink}>
                Preguntas frecuentes
            </Link>
        </div>

        <div className={"flex flex-col space-y-1"}>
            <Link href={topicUrl("Cabildo Abierto: Términos y condiciones", undefined, "normal")} onClick={onClickLink}>
                Términos y condiciones
            </Link>
            <Link href={topicUrl("Cabildo Abierto: Política de privacidad", undefined, "normal")} onClick={onClickLink}>
                Política de privacidad
            </Link>
        </div>
    </div>
}


const SidebarContent = ({onClose, setWritePanelOpen}: {
    onClose: () => void
    setWritePanelOpen: (open: boolean) => void
}) => {
    const user = useSession()
    const {layoutConfig, setLayoutConfig} = useLayoutConfig()
    const pathname = usePathname()
    const {data: conversations} = useConversations()
    const {data: unreadNotificationsCount} = useUnreadNotificationsCount()

    let unreadMessagesCount = undefined
    if (conversations) {
        unreadMessagesCount = sum(conversations, c => c.unreadCount)
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
                className={"pt-4 px-2 overflow-scroll no-scrollbar h-full " + (showText ? "" : "hidden min-[500px]:block")}
            >
                <div className={"h-full flex flex-col justify-between"}>
                    <div className={"flex pb-8 flex-col sm:space-y-2 space-y-2 " + (showText ? "" : "items-center")}>
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
                            icon={<HouseLineIcon fontSize={24} weight={"fill"}/>}
                            iconInactive={<HouseLineIcon fontSize={24}/>}
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
                            icon={<MagnifyingGlassIcon fontSize={24} weight={"bold"}/>}
                            iconInactive={<MagnifyingGlassIcon fontSize={24}/>}
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
                        <SidebarButton
                            icon={<TrayIcon size={24} weight={"fill"}/>}
                            iconInactive={<TrayIcon size={24}/>}
                            onClick={onClose}
                            text="Tus papeles"
                            href="/papeles"
                            selected={pathname.startsWith("/papeles")}
                            showText={showText}
                        />
                        {user.user && <SidebarButton
                            icon={<UserIcon fontSize={24} weight={"fill"}/>}
                            iconInactive={<UserIcon fontSize={24}/>}
                            onClick={onClose}
                            text="Perfil"
                            href={profileUrl(user.user.handle)}
                            selected={pathname == profileUrl(user.user.handle)}
                            showText={showText}
                        />}
                        <SidebarButton
                            icon={<GearIcon fontSize={24} weight={"fill"}/>}
                            iconInactive={<GearIcon fontSize={24}/>}
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
                        <NextMeetingInvite/>
                        {showText && <div className={"sm:hidden text-xs"}>
                            <SidebarBottom/>
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
        </>
    )
}


export const Sidebar = ({onClose, setWritePanelOpen}: {
    onClose: () => void
    setWritePanelOpen: (open: boolean) => void
}) => {
    const {layoutConfig, setLayoutConfig, isMobile} = useLayoutConfig()

    const drawerState = layoutConfig.openSidebar ? "expanded" : (isMobile ? "closed" : "collapsed")
    const drawerWidth = drawerState === 'expanded' ? (isMobile ? "80%" : 224) : drawerState === 'collapsed' ? 80 : 0
    const hideBackdrop = isMobile ? false : (layoutConfig.spaceForLeftSide || !layoutConfig.openSidebar)

    return <SwipeableDrawer
        key={JSON.stringify({...layoutConfig, isMobile})}
        anchor={"left"}
        hideBackdrop={hideBackdrop}
        disableEnforceFocus={true}
        open={drawerState != "closed"}
        disableScrollLock={drawerState != "expanded" || hideBackdrop}
        onOpen={() => {
            setLayoutConfig((prev) => ({...prev, openSidebar: true}))
        }}
        onClose={() => {
            setLayoutConfig((prev) => ({...prev, openSidebar: false}))
        }}
        sx={{
            width: drawerWidth,
            transition: 'width 0.3s',
            '& .MuiDrawer-paper': {
                boxShadow: "none",
                width: drawerWidth,
                boxSizing: 'border-box',
                overflowY: 'auto',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                    display: 'none'
                },
                border: 'none'
            },
        }}
    >
        <div className={"bg-[var(--background-dark)] min-h-screen h-full"}>
            <SidebarContent onClose={onClose} setWritePanelOpen={setWritePanelOpen}/>
        </div>
    </SwipeableDrawer>
}