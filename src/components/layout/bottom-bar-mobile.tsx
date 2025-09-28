import CabildoIcon from "@/components/layout/icons/home-icon";
import React from "react";
import {usePathname, useRouter} from "next/navigation";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@/components/layout/icons/notifications-icon";
import TopicsIcon from "@/components/layout/icons/topics-icon";
import {BottomNavigation, BottomNavigationAction, Box, Paper} from "@mui/material";
import {useLayoutConfig} from "@/components/layout/layout-config-context";

const BottomBarMobile = () => {
    const pathname = usePathname()
    const router = useRouter()
    const {isMobile} = useLayoutConfig()
    if(!isMobile) return null

    const notificationsSelected = pathname.startsWith("/notificaciones")
    const topicsSelected = pathname.startsWith("/temas")

    const values = ["inicio", "temas", "buscar", "notificaciones"]
    const value: string = values.find(v => pathname.startsWith(`/${v}`)) ?? null

    return <Box>
        <Paper
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: "white"
            }}
            elevation={3}
        >
            <BottomNavigation
                showLabels
                value={value}
                onChange={(event, newValue: string) => {
                    router.push(`/${newValue}`)
                }}
                sx={{
                    bgcolor: 'var(--background)',
                    borderTop: '1px solid var(--accent-dark)',
                    '& .Mui-selected': {
                        '& .MuiBottomNavigationAction-label': {
                            fontSize: theme => theme.typography.caption,
                            transition: 'none',
                            fontWeight: 'bold',
                            lineHeight: '20px'
                        },
                        '& .MuiSvgIcon-root, & .MuiBottomNavigationAction-label': {
                            color: 'var(--text)',
                            fill: 'var(--text)'
                        }
                    }
                }}
            >
                <BottomNavigationAction
                    value="inicio"
                    label="Inicio"
                    icon={<CabildoIcon/>}
                />
                <BottomNavigationAction
                    value="temas"
                    label="Temas"
                    icon={<TopicsIcon color={topicsSelected ? "text" : undefined}/>}
                />
                <BottomNavigationAction
                    value="buscar"
                    label="Buscar"
                    icon={<SearchIcon/>}
                />
                <BottomNavigationAction
                    value="notificaciones"
                    label="Notificaciones"
                    icon={<div><NotificationsIcon color={notificationsSelected ? "text" : undefined}/></div>}
                />
            </BottomNavigation>
        </Paper>
    </Box>
}

export default BottomBarMobile