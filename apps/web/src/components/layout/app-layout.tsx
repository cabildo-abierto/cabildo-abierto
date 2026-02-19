"use client"

import React, {ReactNode} from "react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {AppThemeProvider} from "./theme/theme-provider";
import {LoginModalProvider} from "@/components/auth/login-modal-provider";
import {ErrorProvider} from "@/components/layout/contexts/error-context";
import {LayoutConfigProvider} from "./main-layout/layout-config-context";
import {LayoutStateProvider} from "@/components/layout/main-layout/layout-state-context";

const queryClient = new QueryClient()

export const AppLayout = ({children}: { children: ReactNode }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <AppThemeProvider>
                <LayoutConfigProvider>
                    <LayoutStateProvider>
                        <ErrorProvider>
                            <LoginModalProvider>
                                {children}
                            </LoginModalProvider>
                        </ErrorProvider>
                    </LayoutStateProvider>
                </LayoutConfigProvider>
            </AppThemeProvider>
        </QueryClientProvider>
    )
}