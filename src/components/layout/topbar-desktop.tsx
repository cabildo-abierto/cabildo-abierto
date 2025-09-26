import {SearchPanelOnRightColumn} from "@/components/layout/search-panel-on-right-column";
import React from "react";
import {usePathname} from "next/navigation";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {OpenSidebarButton} from "@/components/layout/open-sidebar-button";
import {MainFeedHeader} from "@/components/inicio/main-feed-header";
import NewConvButton from "@/components/mensajes/new-conv-button";
import {TopicsPageHeader} from "@/components/topics/topics-page-header";
import {TopbarConversation} from "@/components/mensajes/topbar-conversation";
import {TopbarFollowx} from "@/components/layout/topbar-followx";
import { InfoPanelUserSuggestions } from "../profile/info-panel-user-suggestions";
import {useDefaultBackURL, useTopbarTitle} from "@/components/layout/topbar-title";
import {BackButton} from "../../../modules/ui-utils/src/back-button";
import MainSearchBar from "@/components/buscar/main-search-bar";


export default function TopbarDesktop() {
    const {isMobile} = useLayoutConfig()
    const pathname = usePathname()
    const inSearchPage = pathname.startsWith("/buscar") || pathname.startsWith("/temas")

    const {layoutConfig} = useLayoutConfig()
    const {title} = useTopbarTitle()
    const {defaultURL} = useDefaultBackURL()

    const backButton = pathname.startsWith("/c/") ||
        pathname.startsWith("/tema") && !pathname.startsWith("/temas") ||
        pathname.startsWith("/aportar") ||
        pathname.startsWith("/escribir/articulo")

    return <div
        className={"fixed top-0 left-0 items-center bg-[var(--background)] w-full border-b border-[var(--text-lighter)] z-[1100] flex " + (isMobile ? "flex-col h-24" : "justify-between h-12")}
    >

        <div className="flex justify-between h-full w-full">
            <div className={"flex-shrink-0 px-3 h-full flex items-center " + (layoutConfig.spaceForLeftSide ? "w-56" : "w-20")}>
                <OpenSidebarButton/>
            </div>

            <div className={"w-full flex h-full justify-center items-center "}>
                <div
                    className={`flex-grow flex items-center w-full justify-between`}
                    style={{
                        minWidth: 0,
                        maxWidth: layoutConfig.maxWidthCenter,
                    }}
                >
                    {title && !pathname.startsWith("/buscar") && !pathname.startsWith("/mensajes/") && <div className={"font-bold uppercase flex space-x-2 items-center"}>
                        {backButton && <BackButton
                            behavior={"ca-back"}
                            size={"medium"}
                            defaultURL={defaultURL}
                        />}
                        <div>
                        {title}
                        </div>
                    </div>}

                    {pathname.startsWith("/perfil/") && (pathname.endsWith("/siguiendo") || pathname.endsWith("/seguidores")) &&
                        <TopbarFollowx/>
                    }

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

                </div>
            </div>

            {layoutConfig.spaceForRightSide &&
                <div
                    className="flex-shrink-0 sticky no-scrollbar h-full flex items-center"
                    style={{width: layoutConfig.rightMinWidth}}
                >
                    {!inSearchPage && <>
                        <div className={"w-[276px] mr-7"}>
                            <SearchPanelOnRightColumn/>
                        </div>
                    </>}
                </div>
            }
        </div>
    </div>
}