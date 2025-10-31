"use client"
import {NavigationGuardProvider} from "next-navigation-guard";
import {ReactNode} from "react";

export default function Layout({children}: {children: ReactNode}) {

    return <NavigationGuardProvider>
        {children}
    </NavigationGuardProvider>
}