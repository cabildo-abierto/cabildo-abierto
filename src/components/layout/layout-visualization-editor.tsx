"use client"
import React, {ReactNode} from "react";
import {LayoutConfigProps, LayoutConfigProvider} from "./layout-config-context";
import {SidebarContent} from "./sidebar";
import {PageLeaveProvider} from "../../../modules/ui-utils/src/prevent-leave";
import LoadingPage from "../auth/loading-page";
import {BetaAccessPage} from "../auth/beta-access-page";
import {SearchProvider} from "@/components/buscar/search-context";


export const LayoutVisualizationEditor: React.FC<{ children: ReactNode } & LayoutConfigProps> = ({
                                                                               children,
                                                                               openRightPanel=true,
                                                                               maxWidthCenter="600px",
                                                                               leftMinWidth="80px",
                                                                               rightMinWidth="300px",
                                                                               openSidebar=true,
                                                                               defaultSidebarState=true,
                                                                           }) => {


    return <>
        <PageLeaveProvider>
            <LoadingPage>
                <BetaAccessPage>
                    <SearchProvider>
                        <LayoutConfigProvider config={{openRightPanel, maxWidthCenter, leftMinWidth, rightMinWidth, openSidebar, defaultSidebarState}}>
                            <div className={"flex"}>
                                <div className={"fixed top-0 left-0 z-[1000] border-r"}>
                                    <SidebarContent onClose={() => {}}/>
                                </div>
                                <div className={"min-[1080px]:ml-20 w-full h-full"}>
                                    {children}
                                </div>
                            </div>
                        </LayoutConfigProvider>
                    </SearchProvider>
                </BetaAccessPage>
            </LoadingPage>
        </PageLeaveProvider>
    </>
};