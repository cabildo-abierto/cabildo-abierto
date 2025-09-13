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
import {
    GearIcon, HouseLineIcon, MagnifyingGlassIcon,
    ProjectorScreenChartIcon, TrayIcon, UserIcon
} from "@phosphor-icons/react";
import {SwipeableDrawer} from "@mui/material";
import NextMeetingInvite from "@/components/layout/next-meeting-invite";
import {useAPI} from "@/queries/utils";
import {useSession} from "@/queries/useSession";
import VerifyAccountButton from "@/components/profile/verify-account-button";


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

    return <div className={"space-y-2 h-full flex flex-col justify-between pb-4"}>
        <div className={"flex gap-x-1 text-base flex-wrap"}>
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
            <Link href={topicUrl("Cabildo Abierto: Solicitudes de usuarios", undefined, "normal")}
                  onClick={onClickLink}>
                Sugerencias
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
    const {layoutConfig, setLayoutConfig, isMobile} = useLayoutConfig()
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

    const iconFontSize = isMobile ? 26 : 24

    return (
        <>
            <div
                className={"pt-4 px-2 overflow-scroll no-scrollbar h-full " + (showText ? "" : "hidden min-[500px]:block")}
            >
                <div className={"h-full flex flex-col justify-between"}>
                    <div
                        className={"flex pb-8 h-full flex-col " + (showText ? "" : "items-center") + (isMobile ? " space-y-3" : " space-y-2")}
                    >
                        <div className={"mt-4 mb-2 space-y-2 " + (showText ? "px-4" : "")}>
                            <div className={"flex w-full sm:justify-center"}>
                                <div className={"flex flex-col items-center space-y-1"}>
                                    <Link href={profileUrl(user.user.handle)} id={"sidebar-profile-pic"}>
                                        <ProfilePic
                                            clickable={false}
                                            user={user.user}
                                            className={" rounded-full border " + dimOnHoverClassName + (isMobile ? " w-14 h-14" : " w-12 h-12")}
                                            descriptionOnHover={false}
                                        />
                                    </Link>
                                    <VerifyAccountButton verification={user.user.validation}/>
                                </div>
                            </div>
                            <div className={isMobile && showText ? "" : "hidden"}>
                                <div className={"font-bold text-xl"}>
                                    {user.user.displayName ?? "@" + user.user.handle}
                                </div>
                                <div className={"text-[var(--text-light)] text-lg"}>
                                    {"@" + user.user.handle}
                                </div>
                                <hr className={"mt-4 border-2"}/>
                            </div>
                        </div>
                        <SidebarButton
                            showText={showText}
                            onClick={onClose}
                            icon={<HouseLineIcon fontSize={iconFontSize} weight={"fill"}/>}
                            iconInactive={<HouseLineIcon fontSize={iconFontSize}/>}
                            text="Inicio"
                            href="/inicio"
                            selected={pathname.startsWith("/inicio")}
                            id={"inicio"}
                        />
                        <SidebarButton
                            icon={<TopicsIcon fontSize={iconFontSize}/>}
                            iconInactive={<TopicsIcon fontSize={iconFontSize} outlined={true}/>}
                            onClick={onClose}
                            text="Temas"
                            href="/temas"
                            id={"temas"}
                            showText={showText}
                            selected={pathname.startsWith("/temas") && !pathname.startsWith("/temas/congreso")}
                        />
                        <SidebarButton
                            showText={showText}
                            icon={<MagnifyingGlassIcon fontSize={iconFontSize} weight={"bold"}/>}
                            iconInactive={<MagnifyingGlassIcon fontSize={iconFontSize}/>}
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
                            icon={<TrayIcon size={iconFontSize} weight={"fill"}/>}
                            iconInactive={<TrayIcon size={iconFontSize}/>}
                            onClick={onClose}
                            text="Tus papeles"
                            href="/papeles"
                            selected={pathname.startsWith("/papeles")}
                            showText={showText}
                        />
                        {user.user.authorStatus?.isAuthor && <SidebarButton
                            icon={<ProjectorScreenChartIcon size={iconFontSize} weight={"fill"}/>}
                            iconInactive={<ProjectorScreenChartIcon size={iconFontSize}/>}
                            onClick={onClose}
                            text="Panel de autor"
                            href="/panel"
                            selected={pathname.startsWith("/panel")}
                            showText={showText}
                        />}
                        {user.user && <SidebarButton
                            icon={<UserIcon fontSize={iconFontSize} weight={"fill"}/>}
                            iconInactive={<UserIcon fontSize={iconFontSize}/>}
                            onClick={onClose}
                            text="Perfil"
                            href={profileUrl(user.user.handle)}
                            selected={pathname == profileUrl(user.user.handle)}
                            showText={showText}
                        />}
                        <SidebarButton
                            icon={<GearIcon fontSize={iconFontSize} weight={"fill"}/>}
                            iconInactive={<GearIcon fontSize={iconFontSize}/>}
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
                        <div className={"px-4 space-y-4 h-full"}>
                            <hr className={"sm:hidden border-2"}/>
                            {showText && <div className={"sm:hidden text-xs h-full"}>
                                <SidebarBottom/>
                            </div>}
                        </div>
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