import {SearchPanelOnRightColumn} from "@/components/layout/search-panel-on-right-column";
import React from "react";
import {usePathname} from "next/navigation";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {OpenSidebarButton} from "@/components/layout/open-sidebar-button";
import {MainFeedHeader} from "@/components/inicio/main-feed-header";
import NewConvButton from "@/components/mensajes/new-conv-button";
import {TopicsPageHeader} from "@/components/topics/topics-page-header";
import {TopbarConversation} from "@/components/mensajes/topbar-conversation";
import { InfoPanelUserSuggestions } from "../profile/info-panel-user-suggestions";
import {useDefaultBackURL, useTopbarTitle} from "@/components/layout/topbar-title";
import {BackButton} from "./utils/back-button";
import MainSearchBar from "@/components/buscar/main-search-bar";
import {TopicTopbarRight} from "@/components/topics/topic2/topic-topbar-right";
import {TopbarTopicFeed} from "@/components/topics/mentions-feed/topbar-topic-feed";
import {pxToNumber} from "@/utils/strings";


export default function TopbarDesktop() {
    const {isMobile} = useLayoutConfig()
    const pathname = usePathname()
    const inSearchPage = pathname.startsWith("/buscar") || pathname.startsWith("/temas")

    const {layoutConfig} = useLayoutConfig()
    const {title, className: titleClassName} = useTopbarTitle()
    const {defaultURL} = useDefaultBackURL()

    const backButton = pathname.startsWith("/c/") ||
        pathname.startsWith("/tema") && !pathname.startsWith("/temas") ||
        pathname.startsWith("/aportar") ||
        pathname.startsWith("/escribir/articulo") ||
        pathname.startsWith("/perfil")

    const showTitle = !pathname.startsWith("/buscar") && !pathname.startsWith("/mensajes/") && !pathname.startsWith("/tema/menciones")

    return <div
        className={"fixed top-0 left-0 items-center bg-[var(--background)] w-full border-b border-[var(--accent-dark)] z-[1100] flex " + (isMobile ? "flex-col h-24" : "justify-between h-12")}
    >
        <div className="flex justify-between h-full w-full">
            <div className={(!layoutConfig.readingLayout ? "flex-shrink-0 " + (layoutConfig.spaceForLeftSide ? "w-56" : "w-20") : "fixed top-0 left-0 h-12")}>
                <div className={"px-3 h-full flex items-center"}>
                    <OpenSidebarButton/>
                </div>
            </div>

            <div className={"w-full flex h-full justify-center items-center "}>
                <div
                    className={`flex items-center w-full justify-between`}
                    style={{
                        minWidth: 0,
                        maxWidth: layoutConfig.centerWidth,
                    }}
                >
                    {title && showTitle && <div className={"font-bold uppercase flex space-x-2 items-center"}>
                        {backButton && <BackButton
                            behavior={"ca-back"}
                            size={"medium"}
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
                            fullWidth={true}
                            paddingY={"6px"}
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

                    {pathname.startsWith("/tema") && !pathname.startsWith("/temas") && <TopicTopbarRight/>}
                </div>
            </div>

            {layoutConfig.spaceForRightSide &&
                <div
                    className={"no-scrollbar flex items-center pr-2 " + (layoutConfig.readingLayout ? "fixed top-0 right-0 h-12" : "flex-shrink-0 sticky h-full")}
                    style={{width: pxToNumber(layoutConfig.rightMinWidth)-20}}
                >
                    {!inSearchPage && <>
                        <div className={"w-[292px]"}>
                            <SearchPanelOnRightColumn/>
                        </div>
                    </>}
                </div>
            }
        </div>
    </div>
}