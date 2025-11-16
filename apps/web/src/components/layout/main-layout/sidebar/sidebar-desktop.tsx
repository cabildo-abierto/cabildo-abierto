import React from "react";
import {SidebarContent} from "./sidebar-content";
import {useLayoutConfig} from "../layout-config-context";
import {cn} from "../../../../lib/utils";


export const SidebarDesktop = ({onClose, setWritePanelOpen}: {
    onClose: () => void
    setWritePanelOpen: (open: boolean) => void
}) => {
    const {layoutConfig} = useLayoutConfig()

    if(layoutConfig.sidebarKind == "floating" && !layoutConfig.openSidebar) {
        return null
    }

    return <div
        className={cn("fixed bg-[var(--background)] overflow-auto custom-scrollbar h-[calc(100vh-48px)] z-[1001] top-12", !layoutConfig.spaceForLeftSide && layoutConfig.openSidebar && "border-r border-[var(--accent-dark)] custom-scrollbar")}
    >
        <SidebarContent
            onClose={onClose}
            setWritePanelOpen={setWritePanelOpen}
        />
    </div>
}