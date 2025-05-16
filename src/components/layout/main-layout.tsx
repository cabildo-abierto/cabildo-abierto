"use client"
import {ReactNode} from "react";
import LoadingPage from "../auth/loading-page";
import {SearchProvider} from "@/components/buscar/search-context";
import {LayoutConfigProvider} from "./layout-config-context";
import {PageLeaveProvider} from "../../../modules/ui-utils/src/prevent-leave";
import {MainLayoutContent} from "./main-layout-content";



const MainLayout = ({children}: { children: ReactNode }) => {
    return (
        <LoadingPage>
            <PageLeaveProvider>
                    <SearchProvider>
                        <LayoutConfigProvider>
                            <MainLayoutContent>
                                {children}
                            </MainLayoutContent>
                        </LayoutConfigProvider>
                    </SearchProvider>
            </PageLeaveProvider>
        </LoadingPage>
    )
};

export default MainLayout;