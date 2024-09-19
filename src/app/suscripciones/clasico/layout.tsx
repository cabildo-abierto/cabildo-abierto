import React from "react";
import { RedirectWrapper } from "../../../components/redirect-wrapper";
import PaywallChecker from "../../../components/paywall-checker";


export default async function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    return <RedirectWrapper>
        {children}
    </RedirectWrapper>
}
