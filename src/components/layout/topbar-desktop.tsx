import {SearchPanelOnRightColumn} from "@/components/layout/search-panel-on-right-column";
import React from "react";
import {usePathname, useRouter} from "next/navigation";
import {useLayoutConfig} from "@/components/layout/layout-config-context";

import dynamic from "next/dynamic";
import {useSearch} from "@/components/buscar/search-context";
import {OpenSidebarButton} from "@/components/layout/open-sidebar-button";
import {MainFeedHeader} from "@/components/inicio/main-feed-header";
import MainSearchBar from "@/components/buscar/main-search-bar";
import NewConvButton from "@/components/mensajes/new-conv-button";
import {TopicsPageHeader} from "@/components/topics/topics-page-header";
import {TopbarConversation} from "@/components/mensajes/topbar-conversation";
import {TopbarFollowx} from "@/components/layout/topbar-followx";
import { InfoPanelUserSuggestions } from "../profile/info-panel-user-suggestions";
import {useTopbarTitle} from "@/components/layout/topbar-title";


const UserSearchResultsOnRightPanel = dynamic(() => import("@/components/buscar/user-search-results-on-right-panel"),
    {ssr: false}
)

export default function TopbarDesktop() {
    const {isMobile} = useLayoutConfig()
    const pathname = usePathname()
    const inSearchPage = pathname.startsWith("/buscar") || pathname.startsWith("/temas")
    const router = useRouter()
    const {searchState} = useSearch()
    const {layoutConfig} = useLayoutConfig()
    const {title} = useTopbarTitle()

    const showSearchButton = searchState.searching && searchState.value.length > 0

    const searching = searchState.searching && searchState.value.length > 0
    const handleSubmit = () => {
        if (searchState.value.length > 0) {
            router.push("/buscar?q=" + encodeURIComponent(searchState.value));
        }
    }

    return <div
        className={"fixed top-0 left-0 items-center px-3 bg-[var(--background)] w-screen border-b border-[var(--text-lighter)] z-[1100] flex " + (isMobile ? "flex-col h-24" : "justify-between h-12")}
    >

        <div className="flex justify-between h-full w-full">
            <div className={"flex-shrink-0 h-full flex items-center " + (layoutConfig.spaceForLeftSide ? "w-56" : "w-20")}>
                <OpenSidebarButton/>
            </div>

            <div className={"w-full flex h-full justify-center items-center"}>
                <div
                    className={`flex-grow flex items-center w-full justify-between`}
                    style={{
                        minWidth: 0,
                        maxWidth: layoutConfig.maxWidthCenter,
                    }}
                >
                    {title && !pathname.startsWith("/buscar") && !pathname.startsWith("/mensajes/") && <div className={"font-bold uppercase"}>
                        {title}
                    </div>}

                    {pathname.startsWith("/perfil/") && (pathname.endsWith("/siguiendo") || pathname.endsWith("/seguidores")) &&
                        <TopbarFollowx/>
                    }

                    {pathname.startsWith("/inicio") && <MainFeedHeader/>}

                    {pathname.startsWith("/buscar") && <div className={"px-2 w-full"}>
                        <MainSearchBar autoFocus={true} fullWidth={true} paddingY={"6px"}/>
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
                    className="flex-shrink-0 sticky no-scrollbar overflow-y-auto h-full flex items-center"
                    style={{width: layoutConfig.rightMinWidth}}
                >
                    {!inSearchPage && <>
                        <div className={"w-[276px] mr-7"}>
                            <SearchPanelOnRightColumn/>
                        </div>

                        {searching && <div className={"w-[276px] z-[1100] absolute top-12 right-7"}>
                            <UserSearchResultsOnRightPanel
                                showSearchButton={showSearchButton}
                                handleSubmit={handleSubmit}
                            />
                        </div>}
                    </>}
                </div>
            }
        </div>
    </div>
}