import React from "react";
import {SidebarContent} from "@/components/layout/sidebar/sidebar-content";
import {useLayoutConfig} from "@/components/layout/layout-config-context";


export const SidebarDesktop = ({onClose, setWritePanelOpen}: {
    onClose: () => void
    setWritePanelOpen: (open: boolean) => void
}) => {
    const {layoutConfig} = useLayoutConfig()

    return <div className={"fixed z-[1199] h-screen bg-[var(--background)] top-12 " + (!layoutConfig.spaceForLeftSide && layoutConfig.openSidebar ? "border-r border-[var(--text-lighter)]" : "")}>
        <SidebarContent
            onClose={onClose}
            setWritePanelOpen={setWritePanelOpen}
        />
    </div>

}