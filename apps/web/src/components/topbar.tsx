"use client"

import Link from "next/link";
import {usePathname} from "next/navigation";
import {HouseIcon, PlusIcon, SignOutIcon, UserCircleIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {ThemePicker} from "@/components/theme-picker";
import {useAuth} from "@/components/auth-provider";
import {NotificationBell} from "@/components/notification-bell";

export function Topbar() {
    const {user, logout} = useAuth();
    const pathname = usePathname();

    return <header className="sticky top-0 z-40 flex h-12 w-full items-center justify-between bg-background/95 px-4 backdrop-blur">
        <div>
            {pathname !== "/" && <Button nativeButton={false} render={<Link href="/"/>} variant="ghost" size="sm">
                <HouseIcon/>
                Inicio
            </Button>}
        </div>
        <div className="flex items-center gap-1">
            <ThemePicker/>
            <NotificationBell/>
            <Button nativeButton={false} render={<Link href="/nuevo-tema"/>} variant="ghost" size="sm">
                <PlusIcon/>
                Nuevo tema
            </Button>
            {user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="sm"/>}>
                        <UserCircleIcon/>
                        {user.username}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-max min-w-32">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>{user.username}</DropdownMenuLabel>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator/>
                        <DropdownMenuGroup>
                            <DropdownMenuItem className="whitespace-nowrap" onClick={() => void logout()}>
                                <SignOutIcon/>
                                Cerrar sesión
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <Button nativeButton={false} render={<Link href="/iniciar-sesion"/>} variant="ghost" size="sm">
                    Iniciar sesión
                </Button>
            )}
        </div>
    </header>;
}
