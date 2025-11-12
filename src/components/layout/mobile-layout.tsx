import React, {ReactNode} from "react";
import {usePathname} from "next/navigation";
import FloatingWriteButton from "@/components/writing/floating-write-button";
import BottomBarMobile from "@/components/layout/bottom-bar-mobile";
import TopbarMobile from "@/components/layout/topbar-mobile";
import {useTopbarHeight} from "@/components/layout/topbar-height";
import {useLayoutConfig} from "@/components/layout/layout-config-context";


export default function MobileLayout({children, setWritePanelOpen}: {
    children: ReactNode
    setWritePanelOpen: (open: boolean) => void
}) {
    const pathname = usePathname()
    const topbarHeight = useTopbarHeight()
    const {layoutConfig} = useLayoutConfig()

    return <div className={""}>
        <TopbarMobile setWritePanelOpen={setWritePanelOpen}/>

        <div
            className={"flex justify-center"}
            style={{paddingTop: topbarHeight}}
        >
            <div
                className={"w-full"}
                style={{maxWidth: layoutConfig.maxWidthCenter}}
            >
                {children}
            </div>
        </div>

        <BottomBarMobile/>

        {(pathname.startsWith("/inicio") || pathname.startsWith("/perfil")) &&
        <FloatingWriteButton onClick={() => {
            setWritePanelOpen(true)
        }}/>}
    </div>
}