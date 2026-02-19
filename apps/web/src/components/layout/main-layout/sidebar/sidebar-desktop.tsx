import React from "react";
import {SidebarContent} from "./sidebar-content";
import {useLayoutConfig} from "../layout-config-context";
import {cn} from "@/lib/utils";
import {useLayoutState} from "@/components/layout/main-layout/layout-state-context";


export const SidebarDesktop = ({onClose, setWritePanelOpen}: {
    onClose: () => void
    setWritePanelOpen: (open: boolean) => void
}) => {
    const {layoutConfig} = useLayoutConfig()
    const {layoutState} = useLayoutState()

    if(layoutConfig.sidebarKind == "floating" && !layoutState.openSidebar) {
        return null
    }

    return <div
        className={cn("fixed bg-[var(--background)] overflow-auto custom-scrollbar h-[calc(100vh-48px)] z-[1001] top-12", !layoutConfig.spaceForLeftSide && layoutState.openSidebar && "border-r border-[var(--accent-dark)] custom-scrollbar")}
    >
        <SidebarContent
            onClose={onClose}
            setWritePanelOpen={setWritePanelOpen}
        />
    </div>
}