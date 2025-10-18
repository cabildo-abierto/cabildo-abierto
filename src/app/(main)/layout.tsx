import LoadingPage from "@/components/layout/auth/loading-page";
import {LayoutConfigProvider} from "@/components/layout/layout-config-context";
import React, {ReactNode} from "react";
import PopupMessage from "@/components/layout/popup-message";
import {MainLayoutContent} from "@/components/layout/main-layout-content";
import {SearchProvider} from "@/components/buscar/search-context";
import {PageRequiresLoginChecker} from "@/components/layout/page-requires-login-checker";



export default async function RootLayout({children}: { children: ReactNode }) {
    return (
        <LoadingPage>
            <LayoutConfigProvider>
                <PopupMessage>
                    <SearchProvider>
                        <MainLayoutContent>
                            <PageRequiresLoginChecker>
                                {children}
                            </PageRequiresLoginChecker>
                        </MainLayoutContent>
                    </SearchProvider>
                </PopupMessage>
            </LayoutConfigProvider>
        </LoadingPage>
    )
}