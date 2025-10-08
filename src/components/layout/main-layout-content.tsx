"use client"
import React, {ReactNode, useState} from "react";
import {useLayoutConfig} from "./layout-config-context";
import DesktopLayout from "@/components/layout/desktop-layout";
import MobileLayout from "@/components/layout/mobile-layout";
import dynamic from "next/dynamic";
import {useSession} from "@/queries/getters/useSession";
import {useLoginModal} from "@/components/layout/login-modal-provider";

const WritePanel = dynamic(() => import("@/components/writing/write-panel/write-panel"),
    {ssr: false}
)

export const MainLayoutContent = ({children}: { children: ReactNode }) => {
    const {isMobile} = useLayoutConfig()
    const {user} = useSession()
    const [writePanelOpen, setWritePanelOpen] = useState(false)
    const {setLoginModalOpen} = useLoginModal()

    function onSetWritePanelOpen(v: boolean) {
        if(user) {
            setWritePanelOpen(v)
        } else {
            setLoginModalOpen(v)
        }
    }

    const content = !isMobile ? <DesktopLayout
        setWritePanelOpen={onSetWritePanelOpen}
    >
        {children}
    </DesktopLayout> : <MobileLayout
        setWritePanelOpen={onSetWritePanelOpen}
    >
        {children}
    </MobileLayout>

    return <>
        {content}
        {writePanelOpen && user && <WritePanel
            open={writePanelOpen}
            onClose={() => {
                setWritePanelOpen(false)
            }}
        />}
    </>
}