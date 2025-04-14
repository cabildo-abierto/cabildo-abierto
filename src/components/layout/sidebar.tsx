import React, {useEffect, useState} from "react";
import { SidebarButton } from "./sidebar-button";
import { CustomLink as Link } from '../../../modules/ui-utils/src/custom-link';
import PersonIcon from '@mui/icons-material/Person';
import { UserProps } from "@/lib/definitions";
import { CabildoIcon } from "../icons/home-icon";
import { SupportIcon } from "../icons/support-icon";
import VisualizationsIcon from "@mui/icons-material/AutoGraph";
import {ProfilePic} from "../feed/profile-pic";
import SettingsIcon from "../icons/settings-icon";
import TopicsIcon from "@mui/icons-material/CollectionsBookmark";
import {NotificationsIcon} from "../icons/notifications-icon";
import {usePathname} from "next/navigation";
import SearchIcon from "@mui/icons-material/Search";
import {WritePanel} from "../writing/write-panel";
import { useLayoutConfig } from "./layout-config-context";
import {WriteButtonIcon} from "../icons/write-button-icon";
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import CollectionsBookmarkOutlinedIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SenadoIcon from '../../../public/senado-icono.svg';
import SenadoIconActive from '../../../public/senado-icono-active.svg';
import Image from 'next/image'
import { useTheme } from "../theme/theme-context";
import {urlCongreso, userUrl} from "@/utils/uri";
import {FloatingWriteButton} from "../writing/floating-write-button";
import {useUser} from "@/hooks/swr";
import {dimOnHoverClassName} from "../../../modules/ui-utils/src/dim-on-hover-link";
import {Button} from "../../../modules/ui-utils/src/button";
import {IconButton} from "../../../modules/ui-utils/src/icon-button";


const HelpDeskButton = ({user, onClose, showText, setShowText}: {showText: boolean, setShowText: (v: boolean) => void, user?: UserProps, onClose: () => void}) => {
    const count = 0 // TO DO: Implement
    return <SidebarButton showText={showText} icon={<SupportIcon newCount={count}/>} onClick={onClose} text="Responder" href="/soporte/responder"/>
}


const SidebarUsernameNoUser = () => {
    return <div className="flex flex-col items-center">
        <Link href="/public" className="link3 text-center text-[var(--text-light)] px-1 text-sm mb-4">Creá una cuenta o iniciá sesión para acceder a todas las funcionalidades del sitio</Link>
    </div>
}


const SidebarWriteButton = ({onClick, showText}: {showText: boolean, onClick: () => void}) => {


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
                marginLeft: "10px",
                color: "var(--text)"
            }}
            color={"primary"}
            onClick={() => {onClick()}}
            id={"write-button"}
        >
            Escribir
        </Button> :
            <Button
                color={"primary"}
                onClick={() => {onClick()}}
                variant={"text"}
                size={"large"}
                id={"write-button"}
            >
                <WriteButtonIcon/>
            </Button>
        }
    </div>
    </>
}


export const SidebarContent = ({onClose}: { onClose: () => void }) => {
    const user = useUser()
    const pathname = usePathname()
    const [writePanelOpen, setWritePanelOpen] = useState(false)
    const {layoutConfig, setLayoutConfig} = useLayoutConfig()
    const {currentTheme} = useTheme()

    useEffect(() => {
        if((!layoutConfig.spaceForLeftSide && layoutConfig.openSidebar) || (layoutConfig.spaceForLeftSide && !layoutConfig.openSidebar && layoutConfig.defaultSidebarState)){
            setLayoutConfig((prev) => ({
                ...prev,
                openSidebar: layoutConfig.spaceForLeftSide
            }))
        }
    }, [layoutConfig.defaultSidebarState, layoutConfig.spaceForLeftSide])

    const showText = layoutConfig.openSidebar
    function setShowText(v: boolean){
        if(v != layoutConfig.openSidebar){
            setLayoutConfig((prev) => ({
                ...prev,
                openSidebar: v
            }))
        }
    }

    return (
    <>
        <div
            className={"pt-4 px-2 bg-[var(--background)] overflow-scroll no-scrollbar h-screen " + (showText ? "w-56" : "w-20 hidden min-[500px]:block")}
        >
            <div className={"h-full flex flex-col justify-between"}>
                <div className={"flex flex-col space-y-2 " + (showText ? "" : "items-center")}>

                    <div className={"mb-4"}>
                        {user.user &&
                            <div className={"w-full flex justify-center"}>
                                <Link href={userUrl(user.user.handle)}>
                                    <ProfilePic user={user.user} className={"w-12 h-12 rounded-full border " + dimOnHoverClassName}/>
                                </Link>
                            </div>
                        }
                        {!user.isLoading && !user.user && <SidebarUsernameNoUser/>}
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
                        showText={showText}
                        icon={<SearchIcon sx={{ strokeWidth: 1, stroke: "var(--text)" }}/>}
                        iconInactive={<SearchIcon/>}
                        onClick={onClose}
                        text="Buscar"
                        selected={pathname.startsWith("/buscar")}
                        href="/buscar"
                    />
                    <SidebarButton
                        showText={showText}
                        onClick={onClose}
                        icon={<NotificationsIcon count={0}/>}
                        iconInactive={<NotificationsOutlinedIcon/>}
                        text="Notificaciones"
                        href="/notificaciones"
                        selected={pathname.startsWith("/notificaciones")}
                    />
                    <SidebarButton
                        icon={<TopicsIcon fontSize="medium"/>}
                        iconInactive={<CollectionsBookmarkOutlinedIcon/>}
                        onClick={onClose}
                        text="Temas"
                        href="/temas"
                        id={"temas"}
                        showText={showText}
                        selected={pathname.startsWith("/temas") && !pathname.startsWith("/temas/congreso")}
                    />
                    <SidebarButton
                        icon={<div className={"w-6 h-6 flex items-center justify-center py-2"}>
                            <Image
                            className={currentTheme == "light" ? "brightness-0" : ""}
                            src={SenadoIconActive}
                            alt="Icon"
                            width={24}
                            height={24}
                            />
                        </div>}
                        iconInactive={<div className={"w-6 h-6 flex items-center justify-center py-2"}>
                            <Image
                            className={currentTheme == "light" ? "brightness-0" : ""}
                            src={SenadoIcon}
                            alt="Icon"
                            width={24}
                            height={24}
                            />
                        </div>}
                        onClick={onClose}
                        text="Congreso"
                        href={urlCongreso}
                        id={"congreso"}
                        selected={pathname.startsWith(urlCongreso)}
                        showText={showText}
                    />
                    <SidebarButton
                        icon={<VisualizationsIcon sx={{ strokeWidth: 1, stroke: "var(--text)" }}/>}
                        iconInactive={<VisualizationsIcon/>}
                        onClick={onClose}
                        text="Explorar datos"
                        href="/datos"
                        id={"datos"}
                        selected={pathname.startsWith("/datos")}
                        showText={showText}
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
                        <SidebarWriteButton showText={showText} onClick={() => {setWritePanelOpen(true)}}/>
                    </div>
                </div>
                <div className={"text-[var(--text-light)] flex justify-end mb-2 max-[500px]:hidden"}>
                    <IconButton
                        size={"small"}
                        color={"inherit"}
                        onClick={() => {setShowText(!showText)}}
                    >
                        {showText ? <KeyboardDoubleArrowLeftIcon/> : <KeyboardDoubleArrowRightIcon/>}
                    </IconButton>
                </div>
            </div>
        </div>
        <WritePanel
            open={writePanelOpen}
            onClose={() => {setWritePanelOpen(false)}}
        />
    </>
    )
}