"use client"
import {ReactNode} from "react";
import {cn} from "@/lib/utils";
import {useLayoutConfig} from "@/components/layout/layout-config-context";


export default function Layout({children}: {children: ReactNode}) {
    const {isMobile} = useLayoutConfig()
    return <div className={cn("space-y-6 p-8 mt-12 portal group panel-dark mb-32", isMobile && "mx-2 mt-14")}>
        {children}
    </div>
}