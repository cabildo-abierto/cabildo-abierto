"use client"
import React, { ReactNode } from "react";
import LoadingPage from "../loading-page";
import {SearchProvider} from "../search/search-context";
import {BetaAccessPage} from "../beta-access-page";
import {ThreeColumnsLayout} from "../three-columns";
import {SidebarContent, SupportButton} from "../sidebar";
import { TrendingTopicsPanel } from "../trending-topics/trending-topics";
import {useUser} from "../../hooks/user";
import InfoIcon from "@mui/icons-material/Info";
import {articleUrl} from "../utils";
import {BasicButton} from "../ui-utils/basic-button";
import {CustomLink as Link} from "../custom-link";
import {LayoutConfigProvider, useLayoutConfig} from "./layout-config-context";
import {SearchPanelOnRightColumn} from "./search-panel-on-right-column";
import {DonateIcon} from "../icons/donate-icon";


const MainLayoutContent = ({children}: {children: ReactNode}) => {
    const {layoutConfig} = useLayoutConfig()
    const {user} = useUser()

    const left = <div className={"fixed top-0 bottom-0 z-[1000] right-auto "+(layoutConfig.distractionFree ? "left-0 border-r" : "left-auto")}>
        <SidebarContent onClose={() => {}}/>
    </div>

    let right
    if(!layoutConfig.distractionFree){
        right = <div className={"fixed top-0 bottom-0 left-auto right-auto h-screen"}>
            <SearchPanelOnRightColumn/>
            <div className={"ml-8 mt-8 flex justify-center w-full max-h-[600px] max-w-[300px]"}>
                <TrendingTopicsPanel selected={"7days"}/>
            </div>
            <div className={"ml-8 mt-4 w-full max-w-[300px] flex flex-col space-y-1"}>
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
                <Link href={"/aportar"} className={"text-[var(--text-light)]"}>
                    <BasicButton
                        variant={"text"}
                        size={"small"}
                        color={"inherit"}
                        startIcon={<DonateIcon fontSize={"small"}/>}
                    >
                        Aportar
                    </BasicButton>
                </Link>
            </div>
        </div>
    }

    return <ThreeColumnsLayout maxWidthCenter={layoutConfig.maxWidthCenter} left={left} center={children} right={right} leftMinWidth={layoutConfig.leftMinWidth} border={!layoutConfig.distractionFree}/>
}


const MainLayout: React.FC<{children: ReactNode, distractionFree?: boolean, maxWidthCenter?: string, leftMinWidth?: string}> = ({children, distractionFree=false, maxWidthCenter="600px", leftMinWidth="224px"}) => {

    return <>
        <LoadingPage>
            <BetaAccessPage>
                <SearchProvider>
                    <LayoutConfigProvider distractionFree={distractionFree} maxWidthCenter={maxWidthCenter} leftMinWidth={leftMinWidth}>
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