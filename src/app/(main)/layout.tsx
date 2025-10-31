import LoadingPage from "@/components/auth/loading-page";
import {LayoutConfigProvider} from "@/components/layout/layout-config-context";
import React, {ReactNode} from "react";
import PopupMessage from "@/components/layout/popup-message";
import {MainLayoutContent} from "@/components/layout/main-layout-content";
import {SearchProvider} from "@/components/buscar/search-context";
import {PageRequiresLoginChecker} from "@/components/layout/page-requires-login-checker";
import { Toaster } from "@/components/ui/sonner";


export default async function RootLayout({children}: { children: ReactNode }) {
    return (
        <LoadingPage>
            <LayoutConfigProvider>
                    <PopupMessage>
                        <SearchProvider>
                            <Toaster/>
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