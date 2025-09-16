import LoadingPage from "@/components/auth/loading-page";
import {PageLeaveProvider} from "../../../modules/ui-utils/src/prevent-leave";
import {LayoutConfigProvider} from "@/components/layout/layout-config-context";
import React, {ReactNode} from "react";
import PopupMessage from "@/components/layout/popup-message";
import {MainLayoutContent} from "@/components/layout/main-layout-content";
import {SearchProvider} from "@/components/buscar/search-context";


export default async function RootLayout({children}: { children: ReactNode }) {
    return (
        <LoadingPage>
            <PageLeaveProvider>
                <LayoutConfigProvider>
                    <PopupMessage>
                        <SearchProvider>
                            <MainLayoutContent>
                                {children}
                            </MainLayoutContent>
                        </SearchProvider>
                    </PopupMessage>
                </LayoutConfigProvider>
            </PageLeaveProvider>
        </LoadingPage>
    )
}