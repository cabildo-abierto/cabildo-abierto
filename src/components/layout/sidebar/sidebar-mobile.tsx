import React from "react";
import {useLayoutConfig} from "../layout-config-context";
import {SwipeableDrawer} from "@mui/material";
import {SidebarContent} from "@/components/layout/sidebar/sidebar-content";
import {pxToNumber} from "@/utils/strings";




export const SidebarMobile = ({
                                  setWritePanelOpen
}: {
    setWritePanelOpen: (open: boolean) => void
}) => {
    const {layoutConfig, setLayoutConfig, isMobile} = useLayoutConfig()

    const drawerState = layoutConfig.openSidebar ? "expanded" : (isMobile ? "closed" : "collapsed")
    const drawerWidth = drawerState === 'expanded' ? Math.min(pxToNumber(layoutConfig.centerWidth) * 0.8, 300) : drawerState === 'collapsed' ? 80 : 0
    const hideBackdrop = false

    return <SwipeableDrawer
        key={JSON.stringify({...layoutConfig, isMobile})}
        anchor={"left"}
        hideBackdrop={hideBackdrop}
        disableEnforceFocus={true}
        open={drawerState != "closed"}
        disableScrollLock={drawerState != "expanded" || hideBackdrop}
        onOpen={() => {
            setLayoutConfig((prev) => ({...prev, openSidebar: true}))
        }}
        onClose={() => {
            setLayoutConfig((prev) => ({...prev, openSidebar: false}))
        }}
        sx={{
            width: drawerWidth,
            flexShrink: 0,
            transition: 'width 0.3s',
            '& .MuiDrawer-paper': {
                boxShadow: "none",
                width: drawerWidth,
                boxSizing: 'border-box',
                border: 'none',
            },
        }}
    >
        <div className={"bg-[var(--background)] h-screen overflow-y-scroll"}>
            <SidebarContent
                onClose={() => {}}
                setWritePanelOpen={setWritePanelOpen}
            />
        </div>
    </SwipeableDrawer>
}