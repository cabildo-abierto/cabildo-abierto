"use client"

import React, {ReactNode} from "react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {AppThemeProvider} from "./theme/theme-provider";
import {LoginModalProvider} from "@/components/auth/login-modal-provider";
import {ErrorProvider} from "@/components/layout/contexts/error-context";
import {LayoutConfigProvider} from "./main-layout/layout-config-context";

const queryClient = new QueryClient()

export const AppLayout = ({children}: { children: ReactNode }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <AppThemeProvider>
                <LayoutConfigProvider>
                    <ErrorProvider>
                        <LoginModalProvider>
                            {children}
                        </LoginModalProvider>
                    </ErrorProvider>
                </LayoutConfigProvider>
            </AppThemeProvider>
        </QueryClientProvider>
    )
}