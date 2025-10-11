import HomeIcon from "@/components/layout/icons/home-icon";
import React from "react";
import {usePathname, useRouter} from "next/navigation";
import NotificationsIcon from "@/components/layout/icons/notifications-icon";
import TopicsIcon from "@/components/layout/icons/topics-icon";
import {BottomNavigation, BottomNavigationAction, Box, Paper} from "@mui/material";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {MagnifyingGlassIcon} from "@phosphor-icons/react";

const BottomBarMobile = () => {
    const pathname = usePathname()
    const router = useRouter()
    const {isMobile} = useLayoutConfig()
    if(!isMobile) return null

    const notificationsSelected = pathname.startsWith("/notificaciones")
    const topicsSelected = pathname.startsWith("/temas")
    const searchSelected = pathname.startsWith("/buscar")
    const homeSelected = pathname.startsWith("/inicio")

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
                    icon={<HomeIcon
                        fontSize={23}
                        weight={homeSelected ? "fill" : "light"}
                    />}
                />
                <BottomNavigationAction
                    value="temas"
                    label="Temas"
                    icon={<TopicsIcon color={topicsSelected ? "text" : "text-light"}/>}
                />
                <BottomNavigationAction
                    value="buscar"
                    label="Buscar"
                    icon={<MagnifyingGlassIcon fontSize={23} weight={searchSelected ? "bold" : "light"}/>}
                />
                <BottomNavigationAction
                    value="notificaciones"
                    label="Notificaciones"
                    icon={<NotificationsIcon
                        fontSize={23}
                        color={notificationsSelected ? "text" : "text-light"}
                    />}
                />
            </BottomNavigation>
        </Paper>
    </Box>
}

export default BottomBarMobile