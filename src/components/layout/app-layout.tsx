"use client"

import React, {ReactNode} from "react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {AppThemeProvider} from "@/components/layout/theme/theme-provider";
import {LoginModalProvider} from "@/components/layout/login-modal-provider";
import {ErrorProvider} from "@/components/layout/error-context";
import {LayoutConfigProvider} from "@/components/layout/layout-config-context";

const queryClient = new QueryClient()

export const AppLayout = ({children}: { children: ReactNode }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <AppThemeProvider>
                <ErrorProvider>
                    <LayoutConfigProvider>
                        <LoginModalProvider>
                            {children}
                        </LoginModalProvider>
                    </LayoutConfigProvider>
                </ErrorProvider>
            </AppThemeProvider>
        </QueryClientProvider>
    )
}