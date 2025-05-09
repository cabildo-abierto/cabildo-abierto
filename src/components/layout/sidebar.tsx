import React, {useEffect, useState} from "react";
import {SidebarButton} from "./sidebar-button";
import {CustomLink as Link} from '../../../modules/ui-utils/src/custom-link';
import PersonIcon from '@mui/icons-material/Person';
import {CabildoIcon} from "../icons/home-icon";
import {SupportIcon} from "../icons/support-icon";
import {ProfilePic} from "../profile/profile-pic";
import SettingsIcon from "../icons/settings-icon";
import TopicsIcon from "@mui/icons-material/CollectionsBookmark";
import {NotificationsIcon} from "../icons/notifications-icon";
import {usePathname} from "next/navigation";
import SearchIcon from "@mui/icons-material/Search";
import {WritePanel} from "../writing/write-panel/write-panel";
import {useLayoutConfig} from "./layout-config-context";
import {WriteButtonIcon} from "../icons/write-button-icon";
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import CollectionsBookmarkOutlinedIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import {profileUrl} from "@/utils/uri";
import {FloatingWriteButton} from "../writing/floating-write-button";
import {useSession} from "@/hooks/api";
import {dimOnHoverClassName} from "../../../modules/ui-utils/src/dim-on-hover-link";
import {Button} from "../../../modules/ui-utils/src/button";
import {IconButton} from "../../../modules/ui-utils/src/icon-button";


const HelpDeskButton = ({user, onClose, showText, setShowText}: {
    showText: boolean,
    setShowText: (v: boolean) => void,
    user?: {},
    onClose: () => void
}) => {
    const count = 0 // TO DO: Implement
    return <SidebarButton showText={showText} icon={<SupportIcon newCount={count}/>} onClick={onClose} text="Responder"
                          href="/soporte/responder"/>
}


const SidebarUsernameNoUser = () => {
    return <div className="flex flex-col items-center">
        <Link href="/public" className="link3 text-center text-[var(--text-light)] px-1 text-sm mb-4">Creá una cuenta o
            iniciá sesión para acceder a todas las funcionalidades del sitio</Link>
    </div>
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
                    Escribir
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
                    <WriteButtonIcon color={"inherit"}/>
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

    useEffect(() => {
        if ((!layoutConfig.spaceForLeftSide && layoutConfig.openSidebar) || (layoutConfig.spaceForLeftSide && !layoutConfig.openSidebar && layoutConfig.defaultSidebarState)) {
            setLayoutConfig((prev) => ({
                ...prev,
                openSidebar: layoutConfig.spaceForLeftSide
            }))
        }
    }, [layoutConfig.defaultSidebarState, layoutConfig.spaceForLeftSide])

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
                    <div className={"flex flex-col space-y-2 " + (showText ? "" : "items-center")}>

                        <div className={"mb-4"}>
                            {user.user &&
                                <div className={"w-full flex justify-center"}>
                                    <Link href={profileUrl(user.user.handle)}>
                                        <ProfilePic user={user.user}
                                                    className={"w-12 h-12 rounded-full border " + dimOnHoverClassName}
                                                    descriptionOnHover={false}/>
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
                            icon={<NotificationsIcon count={0}/>}
                            iconInactive={<NotificationsOutlinedIcon/>}
                            text="Notificaciones"
                            href="/notificaciones"
                            selected={pathname.startsWith("/notificaciones")}
                        />
                        {user.user &&
                            <SidebarButton
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