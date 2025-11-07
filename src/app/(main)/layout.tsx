"use client"
import LoadingPage from "@/components/auth/loading-page";
import React, {ReactNode} from "react";
import PopupMessage from "@/components/layout/popup-message";
import {MainLayoutContent} from "@/components/layout/main-layout-content";
import {SearchProvider} from "@/components/buscar/search-context";
import {PageRequiresLoginChecker} from "@/components/layout/page-requires-login-checker";
import {Toaster} from "@/components/ui/sonner";
import {VerificationNotification} from "@/components/layout/verification-notification";


export default function RootLayout({children}: { children: ReactNode }) {
    return (
        <LoadingPage>
            <PopupMessage>
                <VerificationNotification>
                    <SearchProvider>
                        <Toaster/>
                        <MainLayoutContent>
                            <PageRequiresLoginChecker>
                                {children}
                            </PageRequiresLoginChecker>
                        </MainLayoutContent>
                    </SearchProvider>
                </VerificationNotification>
            </PopupMessage>
        </LoadingPage>
    )
}