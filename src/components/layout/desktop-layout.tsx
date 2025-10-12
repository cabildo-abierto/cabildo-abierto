import React, {ReactNode, useEffect, useRef} from "react";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import TopbarDesktop from "@/components/layout/topbar-desktop";
import {SidebarDesktop} from "@/components/layout/sidebar/sidebar-desktop";
import {RightPanel} from "@/components/layout/right-panel";

export default function DesktopLayout({children, setWritePanelOpen}: {
    children: ReactNode
    setWritePanelOpen: (open: boolean) => void
}) {
    const {layoutConfig} = useLayoutConfig();
    const rightPanelRef = useRef<HTMLDivElement>(null);

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

    return <div>
        <TopbarDesktop/>

        <div className="flex justify-between w-full">
            <div className={"flex-shrink-0 " + (layoutConfig.spaceForLeftSide ? "w-56" : "w-20")}>
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
                    // 2. Attach the ref to the right panel.
                    ref={rightPanelRef}
                    // This panel remains sticky and internally scrollable.
                    className="top-12 flex-shrink-0 sticky no-scrollbar mt-12 overflow-y-auto max-h-[calc(100vh-48px)]"
                    style={{width: layoutConfig.rightMinWidth}}
                >
                    <RightPanel/>
                </div>
            }
        </div>
    </div>
}