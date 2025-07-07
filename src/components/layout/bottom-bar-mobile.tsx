import CabildoIcon from "../icons/home-icon";
import React from "react";
import {usePathname, useRouter} from "next/navigation";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "../icons/notifications-icon";
import TopicsIcon from "@/components/icons/topics-icon";
import {BottomNavigation, BottomNavigationAction, Paper} from "@mui/material";

export const BottomBarMobile = () => {
    const pathname = usePathname()
    const router = useRouter()

    const values = ["inicio", "temas", "buscar", "notificaciones"]
    const value: string = values.find(v => pathname.startsWith(`/${v}`)) ?? null

    return <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation
            showLabels
            value={value}
            onChange={(event, newValue: string) => {
                router.push(`/${newValue}`)
            }}
        >
            <BottomNavigationAction value="inicio" label="Inicio" icon={<CabildoIcon />} />
            <BottomNavigationAction value="temas" label="Temas" icon={<TopicsIcon />} />
            <BottomNavigationAction value="buscar" label="Buscar" icon={<SearchIcon />} />
            <BottomNavigationAction value="notificaciones" label="Notificaciones" icon={<NotificationsIcon />} />
        </BottomNavigation>
    </Paper>
}