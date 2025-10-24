import React from "react";
import {useLayoutConfig} from "../layout-config-context";
import {SwipeableDrawer} from "@mui/material";
import {SidebarContent} from "@/components/layout/sidebar/sidebar-content";


export const SidebarMobile = ({
                                  setWritePanelOpen
}: {
    setWritePanelOpen: (open: boolean) => void
}) => {
    const {layoutConfig, setLayoutConfig, isMobile} = useLayoutConfig()

    const drawerState = layoutConfig.openSidebar ? "expanded" : "closed"
    const hideBackdrop = false

    return <SwipeableDrawer
        key={JSON.stringify({...layoutConfig, isMobile})}
        anchor={"left"}
        hideBackdrop={hideBackdrop}
        disableEnforceFocus={true}
        open={drawerState != "closed"}
        disableScrollLock={true}
        onOpen={() => {
            setLayoutConfig((prev) => ({...prev, openSidebar: true}))
        }}
        onClose={() => {
            setLayoutConfig((prev) => ({...prev, openSidebar: false}))
        }}
        sx={{
            flexShrink: 0,
            transition: 'width 0.3s',
            '& .MuiDrawer-paper': {
                boxShadow: "none",
                boxSizing: 'border-box',
                border: 'none',
            },
        }}
    >
        <div className={"bg-[var(--background)] h-screen w-[calc(min(80vw, 360px))] custom-scrollbar overflow-y-auto"}>
            <SidebarContent
                onClose={() => {}}
                setWritePanelOpen={setWritePanelOpen}
            />
        </div>
    </SwipeableDrawer>
}