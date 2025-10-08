import LoadingPage from "@/components/layout/auth/loading-page";
import {LayoutConfigProvider} from "@/components/layout/layout-config-context";
import React, {ReactNode} from "react";
import PopupMessage from "@/components/layout/popup-message";
import {MainLayoutContent} from "@/components/layout/main-layout-content";
import {SearchProvider} from "@/components/buscar/search-context";
import {PageRequiresLoginChecker} from "@/components/layout/page-requires-login-checker";
import {ErrorProvider} from "@/components/layout/error-context";


export default async function RootLayout({children}: { children: ReactNode }) {
    return (
        <LoadingPage>
            <LayoutConfigProvider>
                <PopupMessage>
                    <SearchProvider>
                        <ErrorProvider>
                            <MainLayoutContent>
                                <PageRequiresLoginChecker>
                                    {children}
                                </PageRequiresLoginChecker>
                            </MainLayoutContent>
                        </ErrorProvider>
                    </SearchProvider>
                </PopupMessage>
            </LayoutConfigProvider>
        </LoadingPage>
    )
}