"use client"

import {ReactNode} from "react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {AppThemeProvider} from "@/components/layout/theme/theme-provider";
import {LoginModalProvider} from "@/components/layout/login-modal-provider";
import {ErrorProvider} from "@/components/layout/error-context";

const queryClient = new QueryClient()

export const AppLayout = ({children}: { children: ReactNode }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <AppThemeProvider>
                <ErrorProvider>
                    <LoginModalProvider>
                        {children}
                    </LoginModalProvider>
                </ErrorProvider>
            </AppThemeProvider>
        </QueryClientProvider>
    )
}