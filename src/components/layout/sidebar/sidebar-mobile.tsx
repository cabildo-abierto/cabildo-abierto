import React from "react"
import { useLayoutConfig } from "../layout-config-context"
import { SidebarContent } from "@/components/layout/sidebar/sidebar-content"
import {
    Sheet,
    SheetContent,
} from "@/components/ui/sheet"

export const SidebarMobile = ({
                                  setWritePanelOpen
                              }: {
    setWritePanelOpen: (open: boolean) => void
}) => {
    const { layoutConfig, setLayoutConfig, isMobile } = useLayoutConfig()

    const open = layoutConfig.openSidebar

    if (!isMobile) return null

    return <Sheet
        open={open}
        onOpenChange={(newOpen) => {
            setLayoutConfig((prev) => ({ ...prev, openSidebar: newOpen }))
        }}
    >
        <SheetContent
            closeClassName="hidden"
            side="left"
            className="w-[360px] z-[1500] max-w-[80vw] bg-[var(--background)] p-0 sm:hidden"
            style={{ pointerEvents: open ? 'auto' : 'none', overflowY: 'visible' }}
        >
            <div className="h-full w-full bg-[var(--background)] custom-scrollbar overflow-y-auto">
                <SidebarContent
                    onClose={() => {
                        setLayoutConfig((prev) => ({ ...prev, openSidebar: false }))
                    }}
                    setWritePanelOpen={setWritePanelOpen}
                />
            </div>
        </SheetContent>
    </Sheet>
}