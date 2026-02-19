import React from "react"
import {SidebarContent} from "./sidebar-content"
import {
    Sheet,
    SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/utils/ui/sheet"
import {VisuallyHidden} from "@radix-ui/react-visually-hidden";
import {BaseIconButton} from "@/components/utils/base/base-icon-button";
import {produce} from "immer";
import {useLayoutState} from "@/components/layout/main-layout/layout-state-context";
import {useIsMobile} from "@/components/utils/use-is-mobile";

export const SidebarMobile = ({
    setWritePanelOpen
}: {
    setWritePanelOpen: (open: boolean) => void
}) => {
    const {isMobile} = useIsMobile()
    const {layoutState, setLayoutState} = useLayoutState()

    if (!isMobile) return null

    return <Sheet
        open={layoutState.openSidebar}
        onOpenChange={(open) => {
            setLayoutState(produce(layoutState, draft => {
                draft.openSidebar = open
            }))
        }}
    >
        <SheetTrigger asChild>
            <BaseIconButton
                size={"large"}
                className={"p-[5px]"}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--text)"
                    strokeWidth="2"
                    style={{shapeRendering: "geometricPrecision"}}
                >
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
            </BaseIconButton>
        </SheetTrigger>
        <SheetContent
            closeClassName={"hidden"}
            side="left"
            className="z-[2500] p-0 max-w-[80vw] w-[360px]"
        >
            <VisuallyHidden>
                <SheetHeader>
                    <SheetTitle>
                        Barra lateral
                    </SheetTitle>
                </SheetHeader>
            </VisuallyHidden>
            <div
                className="h-full bg-[var(--background)] custom-scrollbar overflow-y-auto"
            >
                <SidebarContent
                    onClose={() => {
                        setLayoutState((prev) => ({...prev, openSidebar: false}))
                    }}
                    setWritePanelOpen={setWritePanelOpen}
                />
            </div>
        </SheetContent>
    </Sheet>
}