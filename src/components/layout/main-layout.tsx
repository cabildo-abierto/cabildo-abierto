"use client"
import React, {ReactNode, Suspense} from "react";
import LoadingPage from "../auth/loading-page";
import {LayoutConfigProvider} from "./layout-config-context";
import {PageLeaveProvider} from "../../../modules/ui-utils/src/prevent-leave";
import {MainLayoutContent} from "./main-layout-content";
import {LoadingScreen} from "../../../modules/ui-utils/src/loading-screen";



const MainLayout = ({children}: { children: ReactNode }) => {
    return (
        <Suspense fallback={<LoadingScreen/>}>
            <LoadingPage>
                <PageLeaveProvider>
                    <LayoutConfigProvider>
                        <MainLayoutContent>
                            {children}
                        </MainLayoutContent>
                    </LayoutConfigProvider>
                </PageLeaveProvider>
            </LoadingPage>
        </Suspense>
    )
};

export default MainLayout;