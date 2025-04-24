"use client"
import {ReactNode} from "react";
import LoadingPage from "../auth/loading-page";
import {SearchProvider} from "@/components/buscar/search-context";
import {LayoutConfigProps, LayoutConfigProvider} from "./layout-config-context";
import {PageLeaveProvider} from "../../../modules/ui-utils/src/prevent-leave";
import {LoadEditor} from "../../../modules/ui-utils/src/load-editor";
import {MainLayoutContent} from "./main-layout-content";
import {Tutorial} from "@/components/tutorial/tutorial";

const MainLayout = ({
                        children,
                        openRightPanel = true,
                        maxWidthCenter = "600px",
                        leftMinWidth = "80px",
                        rightMinWidth = "300px",
                        openSidebar = true,
                        defaultSidebarState = true,
                    }: { children: ReactNode } & LayoutConfigProps) => {

    return (
        <LoadingPage>
            <PageLeaveProvider>
                <LoadEditor>
                    <SearchProvider>
                        <LayoutConfigProvider config={{
                            openRightPanel,
                            maxWidthCenter,
                            leftMinWidth,
                            rightMinWidth,
                            openSidebar,
                            defaultSidebarState
                        }}>
                            <Tutorial>
                                <MainLayoutContent>
                                    {children}
                                </MainLayoutContent>
                            </Tutorial>
                        </LayoutConfigProvider>
                    </SearchProvider>
                </LoadEditor>
            </PageLeaveProvider>
        </LoadingPage>
    )
};

export default MainLayout;