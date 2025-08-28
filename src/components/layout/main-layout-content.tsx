"use client"
import React, {ReactNode, useState} from "react";
import {useLayoutConfig} from "./layout-config-context";
import {Sidebar} from "@/components/layout/sidebar";
import {RightPanel} from "@/components/layout/right-panel";
import {useSession} from "@/queries/useSession";
import {usePathname} from "next/navigation";
import dynamic from "next/dynamic";
const FloatingWriteButton = dynamic(() => import('../writing/floating-write-button'));
const WritePanel = dynamic(() => import('../writing/write-panel/write-panel'));
const BottomBarMobile = dynamic(() => import('./bottom-bar-mobile'));


export const MainLayoutContent = ({children}: {children: ReactNode}) => {
    const {layoutConfig, isMobile} = useLayoutConfig()
    const [writePanelOpen, setWritePanelOpen] = useState(false)
    const {user} = useSession()
    const pathname = usePathname()

    let right: ReactNode
    if (layoutConfig.openRightPanel && user) {
        right = <RightPanel/>
    }

    return <div className="flex justify-between w-full min-h-screen">
        <div className={"flex-shrink-0 " + (layoutConfig.spaceForLeftSide ? "w-56" : "min-[500px]:w-20")}>
            {user && <Sidebar
                onClose={()=> {}}
                setWritePanelOpen={setWritePanelOpen}
            />}
        </div>

        <div className={"w-full flex justify-center"}>
            <div
                className={`flex-grow min-h-screen`}
                style={{
                    minWidth: 0,
                    maxWidth: layoutConfig.maxWidthCenter,
                }}
            >
                {children}
            </div>
        </div>

        {layoutConfig.spaceForRightSide &&
            <div
                className="flex-shrink-0 sticky top-0 max-h-screen no-scrollbar overflow-y-auto"
                style={{ width: layoutConfig.rightMinWidth }}
            >
                {right}
            </div>
        }

        {user && <BottomBarMobile/>}

        {isMobile && (pathname.startsWith("/inicio") || pathname.startsWith("/perfil")) && <FloatingWriteButton onClick={() => {setWritePanelOpen(true)}}/>}

        {writePanelOpen && <WritePanel
            open={writePanelOpen}
            onClose={() => {
                setWritePanelOpen(false)
            }}
        />}
    </div>
}