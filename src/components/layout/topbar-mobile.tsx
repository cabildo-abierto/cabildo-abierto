import React from "react";
import {usePathname} from "next/navigation";
import {OpenSidebarButton} from "@/components/layout/open-sidebar-button";
import {MainFeedHeader} from "@/components/inicio/main-feed-header";
import MainSearchBar from "@/components/buscar/main-search-bar";
import {BackButton} from "../../../modules/ui-utils/src/back-button";
import {Logo} from "../../../modules/ui-utils/src/logo";
import {useTopbarHeight} from "@/components/layout/topbar-height";
import {TopicsPageHeader} from "@/components/topics/topics-page-header";
import {TopbarConversation} from "@/components/mensajes/topbar-conversation";
import {TopbarFollowx} from "@/components/layout/topbar-followx";
import {useTopbarTitle} from "@/components/layout/topbar-title";
import {InfoPanelUserSuggestions} from "@/components/profile/info-panel-user-suggestions";


export default function Topbarmobile() {
    const pathname = usePathname()
    const {title} = useTopbarTitle()
    const height = useTopbarHeight()

    const backButton = ["notificaciones", "panel", "ajustes", "perfil", "mensajes", "escribir/articulo"]
        .some(p => pathname.startsWith(`/${p}`))
    const defaultBackHref = ""
    const openSidebarButton = !backButton

    return <div
        style={{height}}
        className={"fixed top-0 left-0 flex flex-col px-2 bg-[var(--background)] w-screen border-[var(--text-light)] border-b-[1px] z-[1100]"}
    >
        <div className={"flex space-x-2 items-center h-12 w-full"}>
            {backButton && !pathname.startsWith("/mensajes") && <BackButton
                defaultURL={defaultBackHref}
                behavior={"ca-back"}
                size={"medium"}
            />}
            {openSidebarButton && !pathname.startsWith("/inicio") && !pathname.startsWith("/buscar") && !pathname.startsWith("/temas") && <OpenSidebarButton/>}

            {title && !pathname.startsWith("/buscar") && !pathname.startsWith("/mensajes") && <div className={"font-bold uppercase"}>
                {title}
            </div>}

            {(pathname.startsWith("/inicio") || pathname.startsWith("/buscar") || pathname.startsWith("/temas")) && <div className={"flex justify-between items-center w-full"}>
                <div className={"flex-1"}><OpenSidebarButton/></div>
                <Logo width={32} height={32} showLabel={false}/>
                <div className={"flex-1"}/>
            </div>}

            {pathname.startsWith("/mensajes/") && <TopbarConversation/>}
            {pathname.startsWith("/mensajes") && !pathname.startsWith("/mensajes/") && <div className={"flex space-x-2 items-center"}>
                <BackButton
                    defaultURL={defaultBackHref}
                    behavior={"ca-back"}
                    size={"medium"}
                />
                <div className={"font-bold uppercase"}>
                    Mensajes
                </div>
            </div>}
            {pathname.startsWith("/perfil/") && (pathname.endsWith("/siguiendo") || pathname.endsWith("/seguidores")) && <TopbarFollowx/>}
            {pathname.startsWith("/perfil/cuentas-sugeridas") && <div className={"flex flex-1 justify-end"}>
                <InfoPanelUserSuggestions/>
            </div>}

        </div>
        {pathname.startsWith("/inicio") && <div className={"h-12 w-full"}>
            <MainFeedHeader/>
        </div>}
        {pathname.startsWith("/buscar") && <div className={"h-12 w-full flex items-center"}>
            <MainSearchBar
                autoFocus={true}
                fullWidth={true}
                paddingY={"6px"}
            />
        </div>}
        {pathname.startsWith("/temas") && <div className={"h-12 w-full"}>
            <TopicsPageHeader/>
        </div>}
    </div>
}