"use client"

import React, {createContext, useContext, useState, ReactNode, useEffect} from "react";
import {useLayoutConfig} from "@/components/layout/main-layout/layout-config-context";

export type LayoutStateProps = {
    openSidebar: boolean
}


const LayoutStateContext = createContext<{
    layoutState: LayoutStateProps;
    setLayoutState: React.Dispatch<React.SetStateAction<LayoutStateProps>>
} | undefined>(undefined);


export const useLayoutState = () => {
    const context = useContext(LayoutStateContext);
    if (!context) {
        throw new Error("useLayoutState must be used within a LayoutStateContext");
    }
    return context
}


export const LayoutStateProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const {layoutConfig} = useLayoutConfig()
    const [layoutState, setLayoutState] = useState<LayoutStateProps>({openSidebar: layoutConfig.defaultSidebarState})

    useEffect(() => {
        if ((!layoutConfig.spaceForLeftSide && layoutState.openSidebar) || (layoutConfig.spaceForLeftSide && !layoutState.openSidebar && layoutConfig.defaultSidebarState)) {
            setLayoutState((prev) => ({
                ...prev,
                openSidebar: layoutConfig.spaceForLeftSide
            }))
        }
    }, [layoutConfig?.defaultSidebarState, layoutConfig?.spaceForLeftSide])

    return (
        <LayoutStateContext.Provider value={{layoutState, setLayoutState}}>
            {children}
        </LayoutStateContext.Provider>
    );
};
