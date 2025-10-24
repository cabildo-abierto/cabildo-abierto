import React from "react";
import {SidebarContent} from "@/components/layout/sidebar/sidebar-content";
import {useLayoutConfig} from "@/components/layout/layout-config-context";


export const SidebarDesktop = ({onClose, setWritePanelOpen}: {
    onClose: () => void
    setWritePanelOpen: (open: boolean) => void
}) => {
    const {layoutConfig} = useLayoutConfig()

    if(layoutConfig.sidebarKind == "floating" && !layoutConfig.openSidebar) {
        return null
    }

    return <div className={"fixed z-[1199] overflow-auto custom-scrollbar h-[calc(100vh-48px)] bg-[var(--background)] top-12 " + (!layoutConfig.spaceForLeftSide && layoutConfig.openSidebar ? "border-r border-[var(--accent-dark)] custom-scrollbar" : "")}>
        <SidebarContent
            onClose={onClose}
            setWritePanelOpen={setWritePanelOpen}
        />
    </div>
}