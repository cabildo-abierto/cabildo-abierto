import {SearchPanelOnRightColumn} from "@/components/layout/search-panel-on-right-column";
import React from "react";
import {usePathname} from "next/navigation";
import {OpenSidebarButton} from "@/components/layout/open-sidebar-button";
import {MainFeedHeader} from "@/components/inicio/main-feed-header";
import NewConvButton from "@/components/mensajes/new-conv-button";
import {TopicsPageHeader} from "@/components/topics/topics-page-header";
import {TopbarConversation} from "@/components/mensajes/topbar-conversation";
import {InfoPanelUserSuggestions} from "../profile/info-panel-user-suggestions";
import {useDefaultBackURL, useTopbarTitle} from "@/components/layout/topbar-title";
import {BackButton} from "./utils/back-button";
import MainSearchBar from "@/components/buscar/main-search-bar";
import {TopicTopbarRight} from "@/components/topics/topic/topic-topbar-right";
import {TopbarTopicFeed} from "@/components/topics/mentions-feed/topbar-topic-feed";
import ThreeColumnsLayout from "@/components/layout/three-columns-layout";


const TopbarCenter = () => {
    const {defaultURL} = useDefaultBackURL()
    const {title, className: titleClassName} = useTopbarTitle()
    const pathname = usePathname()

    const backButton = pathname.startsWith("/c/") ||
        pathname.startsWith("/tema") && !pathname.startsWith("/temas") ||
        pathname.startsWith("/aportar") ||
        pathname.startsWith("/escribir/articulo") ||
        pathname.startsWith("/perfil")

    const showTitle = !pathname.startsWith("/buscar") && !pathname.startsWith("/mensajes/") && !pathname.startsWith("/tema/menciones")

    return <div className={"h-12 flex justify-between space-x-2 items-center"}>
        {title && showTitle && <div className={"font-bold uppercase flex space-x-2 items-center"}>
            {backButton && <BackButton
                behavior={"ca-back"}
                size={"default"}
                defaultURL={defaultURL}
            />}
            <div className={titleClassName}>
                {title}
            </div>
        </div>}

        {pathname.startsWith("/inicio") && <MainFeedHeader/>}

        {pathname.startsWith("/buscar") && <div className={"w-full px-2"}>
            <MainSearchBar
                autoFocus={true}
            />
        </div>}

        {pathname.startsWith("/perfil/cuentas-sugeridas") && <div className={"flex-1 flex justify-end"}>
            <InfoPanelUserSuggestions/>
        </div>}

        {pathname.startsWith("/mensajes") && !pathname.startsWith("/mensajes/") && <div>
            <NewConvButton/>
        </div>}

        {pathname.startsWith("/temas") && <TopicsPageHeader/>}

        {pathname.startsWith("/mensajes/") && <TopbarConversation/>}

        {pathname.startsWith("/tema/menciones") && <TopbarTopicFeed/>}

        {pathname.startsWith("/tema") && !pathname.startsWith("/temas") &&
            <div className={"pr-2"}>
                <TopicTopbarRight/>
            </div>}
    </div>
}


export default function TopbarDesktop() {
    const pathname = usePathname()
    const inSearchPage = pathname.startsWith("/buscar") || pathname.startsWith("/temas")

    const leftPanel = <div className={"px-3 h-12 flex items-center"}>
        <OpenSidebarButton/>
    </div>

    const rightPanel = !inSearchPage ? <div className={"w-[292px] h-12 flex items-center"}>
        <SearchPanelOnRightColumn/>
    </div> : null

    return <div className={"w-full h-12 z-[1000] bg-[var(--background)] fixed top-0 left-0 border-b border-[var(--accent-dark)]"}>
        <ThreeColumnsLayout
            leftPanel={leftPanel}
            rightPanel={rightPanel}
        >
            <TopbarCenter/>
        </ThreeColumnsLayout>
    </div>
}