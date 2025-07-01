import {SidebarButton} from "./sidebar-button";
import CabildoIcon from "../icons/home-icon";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import React from "react";
import {usePathname} from "next/navigation";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "../icons/notifications-icon";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import CollectionsBookmarkOutlinedIcon from "@mui/icons-material/CollectionsBookmarkOutlined";
import TopicsIcon from "@/components/icons/topics-icon";

export const bottomBarHeight = 50

export const BottomBarMobile = () => {
    const pathname = usePathname()

    const buttonClassName = ""

    return <div style={{height: bottomBarHeight}} className={"border-t flex justify-between items-center bg-[var(--background)] px-2"}>
        <SidebarButton
            icon={<CabildoIcon/>}
            iconInactive={<HomeOutlinedIcon/>}
            text="Inicio"
            href="/inicio"
            selected={pathname.startsWith("/inicio")}
            className={buttonClassName}
            color={"background"}
        />
        <SidebarButton
            icon={<TopicsIcon/>}
            iconInactive={<TopicsIcon outlined={true}/>}
            text="Temas"
            href="/temas"
            selected={pathname.startsWith("/temas") && !pathname.startsWith("/temas/congreso")}
            className={buttonClassName}
            color={"background"}
        />
        <SidebarButton
            icon={<SearchIcon sx={{ strokeWidth: 1, stroke: "var(--text)" }}/>}
            iconInactive={<SearchIcon/>}
            text="Buscar"
            selected={pathname.startsWith("/buscar")}
            href="/buscar"
            className={buttonClassName}
            color={"background"}
        />
        <SidebarButton
            icon={<NotificationsIcon count={0}/>}
            iconInactive={<NotificationsOutlinedIcon/>}
            text="Notificaciones" href="/notificaciones" selected={pathname.startsWith("/notificaciones")}
            className={buttonClassName}
            color={"background"}
        />
    </div>
}