"use client"

import React, {createContext, useContext, useState, ReactNode, useEffect} from "react";
import {isArticle, shortCollectionToCollection} from "@/utils/uri";
import {usePathname, useSearchParams} from "next/navigation";
import {shallowEqual} from "@/utils/arrays";
import {pxToNumber} from "@/utils/strings";

export type LayoutConfigProps = {
    maxWidthCenter: string
    leftMinWidth: string
    rightMinWidth: string
    defaultSidebarState: boolean

    openSidebar: boolean
    openRightPanel: boolean
    spaceForRightSide?: boolean
    spaceForLeftSide?: boolean
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


function getLayoutConfig(pathname: string, params: URLSearchParams, currentConfig?: LayoutConfigProps): LayoutConfigProps {
    const feedConfig: LayoutConfigProps = {
        maxWidthCenter: "600px",
        leftMinWidth: "80px",
        rightMinWidth: "300px",
        openSidebar: currentConfig?.openSidebar ?? true,
        openRightPanel: true,
        defaultSidebarState: true
    }
    const articleConfig: LayoutConfigProps = {
        maxWidthCenter: "682px",
        leftMinWidth: "80px",
        rightMinWidth: "300px",
        openSidebar: currentConfig?.openSidebar ?? false,
        defaultSidebarState: false,
        openRightPanel: false
    }
    const maximizedTopicConfig: LayoutConfigProps = {
        maxWidthCenter: "800px",
        leftMinWidth: "80px",
        rightMinWidth: "300px",
        openSidebar: currentConfig?.openSidebar ?? false,
        defaultSidebarState: false,
        openRightPanel: false
    }
    const mobileConfig: LayoutConfigProps = {
        maxWidthCenter: `${window.innerWidth}px`,
        leftMinWidth: "0px",
        rightMinWidth: "0px",
        defaultSidebarState: false,
        openSidebar: false,
        openRightPanel: false
    }

    let config: LayoutConfigProps
    if(window.innerWidth < 600){
        return mobileConfig
    } else if(pathname.startsWith("/temas")){
        config = {
            ...feedConfig,
            maxWidthCenter: "800px"
        }
    } else if(pathname.startsWith("/tema")){
        const s = params.get("s")
        config = s && s != "minimized" ? maximizedTopicConfig : feedConfig
    } else if(pathname.startsWith("/c")){
        const collection = pathname.split("/")[3]
        config = isArticle(shortCollectionToCollection(collection)) ? articleConfig : feedConfig
    } else if(pathname.startsWith("/escribir/articulo")){
        config = articleConfig
    } else {
        config = feedConfig
    }

    const {spaceForLeftSide, spaceForRightSide} = getSpaceAvailable(config)

    return {
        ...config,
        spaceForLeftSide,
        spaceForRightSide
    }
}


function getSpaceAvailable(curLayoutConfig: LayoutConfigProps) {
    const reqWidth = 224 +
        pxToNumber(curLayoutConfig.rightMinWidth) +
        pxToNumber(curLayoutConfig.maxWidthCenter);

    const reqWidthRightSide = 80 + pxToNumber(curLayoutConfig.rightMinWidth) +
        pxToNumber(curLayoutConfig.maxWidthCenter);

    const spaceForLeftSide = window.innerWidth >= reqWidth
    const spaceForRightSide = window.innerWidth >= reqWidthRightSide
    return {spaceForLeftSide, spaceForRightSide}
}


export const LayoutConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const params = useSearchParams()
    const pathname = usePathname()
    const [layoutConfig, setLayoutConfig] = useState(getLayoutConfig(pathname, params));

    useEffect(() => {
        if ((!layoutConfig.spaceForLeftSide && layoutConfig.openSidebar) || (layoutConfig.spaceForLeftSide && !layoutConfig.openSidebar && layoutConfig.defaultSidebarState)) {
            setLayoutConfig((prev) => ({
                ...prev,
                openSidebar: layoutConfig.spaceForLeftSide
            }))
        }
    }, [layoutConfig.defaultSidebarState, layoutConfig.spaceForLeftSide])

    useEffect(() => {
        const handleResize = () => {
            const config = getLayoutConfig(pathname, params, layoutConfig)
            if(!shallowEqual(layoutConfig, config)){
                setLayoutConfig(config)
            }
        };

        window.addEventListener("resize", handleResize);

        handleResize();

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [layoutConfig, params, pathname]);

    return (
        <LayoutConfigContext.Provider value={{ layoutConfig, setLayoutConfig }}>
            {children}
        </LayoutConfigContext.Provider>
    );
};
