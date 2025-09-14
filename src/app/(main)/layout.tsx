import LoadingPage from "@/components/auth/loading-page";
import {PageLeaveProvider} from "../../../modules/ui-utils/src/prevent-leave";
import {LayoutConfigProvider} from "@/components/layout/layout-config-context";
import React, {ReactNode} from "react";
import PopupMessage from "@/components/layout/popup-message";
import {MainLayoutContent} from "@/components/layout/main-layout-content";


export default async function RootLayout({children}: { children: ReactNode }) {
    return (
        <LoadingPage>
            <PageLeaveProvider>
                <LayoutConfigProvider>
                    <PopupMessage>
                        <MainLayoutContent>
                            {children}
                        </MainLayoutContent>
                    </PopupMessage>
                </LayoutConfigProvider>
            </PageLeaveProvider>
        </LoadingPage>
    )
}