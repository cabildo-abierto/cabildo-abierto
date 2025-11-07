import HomeIcon from "@/components/layout/icons/home-icon";
import React, {ReactNode} from "react";
import {usePathname, useRouter} from "next/navigation";
import NotificationsIcon from "@/components/layout/icons/notifications-icon";
import TopicsIcon from "@/components/layout/icons/topics-icon";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {BaseIconButton} from "@/components/layout/base/base-icon-button";
import {cn} from "@/lib/utils"
import SearchIcon from "@/components/layout/icons/search-icon";


const BottomBarMobileIcon = ({
                                 href,
                                 label,
                                 isSelected,
                                 children
                             }: {
    label: string
    href: string
    isSelected: boolean
    children: ReactNode
}) => {
    const router = useRouter()

    return <BaseIconButton
        key={label}
        onClick={() => router.push(href)}
        className={cn(
            "group flex h-full w-full flex-col items-center justify-center space-y-0.5 rounded-none p-0 text-[var(--text-light)] transition-all hover:text-[var(--text)]",
            {
                "text-[var(--text)]": isSelected,
            }
        )}
    >
        {children}

        <span
            className={cn(
                "text-xs leading-4 transition-all",
                {
                    "font-bold": isSelected,
                }
            )}
        >
            {label}
        </span>
    </BaseIconButton>
}


const BottomBarMobile = () => {
    const pathname = usePathname()
    const {isMobile} = useLayoutConfig()
    if (!isMobile) return null

    const notificationsSelected = pathname.startsWith("/notificaciones")
    const topicsSelected = pathname.startsWith("/temas")
    const searchSelected = pathname.startsWith("/buscar")
    const homeSelected = pathname.startsWith("/inicio")

    return <div
        className={"fixed bottom-0 left-0 right-0"}
    >
        <div
            className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--accent-dark)] bg-[var(--background-dark)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]"
        >
            <nav className="flex h-14 w-full items-center justify-around">
                <BottomBarMobileIcon
                    label={"Inicio"}
                    href={"/inicio"}
                    isSelected={homeSelected}
                >
                    <HomeIcon fontSize={23} weight={homeSelected ? "fill" : "light"}/>
                </BottomBarMobileIcon>
                <BottomBarMobileIcon
                    label={"Temas"}
                    href={"/temas"}
                    isSelected={topicsSelected}
                >
                    <TopicsIcon fontSize={23} weight={topicsSelected ? "bold" : "light"}/>
                </BottomBarMobileIcon>
                <BottomBarMobileIcon
                    label={"Buscar"}
                    href={"/buscar"}
                    isSelected={searchSelected}
                >
                    <SearchIcon color="var(--text)" fontSize={23} weight={searchSelected ? "bold" : "light"}/>
                </BottomBarMobileIcon>
                <BottomBarMobileIcon
                    label={"Notificaciones"}
                    href={"/notificaciones"}
                    isSelected={notificationsSelected}
                >
                    <NotificationsIcon
                        fontSize={23}
                        weight={notificationsSelected ? "fill" : "light"}
                    />
                </BottomBarMobileIcon>
            </nav>
        </div>

    </div>
}

export default BottomBarMobile