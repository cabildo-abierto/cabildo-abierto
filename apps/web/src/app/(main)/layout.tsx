"use client"
import LoadingPage from "@/components/layout/main-layout/loading-page";
import React, {ReactNode} from "react";
import {MainLayoutContent} from "@/components/layout/main-layout/main-layout-content";
import {SearchProvider} from "@/components/buscar/search-context";
import {PageRequiresLoginChecker} from "@/components/layout/main-layout/page-requires-login-checker";
import {Toaster} from "@/components/utils/ui/sonner";
import FirstContributionMessage from "@/components/layout/main-layout/first-contribution-message";
import {VerificationNotification} from "@/components/layout/main-layout/verification-notification";


export default function RootLayout({children}: { children: ReactNode }) {
    return (
        <LoadingPage>
            <FirstContributionMessage>
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
            </FirstContributionMessage>
        </LoadingPage>
    )
}