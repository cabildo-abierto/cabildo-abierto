import React from "react";
import { RedirectWrapper } from "../../../components/redirect-wrapper";


export default async function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    return <RedirectWrapper>
        {children}
    </RedirectWrapper>
}
