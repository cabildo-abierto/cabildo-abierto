"use client"
import React, {ReactNode} from "react";
import {LayoutConfigProps, LayoutConfigProvider, useLayoutConfig} from "./layout-config-context";
import {SidebarContent} from "../sidebar";
import {ThemeProvider} from "@mui/material";
import theme from "../theme";
import {PageLeaveProvider} from "../prevent-leave";
import LoadingPage from "../loading-page";
import {BetaAccessPage} from "../beta-access-page";
import {SearchProvider} from "../search/search-context";


export const LayoutVisualizationEditor: React.FC<{ children: ReactNode } & LayoutConfigProps> = ({
                                                                               children,
                                                                               openRightPanel=true,
                                                                               maxWidthCenter="600px",
                                                                               leftMinWidth="80px",
                                                                               rightMinWidth="360px",
                                                                               openSidebar=true,
                                                                               defaultSidebarState=true,
                                                                           }) => {

    const left = <div className={"fixed top-0 left-0 z-[1000] border-r"}>
        <SidebarContent onClose={() => {}}/>
    </div>

    const center = <div className={"flex h-screen w-screen"}>
        {left}
        <div className={"ml-20 w-full h-full"}>
            {children}
        </div>
    </div>

    return <>
        <ThemeProvider theme={theme}>
            <PageLeaveProvider>
                <LoadingPage>
                    <BetaAccessPage>
                        <SearchProvider>
                            <LayoutConfigProvider config={{openRightPanel, maxWidthCenter, leftMinWidth, rightMinWidth, openSidebar, defaultSidebarState}}>
                                {center}
                            </LayoutConfigProvider>
                        </SearchProvider>
                    </BetaAccessPage>
                </LoadingPage>
            </PageLeaveProvider>
        </ThemeProvider>
    </>
};