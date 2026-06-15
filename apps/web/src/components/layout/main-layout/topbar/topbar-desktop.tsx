import React from "react";
import {BaseIconButton} from "@/components/utils/base/base-icon-button";
import {
    DesktopIcon,
    GearSixIcon,
    MoonIcon, PowerIcon,
    SignInIcon,
    SquaresFourIcon,
    SunIcon,
    UserCircleIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import {useSession} from "@/components/auth/use-session";
import {ProfilePic} from "@/components/perfil/profile-pic";
import {BaseButton} from "@/components/utils/base/base-button";
import {useIsMobile} from "@/components/utils/use-is-mobile";
import {useLayoutState} from "@/components/layout/main-layout/layout-state-context";
import {useLoginModal} from "@/components/auth/login-modal-provider";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/utils/ui/dropdown-menu";
import {useTheme, type ThemeMode} from "@/components/layout/theme/theme-context";
import {profileUrl} from "@/components/utils/react/url";
import NotificationsIcon from "@/components/utils/icons/notifications-icon";
import {useLogout} from "@/components/auth/logout";

function ThemeModeButtons() {
    const {mode, setMode} = useTheme()
    return (
        <div className="flex gap-1 p-1 bg-[var(--background-dark)]">
            <BaseIconButton size={"small"} className={mode == "light" ? "bg-[var(--background-dark2)]" : ""} onClick={() => setMode("light")}>
                <SunIcon weight="bold"/>
            </BaseIconButton>
            <BaseIconButton size={"small"} className={mode == "dark" ? "bg-[var(--background-dark2)]" : ""} onClick={() => setMode("dark")}>
                <MoonIcon weight="bold"/>
            </BaseIconButton>
            <BaseIconButton size={"small"} className={mode == "system" ? "bg-[var(--background-dark2)]" : ""}  onClick={() => setMode("system")}>
                <DesktopIcon weight="bold"/>
            </BaseIconButton>
        </div>
    )
}

export default function TopbarDesktop() {
    const {user} = useSession()
    const {isMobile} = useIsMobile()
    const {setLayoutState} = useLayoutState()
    const {setLoginModalOpen} = useLoginModal()
    const {logout} = useLogout()

    return <div className={"flex justify-between items-center h-12 fixed z-[1500] top-0 left-0 w-full py-3 pl-3 pr-5"}>
        <div className={"flex items-center gap-x-4"}>
            <Link href={"/inicio"}>
                <BaseIconButton>
                    <SquaresFourIcon/>
                </BaseIconButton>
            </Link>
            <BaseIconButton>
                <NotificationsIcon/>
            </BaseIconButton>
        </div>

        {user && (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        className="rounded-full"
                    >
                        <ProfilePic user={user} className={"hover:scale-105 h-5 w-5 rounded-full"} descriptionOnHover={false} clickable={false}/>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8} className="z-[1501] portal group min-w-[11rem] p-0">
                    <DropdownMenuItem asChild>
                        <Link href={profileUrl(user.handle)}>
                            <UserCircleIcon weight="bold"/>
                            Perfil
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/ajustes">
                            <GearSixIcon weight="bold"/>
                            Configuración
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="m-0 bg-[var(--accent)]"/>
                    <ThemeModeButtons/>
                    <DropdownMenuSeparator className="m-0 bg-[var(--accent)]"/>
                    <DropdownMenuItem onClick={logout}>
                        <PowerIcon weight="bold"/>
                        Cerrar sesión
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )}
        {!user && <BaseButton
            startIcon={<SignInIcon/>}
            variant="outlined"
            size={isMobile ? "default" : "small"}
            className={"h-8"}
            onClick={() => {
                setLoginModalOpen(true);
                if(isMobile) {
                    setLayoutState((prev) => ({...prev, openSidebar: false}))
                }
            }}
        >
            Iniciar sesión
        </BaseButton>}
    </div>
}
