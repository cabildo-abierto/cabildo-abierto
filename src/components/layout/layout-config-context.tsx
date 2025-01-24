"use client"

import React, { createContext, useContext, useState, ReactNode } from "react";

export type LayoutConfigProps = {
    distractionFree: boolean
}


const LayoutConfigContext = createContext<{
    layoutConfig: LayoutConfigProps;
    setLayoutConfig: React.Dispatch<React.SetStateAction<LayoutConfigProps>>;
} | undefined>(undefined);

export const useLayoutConfig = () => {
    const context = useContext(LayoutConfigContext);
    if (!context) {
        throw new Error("useSearch must be used within a BarsProvider");
    }
    return context;
};


export const LayoutConfigProvider: React.FC<{ children: ReactNode, distractionFree: boolean }> = ({ children, distractionFree }) => {
    const [layoutConfig, setLayoutConfig] = useState({distractionFree: distractionFree});

    return (
        <LayoutConfigContext.Provider value={{ layoutConfig, setLayoutConfig }}>
            {children}
        </LayoutConfigContext.Provider>
    );
};
