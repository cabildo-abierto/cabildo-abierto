"use client"
import {ReactNode} from "react";
import {useLayoutConfig} from "./layout-config-context";
import {BottomBarMobile} from "./bottom-bar-mobile";
import {Sidebar} from "@/components/layout/sidebar";
import {RightPanel} from "@/components/layout/right-panel";
import {useSession} from "@/queries/api";

export const MainLayoutContent = ({children}: {children: ReactNode}) => {
    const {layoutConfig} = useLayoutConfig()
    const {user} = useSession()

    let right: ReactNode
    if (layoutConfig.openRightPanel && user) {
        right = <RightPanel/>
    }

    return <div className="flex justify-between w-full min-h-screen">
        <div className={"flex-shrink-0 " + (layoutConfig.spaceForLeftSide ? "w-56" : "min-[500px]:w-20")}>
            {user && <Sidebar onClose={()=> {}}/>}
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