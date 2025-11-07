import React, {ReactNode} from "react";
import {usePathname} from "next/navigation";
import FloatingWriteButton from "@/components/writing/floating-write-button";
import BottomBarMobile from "@/components/layout/bottom-bar-mobile";
import TopbarMobile from "@/components/layout/topbar-mobile";
import {useTopbarHeight} from "@/components/layout/topbar-height";


export default function MobileLayout({children, setWritePanelOpen}: {
    children: ReactNode
    setWritePanelOpen: (open: boolean) => void
}) {
    const pathname = usePathname()
    const topbarHeight = useTopbarHeight()

    return <div className={""}>
        <TopbarMobile setWritePanelOpen={setWritePanelOpen}/>

        <div className={"w-screen"} style={{marginTop: topbarHeight}}>
            {children}
        </div>

        <BottomBarMobile/>

        {(pathname.startsWith("/inicio") || pathname.startsWith("/perfil")) &&
        <FloatingWriteButton onClick={() => {
            setWritePanelOpen(true)
        }}/>}
    </div>
}