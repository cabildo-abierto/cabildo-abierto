"use client"

import React, { createContext, useContext, useState, ReactNode } from "react";

export type LayoutConfigProps = {
    maxWidthCenter?: string
    leftMinWidth?: string
    rightMinWidth?: string
    openSidebar?: boolean
    openRightPanel?: boolean
    spaceForRightSide?: boolean
    spaceForLeftSide?: boolean
    defaultSidebarState?: boolean
}


const LayoutConfigContext = createContext<{
    layoutConfig: LayoutConfigProps;
    setLayoutConfig: React.Dispatch<React.SetStateAction<LayoutConfigProps>>;
} | undefined>(undefined);

export const useLayoutConfig = () => {
    const context = useContext(LayoutConfigContext);
    if (!context) {
        throw new Error("useLayout must be used within a LayoutConfigContext");
    }
    return context;
};


export const LayoutConfigProvider: React.FC<{ children: ReactNode, config: LayoutConfigProps }> = ({ children, config }) => {
    const [layoutConfig, setLayoutConfig] = useState(config);

    return (
        <LayoutConfigContext.Provider value={{ layoutConfig, setLayoutConfig }}>
            {children}
        </LayoutConfigContext.Provider>
    );
};
