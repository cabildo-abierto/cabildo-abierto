"use client"
import React, {ReactNode, useEffect} from "react";
import LoadingPage from "../loading-page";
import {SearchProvider} from "../search/search-context";
import {BetaAccessPage} from "../beta-access-page";
import {SidebarContent} from "../sidebar";
import {emptyChar, pxToNumber} from "../utils";
import {LayoutConfigProps, LayoutConfigProvider, useLayoutConfig} from "./layout-config-context";
import {PageLeaveProvider} from "../prevent-leave";
import { ThemeProvider } from '@mui/material';
import theme from '../theme';
import {RightPanel} from "./right-panel";


const MainLayoutContent = ({children}: {children: ReactNode}) => {
    const {layoutConfig, setLayoutConfig} = useLayoutConfig()

    useEffect(() => {
        const handleResize = () => {
            const reqWidth = 224 +
                pxToNumber(layoutConfig.rightMinWidth) +
                pxToNumber(layoutConfig.maxWidthCenter);

            const reqWidthRightSide = 80 + pxToNumber(layoutConfig.rightMinWidth) +
                pxToNumber(layoutConfig.maxWidthCenter);

            if ((window.innerWidth >= reqWidth) != layoutConfig.spaceForLeftSide) {
                setLayoutConfig((prev) => ({
                    ...prev,
                    spaceForLeftSide: window.innerWidth >= reqWidth,
                }))
            }

            if((window.innerWidth >= reqWidthRightSide) != layoutConfig.spaceForRightSide){
                setLayoutConfig((prev) => ({
                    ...prev,
                    spaceForRightSide: window.innerWidth >= reqWidthRightSide,
                }))
            }
        };

        window.addEventListener("resize", handleResize);

        handleResize();

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [layoutConfig]);


    const left = <div className={"fixed top-0 z-[1000] left-0 right-auto border-r"}>
        <SidebarContent onClose={() => {}}/>
    </div>

    let right
    if (layoutConfig.openRightPanel) {
        right = <RightPanel/>
    }

    return <div className="flex justify-between w-full">
        <div className={"flex-shrink-0 " + (layoutConfig.spaceForLeftSide ? "w-56" : "w-20")}>
            {left}
        </div>

        <div
            className={"flex-grow min-h-screen"}
            style={{
                minWidth: "0",
                maxWidth: layoutConfig.maxWidthCenter,
            }}
        >
            {children}
        </div>

        {layoutConfig.spaceForRightSide ?
            <div className={"flex justify-end"}>
                <div className="flex-shrink-0" style={{width: layoutConfig.rightMinWidth}}>
                    {right}
                </div>
            </div>
            :
            <div>{emptyChar}</div>
        }
    </div>
}

const MainLayout: React.FC<{ children: ReactNode } & LayoutConfigProps> = ({
                                                                                             children,
                                                                                             openRightPanel=true,
                                                                                             maxWidthCenter="600px",
                                                                                             leftMinWidth="80px",
                                                                                             rightMinWidth="360px",
                                                                                             openSidebar=true,
                                                                                             defaultSidebarState=true,
                                                                                         }) => {


    return <>
        <ThemeProvider theme={theme}>
            <PageLeaveProvider>
                <LoadingPage>
                    <BetaAccessPage>
                        <SearchProvider>
                            <LayoutConfigProvider config={{openRightPanel, maxWidthCenter, leftMinWidth, rightMinWidth, openSidebar, defaultSidebarState}}>
                                <MainLayoutContent>
                                    {children}
                                </MainLayoutContent>
                            </LayoutConfigProvider>
                        </SearchProvider>
                    </BetaAccessPage>
                </LoadingPage>
            </PageLeaveProvider>
        </ThemeProvider>
    </>
};

export default MainLayout;