import React from "react";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import { IconButton } from "./utils/icon-button";


export const OpenSidebarButton = () => {
    const {layoutConfig, setLayoutConfig} = useLayoutConfig()

    return <IconButton
        size={"small"}
        sx={{
            borderRadius: 0
        }}
        onClick={() => {
            setLayoutConfig({
                ...layoutConfig,
                openSidebar: !layoutConfig.openSidebar
            })
        }}
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
    </IconButton>
}