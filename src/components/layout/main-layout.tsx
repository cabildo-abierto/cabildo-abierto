"use client"
import React, { ReactNode } from "react";
import LoadingPage from "../loading-page";
import {SearchProvider, useSearch} from "../search/search-context";
import {BetaAccessPage} from "../beta-access-page";
import {ThreeColumnsLayout} from "../three-columns";
import {SidebarContent, SupportButton} from "../sidebar";
import { TrendingTopics } from "../trending-topics";
import SearchBar from "../searchbar";
import {UserSearchResults} from "../user-search-results";
import {useUser} from "../../hooks/user";
import {useParams, usePathname} from "next/navigation";
import InfoIcon from "@mui/icons-material/Info";
import {articleUrl} from "../utils";
import {BasicButton} from "../ui-utils/basic-button";
import {CustomLink as Link} from "../custom-link";
import {LayoutConfigProvider, useLayoutConfig} from "./layout-config-context";


const MainLayoutContent = ({children}: {children: ReactNode, distractionFree?: boolean}) => {
    const {searchState} = useSearch()
    const {layoutConfig} = useLayoutConfig()
    const {user} = useUser()
    const pathname = usePathname()

    const left = <div className={"fixed top-0 bottom-0 right-auto "+(layoutConfig.distractionFree ? "left-0 border-r" : "left-auto")}>
        <SidebarContent onClose={() => {}}/>
    </div>

    const inSearchPage = pathname.startsWith("/buscar")

    let right
    if(!layoutConfig.distractionFree){
        right = <div className={"fixed top-0 bottom-0 left-auto right-auto h-screen"}>
            {!inSearchPage && <div className={"ml-8 mt-8 max-w-[300px] w-full"}>
                <SearchBar onClose={() => {}} wideScreen={false}/>
            </div>}
            {!inSearchPage &&searchState.searching && searchState.value.length > 0 && <div className={"rounded border mt-2 ml-8 w-full max-w-[300px]"}>
                <UserSearchResults/>
            </div>}
            <div className={"ml-8 mt-8 flex justify-center w-full max-h-[600px] max-w-[300px]"}>
                <TrendingTopics route={[]} selected={"7days"}/>
            </div>
            <div className={"ml-8 mt-4 w-full max-w-[300px] flex flex-wrap gap-x-2"}>
                <SupportButton user={user} onClose={() => {}}/>
                <Link href={articleUrl("Cabildo_Abierto")} className={"text-[var(--text-light)]"}>
                    <BasicButton
                        variant={"text"}
                        size={"small"}
                        color={"inherit"}
                        startIcon={<InfoIcon/>}
                    >
                        Acerca de Cabildo Abierto
                    </BasicButton>
                </Link>
            </div>
        </div>
    }

    return <ThreeColumnsLayout maxWidthCenter={layoutConfig.distractionFree ? "800px" : "600px"} left={left} center={children} right={right} leftMinWidth={"224px"} border={!layoutConfig.distractionFree}/>
}


const MainLayout: React.FC<{children: ReactNode, distractionFree?: boolean}> = ({children, distractionFree=false}) => {

    return <>
        <LoadingPage>
            <BetaAccessPage>
                <SearchProvider>
                    <LayoutConfigProvider distractionFree={distractionFree}>
                        <MainLayoutContent>
                            {children}
                        </MainLayoutContent>
                    </LayoutConfigProvider>
                </SearchProvider>
            </BetaAccessPage>
        </LoadingPage>
    </>
};

export default MainLayout;