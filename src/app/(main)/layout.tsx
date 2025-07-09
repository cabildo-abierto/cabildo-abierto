import LoadingPage from "@/components/auth/loading-page";
import {PageLeaveProvider} from "../../../modules/ui-utils/src/prevent-leave";
import {LayoutConfigProvider} from "@/components/layout/layout-config-context";
import {MainLayoutContent} from "@/components/layout/main-layout-content";
import React, {ReactNode} from "react";


export default async function RootLayout({children}: { children: ReactNode }) {
    return (
        <LoadingPage>
            <PageLeaveProvider>
                <LayoutConfigProvider>
                    <MainLayoutContent>
                        {children}
                    </MainLayoutContent>
                </LayoutConfigProvider>
            </PageLeaveProvider>
        </LoadingPage>
    )
}