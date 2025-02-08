"use client"
import React, { ReactNode } from "react";
import LoadingPage from "../loading-page";
import {SearchProvider} from "../search/search-context";
import {BetaAccessPage} from "../beta-access-page";
import {ThreeColumnsLayout} from "../three-columns";
import {SidebarContent, SupportButton} from "../sidebar";
import { TrendingTopics } from "../trending-topics";
import {useUser} from "../../hooks/user";
import InfoIcon from "@mui/icons-material/Info";
import {articleUrl} from "../utils";
import {BasicButton} from "../ui-utils/basic-button";
import {CustomLink as Link} from "../custom-link";
import {LayoutConfigProvider, useLayoutConfig} from "./layout-config-context";
import {SearchPanelOnRightColumn} from "./search-panel-on-right-column";


const MainLayoutContent = ({children}: {children: ReactNode, distractionFree?: boolean}) => {
    const {layoutConfig} = useLayoutConfig()
    const {user} = useUser()

    const left = <div className={"fixed top-0 bottom-0 right-auto "+(layoutConfig.distractionFree ? "left-0 border-r" : "left-auto")}>
        <SidebarContent onClose={() => {}}/>
    </div>

    let right
    if(!layoutConfig.distractionFree){
        right = <div className={"fixed top-0 bottom-0 left-auto right-auto h-screen"}>
            <SearchPanelOnRightColumn/>
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