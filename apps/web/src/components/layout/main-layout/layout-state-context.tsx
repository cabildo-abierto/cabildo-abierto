"use client"

import React, {createContext, useContext, useState, ReactNode, useEffect} from "react";
import {useLayoutConfig} from "@/components/layout/main-layout/layout-config-context";
import {usePathname} from "next/navigation";

const LAYOUT_GETTING_STARTED_GUIDE_OPEN_KEY = "cabildo-getting-started-guide-open"

export type LayoutStateProps = {
    openSidebar: boolean
    gettingStartedGuideOpen: boolean
    gettingStartedGuideHighlightToken: number
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
    const [layoutState, setLayoutState] = useState<LayoutStateProps>(() => ({
        openSidebar: layoutConfig.defaultSidebarState,
        gettingStartedGuideOpen: false,
        gettingStartedGuideHighlightToken: 0,
    }))
    const [gettingStartedGuideHydrated, setGettingStartedGuideHydrated] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        try {
            const v = localStorage.getItem(LAYOUT_GETTING_STARTED_GUIDE_OPEN_KEY)
            setLayoutState((prev) => ({
                ...prev,
                gettingStartedGuideOpen: v !== "false",
            }))
        } finally {
            setGettingStartedGuideHydrated(true)
        }
    }, [])

    useEffect(() => {
        if (!gettingStartedGuideHydrated) return
        try {
            localStorage.setItem(
                LAYOUT_GETTING_STARTED_GUIDE_OPEN_KEY,
                String(layoutState.gettingStartedGuideOpen),
            )
        } catch {
            /* ignore quota / private mode */
        }
    }, [gettingStartedGuideHydrated, layoutState.gettingStartedGuideOpen])

    // Single source of truth for openSidebar from layout: collapse when there is no
    // room; otherwise follow the route default. User toggles only change openSidebar
    // when these deps are unchanged, so the effect does not fight the user.
    useEffect(() => {
        setLayoutState((prev) => {
            const desiredOpenSidebar = layoutConfig.spaceForLeftSide
                ? layoutConfig.defaultSidebarState
                : false
            if (prev.openSidebar === desiredOpenSidebar) return prev
            return {
                ...prev,
                openSidebar: desiredOpenSidebar,
            }
        })
    }, [layoutConfig.spaceForLeftSide, layoutConfig.defaultSidebarState, pathname])

    return (
        <LayoutStateContext.Provider value={{layoutState, setLayoutState}}>
            {children}
        </LayoutStateContext.Provider>
    );
};
