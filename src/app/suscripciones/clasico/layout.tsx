import { getUser } from "@/actions/get-user";
import { RedirectWrapper } from "@/components/redirect-wrapper";
import React from "react";


export default async function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    const user = await getUser()
    return <RedirectWrapper user={user}>
        {children}
    </RedirectWrapper>
}
