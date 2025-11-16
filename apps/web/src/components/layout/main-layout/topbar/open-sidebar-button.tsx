import React from "react";
import {useLayoutConfig} from "../layout-config-context";
import {BaseIconButton} from "@/components/utils/base/base-icon-button";


export const OpenSidebarButton = () => {
    const {layoutConfig, setLayoutConfig} = useLayoutConfig()

    return <BaseIconButton
        size={"large"}
        onClick={() => {
            setLayoutConfig({
                ...layoutConfig,
                openSidebar: !layoutConfig.openSidebar
            })
        }}
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
}