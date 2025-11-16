import React from "react";
import {usePathname} from "next/navigation";
import {MainFeedHeader} from "../../../feed/feed/main-feed-header";
import MainSearchBar from "../../../buscar/main-search-bar";
import {BackButton} from "@/components/utils/base/back-button";
import {Logo} from "@/components/utils/icons/logo";
import {useTopbarHeight} from "./topbar-height";
import {TopicsPageHeader} from "../../../temas/topics-page-header";
import {TopbarConversation} from "../../../mensajes/topbar-conversation";
import {useTopbarTitle} from "./topbar-title";
import {InfoPanelUserSuggestions} from "../../../perfil/info-panel-user-suggestions";
import {TopicTopbarRight} from "../../../tema/topic-topbar-right";
import {TopbarTopicFeed} from "../../../tema/mentions-feed/topbar-topic-feed";
import {SidebarMobile} from "../sidebar/sidebar-mobile";
import {useLayoutConfig} from "../layout-config-context";
import NewConvButton from "../../../mensajes/new-conv-button";


export default function TopbarMobile({setWritePanelOpen}: {
    setWritePanelOpen: (v: boolean) => void
}) {
    const pathname = usePathname()
    const {title, className: titleClassName} = useTopbarTitle()
    const height = useTopbarHeight()
    const {layoutConfig} = useLayoutConfig()

    const backButton = ["c/", "notificaciones", "panel", "ajustes", "perfil", "mensajes", "escribir/articulo", "aportar"]
        .some(p => pathname.startsWith(`/${p}`))
    const defaultBackHref = ""
    const openSidebarButton = !backButton

    const isTopicFeed = pathname.startsWith("/tema/menciones")
    const showTitle = !isTopicFeed

    return <div
        style={{height}}
        className={"fixed top-0 left-0 flex flex-col bg-[var(--background)] w-screen border-[var(--accent-dark)] border-b-[1px] z-[1000]"}
    >
        <div className={"flex justify-between items-center w-full h-12 px-2"}>
            <div className={"flex space-x-2 items-center h-12 w-full"}>
                {backButton && !pathname.startsWith("/mensajes") && <BackButton
                    defaultURL={defaultBackHref}
                    behavior={"ca-back"}
                />}
                {openSidebarButton && !pathname.startsWith("/inicio") && !pathname.startsWith("/buscar") && !pathname.startsWith("/temas") && <SidebarMobile
                    setWritePanelOpen={setWritePanelOpen}
                />}

                {showTitle && title && !pathname.startsWith("/buscar") && !pathname.startsWith("/mensajes") && <div className={titleClassName ?? " font-bold uppercase"}>
                    {title}
                </div>}

                {isTopicFeed && <div className={"max-w-[calc(100vw-175px)]"}>
                    <TopbarTopicFeed/>
                </div>}

                {(pathname.startsWith("/inicio") || pathname.startsWith("/buscar") || pathname.startsWith("/temas")) && <div className={"flex justify-between items-center w-full"}>
                    <div className={"flex-1"}>
                        <SidebarMobile setWritePanelOpen={setWritePanelOpen}/>
                    </div>
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
            {pathname.startsWith("/perfil/cuentas-sugeridas") && <div
                className={"flex flex-1 justify-end text-[var(--text-light)]"}
            >
                <InfoPanelUserSuggestions/>
            </div>}

            {pathname.startsWith("/mensajes") && !pathname.startsWith("/mensajes/") && <div>
                <NewConvButton/>
            </div>}
        </div>
        {pathname.startsWith("/inicio") && <div
            className={"h-12 w-full flex justify-center"}
        >
            <div
                style={{maxWidth: layoutConfig.maxWidthCenter}}
                className={"w-full"}
            >
                <MainFeedHeader/>
            </div>
        </div>}
        {pathname.startsWith("/buscar") && <div
            className={"h-12 w-full flex justify-center items-center"}
        >
            <div
                style={{maxWidth: layoutConfig.maxWidthCenter}}
                className={"w-full px-2"}
            >
                <MainSearchBar
                    autoFocus={true}
                />
            </div>
        </div>}
        {pathname.startsWith("/temas") && <div className={"h-12 flex justify-center w-full"}>
            <div
                style={{maxWidth: layoutConfig.maxWidthCenter}}
                className={"w-full h-full items-center"}
            >
                <TopicsPageHeader/>
            </div>
        </div>}
    </div>
}