"use client"
import {ReactNode} from "react";
import {useLayoutConfig} from "./layout-config-context";
import {BottomBarMobile} from "./bottom-bar-mobile";
import {emptyChar} from "@/utils/utils";
import {createPortal} from "react-dom";
import {SidebarContent} from "@/components/layout/sidebar";
import {RightPanel} from "@/components/layout/right-panel";
import {useSession} from "@/queries/api";

export const MainLayoutContent = ({children}: {children: ReactNode}) => {
    const {layoutConfig, setLayoutConfig} = useLayoutConfig()
    const {user} = useSession()

    const left = user && (
        <div className={"fixed top-0 z-[1010] left-0 right-auto bg-[var(--background-dark)]"}>
            <SidebarContent onClose={() => {}}/>
        </div>
    )

    let right: ReactNode
    if (layoutConfig.openRightPanel && user) {
        right = <RightPanel/>
    }

    return <div className="flex justify-between w-full min-h-screen">
        <div className={"flex-shrink-0 " + (layoutConfig.spaceForLeftSide ? "w-56" : "min-[500px]:w-20")}>
            {left}
            {user && layoutConfig.openSidebar && (
                createPortal(
                    <div
                        className={
                            "min-[500px]:hidden w-screen fixed inset-0 h-screen z-[1009] bg-black bg-opacity-50"
                        }
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setLayoutConfig((prev) => ({ ...prev, openSidebar: false }));
                        }}
                    >
                        {emptyChar}
                    </div>,
                    window.document
                )
            )}
        </div>

        <div className={"w-full flex justify-center"}>
            <div
                className={`flex-grow min-h-screen`}
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
                className="flex-shrink-0 sticky top-0 max-h-screen no-scrollbar overflow-y-auto"
                style={{ width: layoutConfig.rightMinWidth }}
            >
                {right}
            </div>
        }

        {user && <BottomBarMobile/>}
    </div>
}