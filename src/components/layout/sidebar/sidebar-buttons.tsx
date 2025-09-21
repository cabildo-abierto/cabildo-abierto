
import {SidebarWriteButton} from "@/components/layout/sidebar/sidebar-write-button";
import {
    GearIcon, HouseLineIcon, MagnifyingGlassIcon,
    ProjectorScreenChartIcon, TrayIcon, UserIcon
} from "@phosphor-icons/react";
import {SidebarButton} from "./sidebar-button";
import NotificationsIcon from "../../icons/notifications-icon";
import TopicsIcon from "@/components/icons/topics-icon";
import MessagesIcon from "../../icons/messages-icon";
import React from "react";
import {sum} from "@/utils/arrays";
import {useSession} from "@/queries/useSession";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {usePathname} from "next/navigation";
import {useAPI} from "@/queries/utils";
import {useConversations} from "@/queries/useConversations";
import {profileUrl} from "@/utils/uri";


function useUnreadNotificationsCount() {
    return useAPI<number>("/notifications/unread-count", ["unread-notifications-count"])
}

export const SidebarButtons = ({showText, onClose, setWritePanelOpen}: {
    showText: boolean
    onClose: () => void
    setWritePanelOpen: (v: boolean) => void
}) => {
    const {data: conversations} = useConversations()
    const {data: unreadNotificationsCount} = useUnreadNotificationsCount()
    const user = useSession()
    const {isMobile} = useLayoutConfig()
    const pathname = usePathname()

    let unreadMessagesCount = undefined
    if (conversations) {
        unreadMessagesCount = sum(conversations, c => c.unreadCount)
    }

    const iconFontSize = isMobile ? 26 : 24
    const iconWeight = "light"
    return <>
        <SidebarButton
            showText={showText}
            onClick={onClose}
            icon={<HouseLineIcon fontSize={iconFontSize} weight={"fill"}/>}
            iconInactive={<HouseLineIcon fontSize={iconFontSize} weight={iconWeight}/>}
            text="Inicio"
            href="/inicio"
            selected={pathname.startsWith("/inicio")}
            id={"inicio"}
        />
        <SidebarButton
            icon={<TopicsIcon fontSize={iconFontSize}/>}
            iconInactive={<TopicsIcon fontSize={iconFontSize} weight={iconWeight}/>}
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
            iconInactive={<MagnifyingGlassIcon fontSize={iconFontSize} weight={iconWeight}/>}
            onClick={onClose}
            text="Buscar"
            selected={pathname.startsWith("/buscar")}
            href="/buscar"
        />
        <SidebarButton
            showText={showText}
            onClick={onClose}
            icon={<NotificationsIcon count={unreadNotificationsCount}/>}
            iconInactive={<NotificationsIcon count={unreadNotificationsCount} active={false} weight={iconWeight}/>}
            text="Notificaciones"
            href="/notificaciones"
            requiresAuth={true}
            selected={pathname.startsWith("/notificaciones")}
        />
        <SidebarButton
            showText={showText}
            onClick={onClose}
            icon={<MessagesIcon active={true} count={unreadMessagesCount}/>}
            iconInactive={<MessagesIcon active={false} count={unreadMessagesCount} weight={iconWeight}/>}
            text="Mensajes"
            href="/mensajes"
            selected={pathname.startsWith("/mensajes")}
            requiresAuth={true}
        />
        <SidebarButton
            icon={<TrayIcon size={iconFontSize} weight={"fill"}/>}
            iconInactive={<TrayIcon size={iconFontSize} weight={"light"}/>}
            onClick={onClose}
            text="Tus papeles"
            href="/papeles"
            selected={pathname.startsWith("/papeles")}
            showText={showText}
            requiresAuth={true}
        />
        {user.user && user.user.authorStatus?.isAuthor && <SidebarButton
            icon={<ProjectorScreenChartIcon size={iconFontSize} weight={"fill"}/>}
            iconInactive={<ProjectorScreenChartIcon size={iconFontSize} weight={iconWeight}/>}
            onClick={onClose}
            text="Panel de autor"
            href="/panel"
            selected={pathname.startsWith("/panel")}
            showText={showText}
            requiresAuth={true}
        />}
        {user.user && <SidebarButton
            icon={<UserIcon fontSize={iconFontSize} weight={"fill"}/>}
            iconInactive={<UserIcon fontSize={iconFontSize} weight={iconWeight}/>}
            onClick={onClose}
            text="Perfil"
            href={profileUrl(user.user.handle)}
            selected={pathname == profileUrl(user.user.handle)}
            showText={showText}
            requiresAuth={true}
        />}
        <SidebarButton
            icon={<GearIcon fontSize={iconFontSize} weight={"fill"}/>}
            iconInactive={<GearIcon fontSize={iconFontSize} weight={iconWeight}/>}
            onClick={onClose}
            text="Ajustes"
            href="/ajustes"
            selected={pathname.startsWith("/ajustes")}
            showText={showText}
            requiresAuth={true}
        />
        <div>
            <SidebarWriteButton
                showText={showText}
                onClick={() => {
                    setWritePanelOpen(true)
                }}
            />
        </div>
    </>
}