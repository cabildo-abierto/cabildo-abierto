"use client"
import { ThemeProvider } from "@emotion/react";
import theme from "../../components/theme";


export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    return <ThemeProvider theme={theme}>
        {children}
    </ThemeProvider>
}