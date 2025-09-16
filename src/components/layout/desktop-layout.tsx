import React, {ReactNode} from "react";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {useSession} from "@/queries/useSession";
import TopbarDesktop from "@/components/layout/topbar-desktop";
import {SidebarDesktop} from "@/components/layout/sidebar/sidebar-desktop";
import {RightPanel} from "@/components/layout/right-panel";

export default function DesktopLayout({children, setWritePanelOpen}: {
    children: ReactNode
    setWritePanelOpen: (open: boolean) => void
}) {
    const {layoutConfig} = useLayoutConfig()
    const {user} = useSession()

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
                    className="top-12 flex-shrink-0 sticky no-scrollbar mt-12 overflow-y-auto max-h-[calc(100vh-48px)]"
                    style={{width: layoutConfig.rightMinWidth}}
                >
                    {layoutConfig.openRightPanel && user && <RightPanel/>}
                </div>
            }
        </div>
    </div>
}