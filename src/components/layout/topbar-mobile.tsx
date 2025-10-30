import React from "react";
import {usePathname} from "next/navigation";
import {OpenSidebarButton} from "@/components/layout/open-sidebar-button";
import {MainFeedHeader} from "@/components/inicio/main-feed-header";
import MainSearchBar from "@/components/buscar/main-search-bar";
import {BackButton} from "./utils/back-button";
import {Logo} from "./utils/logo";
import {useTopbarHeight} from "@/components/layout/topbar-height";
import {TopicsPageHeader} from "@/components/topics/topics-page-header";
import {TopbarConversation} from "@/components/mensajes/topbar-conversation";
import {useTopbarTitle} from "@/components/layout/topbar-title";
import {InfoPanelUserSuggestions} from "@/components/profile/info-panel-user-suggestions";
import {TopicTopbarRight} from "@/components/topics/topic/topic-topbar-right";
import {TopbarTopicFeed} from "@/components/topics/mentions-feed/topbar-topic-feed";


export default function TopbarMobile() {
    const pathname = usePathname()
    const {title, className: titleClassName} = useTopbarTitle()
    const height = useTopbarHeight()

    const backButton = ["notificaciones", "panel", "ajustes", "perfil", "mensajes", "escribir/articulo"]
        .some(p => pathname.startsWith(`/${p}`))
    const defaultBackHref = ""
    const openSidebarButton = !backButton

    const isTopicFeed = pathname.startsWith("/tema/menciones")
    const showTitle = !isTopicFeed

    return <div
        style={{height}}
        className={"fixed top-0 left-0 flex flex-col px-2 bg-[var(--background)] w-screen border-[var(--accent-dark)] border-b-[1px] z-[1100]"}
    >
        <div className={"flex justify-between items-center w-full h-12"}>
            <div className={"flex space-x-2 items-center h-12 w-full"}>
                {backButton && !pathname.startsWith("/mensajes") && <BackButton
                    defaultURL={defaultBackHref}
                    behavior={"ca-back"}
                />}
                {openSidebarButton && !pathname.startsWith("/inicio") && !pathname.startsWith("/buscar") && !pathname.startsWith("/temas") && <OpenSidebarButton/>}

                {showTitle && title && !pathname.startsWith("/buscar") && !pathname.startsWith("/mensajes") && <div className={titleClassName ?? " font-bold uppercase"}>
                    {title}
                </div>}

                {isTopicFeed && <div className={"max-w-[calc(100vw-175px)]"}>
                    <TopbarTopicFeed/>
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
                    />
                    <div className={"font-bold uppercase"}>
                        Mensajes
                    </div>
                </div>}
            </div>
            {pathname.startsWith("/tema") && !pathname.startsWith("/temas") &&
                <TopicTopbarRight/>}
        </div>
        {pathname.startsWith("/perfil/cuentas-sugeridas") && <div className={"flex flex-1 justify-end"}>
            <InfoPanelUserSuggestions/>
        </div>}
        {pathname.startsWith("/inicio") && <div
            className={"h-12 w-full"}
        >
            <MainFeedHeader/>
        </div>}
        {pathname.startsWith("/buscar") && <div
            className={"h-12 w-full flex items-center"}
        >
            <MainSearchBar
                autoFocus={true}
            />
        </div>}
        {pathname.startsWith("/temas") && <div className={"h-12 w-full"}>
            <TopicsPageHeader/>
        </div>}
    </div>
}