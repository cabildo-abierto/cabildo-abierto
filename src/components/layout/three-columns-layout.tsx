import {useLayoutConfig} from "@/components/layout/layout-config-context";
import React, {ReactNode} from "react";


export default function ThreeColumnsLayout({children, leftPanel, rightPanel}: {
    children: ReactNode
    leftPanel: ReactNode
    rightPanel: ReactNode
}) {
    const {layoutConfig} = useLayoutConfig()

    return <div className="flex justify-between w-full">
        <div
            className={""}
            style={{minWidth: layoutConfig.spaceForLeftSide ? layoutConfig.widthLeftSide : (layoutConfig.spaceForMinimizedLeftSide ? layoutConfig.widthLeftSideSmall : 0)}}
        >
            {leftPanel}
        </div>

        <div
            className={`flex-grow`}
            style={{
                minWidth: 0,
                maxWidth: layoutConfig.maxWidthCenter,
            }}
        >
            {children}
        </div>

        <div
            className=""
            style={{width: layoutConfig.spaceForRightSide ? layoutConfig.widthRightSide : 0}}
        >
            {rightPanel}
        </div>
    </div>
}