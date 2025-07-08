import CabildoIcon from "../icons/home-icon";
import React from "react";
import {usePathname, useRouter} from "next/navigation";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "../icons/notifications-icon";
import TopicsIcon from "@/components/icons/topics-icon";
import {BottomNavigation, BottomNavigationAction, Box, Paper} from "@mui/material";

export const BottomBarMobile = () => {
    const pathname = usePathname()
    const router = useRouter()

    const values = ["inicio", "temas", "buscar", "notificaciones"]
    const value: string = values.find(v => pathname.startsWith(`/${v}`)) ?? null

    return <Box sx={{display: {xs: 'block', sm: 'block', md: 'none'}}}>
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
                    bgcolor: 'var(--background-dark)',
                    '& .Mui-selected': {
                        '& .MuiBottomNavigationAction-label': {
                            fontSize: theme => theme.typography.caption,
                            transition: 'none',
                            fontWeight: 'bold',
                            lineHeight: '20px'
                        },
                        '& .MuiSvgIcon-root, & .MuiBottomNavigationAction-label': {
                            color: theme => 'var(--text)'
                        }
                    }
                }}
            >
                <BottomNavigationAction value="inicio" label="Inicio" icon={<CabildoIcon/>}/>
                <BottomNavigationAction value="temas" label="Temas" icon={<TopicsIcon/>}/>
                <BottomNavigationAction value="buscar" label="Buscar" icon={<SearchIcon/>}/>
                <BottomNavigationAction value="notificaciones" label="Notificaciones" icon={<NotificationsIcon/>}/>
            </BottomNavigation>
        </Paper>
    </Box>
}