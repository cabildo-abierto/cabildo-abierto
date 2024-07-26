"use client"
import "@/app/globals.css";
import { RedirectWrapper } from "@/components/redirect-wrapper";
import React from "react";


export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    return <RedirectWrapper>
        {children}
    </RedirectWrapper>
}
