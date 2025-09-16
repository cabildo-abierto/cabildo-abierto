"use client"
import React, {ReactNode, useState} from "react";
import {useLayoutConfig} from "./layout-config-context";
import DesktopLayout from "@/components/layout/desktop-layout";
import MobileLayout from "@/components/layout/mobile-layout";
import dynamic from "next/dynamic";

const WritePanel = dynamic(() => import("@/components/writing/write-panel/write-panel"),
    {ssr: false}
)

export const MainLayoutContent = ({children}: { children: ReactNode }) => {
    const {isMobile} = useLayoutConfig()
    const [writePanelOpen, setWritePanelOpen] = useState(false)

    const content = !isMobile ? <DesktopLayout
        setWritePanelOpen={setWritePanelOpen}
    >
        {children}
    </DesktopLayout> : <MobileLayout
        setWritePanelOpen={setWritePanelOpen}
    >
        {children}
    </MobileLayout>

    return <>
        {content}
        {writePanelOpen && <WritePanel
            open={writePanelOpen}
            onClose={() => {
                setWritePanelOpen(false)
            }}
        />}
    </>
}