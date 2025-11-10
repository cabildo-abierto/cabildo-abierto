"use client"
import React, {ReactNode, useEffect, useRef, useState} from "react";
import {useLayoutConfig} from "./layout-config-context";
import dynamic from "next/dynamic";
import {useSession} from "@/queries/getters/useSession";
import {useLoginModal} from "@/components/layout/login-modal-provider";
import TopbarMobile from "@/components/layout/topbar-mobile";
import BottomBarMobile from "@/components/layout/bottom-bar-mobile";
import FloatingWriteButton from "@/components/writing/floating-write-button";
import {usePathname} from "next/navigation";
import {useTopbarHeight} from "@/components/layout/topbar-height";
import TopbarDesktop from "@/components/layout/topbar-desktop";
import ThreeColumnsLayout from "@/components/layout/three-columns-layout";
import {SidebarDesktop} from "@/components/layout/sidebar/sidebar-desktop";
import {cn} from "@/lib/utils";
import {pxToNumber} from "@/utils/strings";
import {RightPanel} from "@/components/layout/right-panel";
import {useSearch} from "@/components/buscar/search-context";

const WritePanel = dynamic(() => import("@/components/writing/write-panel/write-panel"),
    {ssr: false}
)

export const MainLayoutContent = ({children}: { children: ReactNode }) => {
    const {isMobile, layoutConfig} = useLayoutConfig()
    const {user} = useSession()
    const [writePanelOpen, setWritePanelOpen] = useState(false)
    const {setLoginModalOpen} = useLoginModal()
    const pathname = usePathname()
    const topbarHeight = useTopbarHeight()
    const rightPanelRef = useRef<HTMLDivElement>(null)
    const {searchState} = useSearch(`${pathname}::main`)

    function onSetWritePanelOpen(v: boolean) {
        if (user) {
            setWritePanelOpen(v)
        } else {
            setLoginModalOpen(v)
        }
    }

    useEffect(() => {
        const rightEl = rightPanelRef.current;
        if (!rightEl) return;

        const handleWheel = (e: WheelEvent) => {
            const mainContentArea = rightEl.closest('.flex.justify-between');
            if (!mainContentArea?.contains(e.target as Node)) {
                return;
            }
            e.preventDefault();
            window.scrollBy(0, e.deltaY);
            rightEl.scrollTop += e.deltaY;
        };

        window.addEventListener('wheel', handleWheel, {passive: false});

        return () => {
            window.removeEventListener('wheel', handleWheel);
        };
    }, [layoutConfig])

    useEffect(() => {
        if (rightPanelRef && rightPanelRef.current && searchState && searchState.searching && searchState.value && searchState.value.length > 0) {
            rightPanelRef.current.scrollTo(0, 0)
        }
    }, [searchState])

    return <>
        <div className={cn(!isMobile && "pt-12")}>
            {isMobile && <TopbarMobile setWritePanelOpen={onSetWritePanelOpen}/>}
            {!isMobile && <TopbarDesktop/>}
            <ThreeColumnsLayout
                leftPanel={!isMobile && <SidebarDesktop
                    onClose={() => {
                    }}
                    setWritePanelOpen={onSetWritePanelOpen}
                />}
                rightPanel={!isMobile && <div
                    ref={rightPanelRef}
                    className={cn("no-scrollbar overflow-y-auto max-h-[calc(100vh-48px)]", layoutConfig.readingLayout ? "right-0 fixed" : "sticky top-12")}
                    style={{width: layoutConfig.openRightPanel && layoutConfig.spaceForRightSide ? pxToNumber(layoutConfig.widthRightSide) : 0}}
                >
                    <RightPanel/>
                </div>}
            >
                <div
                    className={"flex justify-center"}
                    style={{paddingTop: isMobile ? topbarHeight : undefined}}
                >
                    <div
                        className={"w-full"}
                        style={{maxWidth: layoutConfig.maxWidthCenter}}
                    >
                        {children}
                    </div>
                </div>
            </ThreeColumnsLayout>
            {isMobile && <BottomBarMobile/>}
            {isMobile && (pathname.startsWith("/inicio") || pathname.startsWith("/perfil")) &&
                <FloatingWriteButton onClick={() => {
                    onSetWritePanelOpen(true)
                }}/>}
        </div>
        {
            writePanelOpen && user && <WritePanel
                open={writePanelOpen}
                onClose={() => {
                    setWritePanelOpen(false)
                }}
            />
        }
    </>
}