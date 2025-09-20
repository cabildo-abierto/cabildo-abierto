"use client"

import {ReactNode} from "react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {AppThemeProvider} from "@/components/theme/theme-provider";
import {LoginModalProvider} from "@/components/layout/login-modal-provider";

const queryClient = new QueryClient()

export const AppLayout = ({children}: { children: ReactNode }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <AppThemeProvider>
                <LoginModalProvider>
                    {children}
                </LoginModalProvider>
            </AppThemeProvider>
        </QueryClientProvider>
    )
}