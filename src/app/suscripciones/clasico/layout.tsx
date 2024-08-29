import { RedirectWrapper } from "src/components/redirect-wrapper";
import React from "react";


export default async function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    return <RedirectWrapper>
        {children}
    </RedirectWrapper>
}
