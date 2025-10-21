import React, {ReactNode, useEffect, useRef} from "react";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import TopbarDesktop from "@/components/layout/topbar-desktop";
import {SidebarDesktop} from "@/components/layout/sidebar/sidebar-desktop";
import {RightPanel} from "@/components/layout/right-panel";
import {useSearch} from "@/components/buscar/search-context";
import {usePathname} from "next/navigation";
import {pxToNumber} from "@/utils/strings";

export default function DesktopLayout({children, setWritePanelOpen}: {
    children: ReactNode
    setWritePanelOpen: (open: boolean) => void
}) {
    const {layoutConfig} = useLayoutConfig();
    const rightPanelRef = useRef<HTMLDivElement>(null)
    const pathname = usePathname()
    const {searchState} = useSearch(`${pathname}::main`)

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

        window.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            window.removeEventListener('wheel', handleWheel);
        };
    }, [layoutConfig])

    useEffect(() => {
        if(rightPanelRef && rightPanelRef.current && searchState && searchState.searching && searchState.value && searchState.value.length > 0){
            rightPanelRef.current.scrollTo(0, 0)
        }
    }, [searchState])

    return <div>
        <TopbarDesktop/>

        <div className="flex justify-between w-full">
            <div className={(!layoutConfig.readingLayout ? "flex-shrink-0 " + (layoutConfig.spaceForLeftSide ? "w-56" : "w-20") : "")}>
                <SidebarDesktop
                    onClose={() => {}}
                    setWritePanelOpen={setWritePanelOpen}
                />
            </div>

            <div className={"w-full flex justify-center mt-12"}>
                <div
                    className={`flex-grow`}
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
                    ref={rightPanelRef}
                    className={"top-12 mt-12 flex-shrink-0 no-scrollbar overflow-y-auto max-h-[calc(100vh-48px)] " + (layoutConfig.readingLayout ? "right-0 fixed" : "sticky")}
                    style={{width: pxToNumber(layoutConfig.rightMinWidth)-20}}
                >
                    <RightPanel/>
                </div>
            }
        </div>
    </div>
}