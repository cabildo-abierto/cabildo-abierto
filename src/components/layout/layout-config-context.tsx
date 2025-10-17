"use client"

import React, {createContext, useContext, useState, ReactNode, useEffect} from "react";
import {isArticle, isDataset, shortCollectionToCollection} from "@/utils/uri";
import {usePathname, useSearchParams} from "next/navigation";
import {pxToNumber} from "@/utils/strings";
import {useMediaQuery} from "@mui/system";

export type LayoutConfigProps = {
    maxWidthCenter: string
    leftMinWidth: string
    rightMinWidth: string
    defaultSidebarState: boolean
    openSidebar: boolean
    openRightPanel: boolean
    centerWidth?: string
    spaceForRightSide?: boolean
    spaceForLeftSide?: boolean
}


const LayoutConfigContext = createContext<{
    layoutConfig: LayoutConfigProps;
    setLayoutConfig: React.Dispatch<React.SetStateAction<LayoutConfigProps>>;
    isMobile: boolean
} | undefined>(undefined);

export const useLayoutConfig = () => {
    const context = useContext(LayoutConfigContext);
    if (!context) {
        throw new Error("useLayout must be used within a LayoutConfigContext");
    }
    return context;
};


function getLayoutConfig(pathname: string, params: URLSearchParams, currentConfig?: LayoutConfigProps, isMobile: boolean = false): LayoutConfigProps {
    const feedConfig: LayoutConfigProps = {
        maxWidthCenter: "600px",
        leftMinWidth: "80px",
        rightMinWidth: "300px",
        openSidebar: currentConfig?.openSidebar ?? true,
        openRightPanel: true,
        defaultSidebarState: true
    }
    const datasetConfig: LayoutConfigProps = {
        maxWidthCenter: "800px",
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
        maxWidthCenter: "600px",
        leftMinWidth: "0px",
        rightMinWidth: "0px",
        defaultSidebarState: false,
        openSidebar: false,
        openRightPanel: false
    }

    let config: LayoutConfigProps
    if(isMobile){
        config = mobileConfig
    } else if(pathname.startsWith("/temas")){
        config = {
            ...feedConfig,
            maxWidthCenter: "800px"
        }
    } else if(pathname.startsWith("/tema")) {
        config = maximizedTopicConfig
    } else if(pathname.startsWith("/panel")){
        config = maximizedTopicConfig
    } else if(pathname.startsWith("/c")){
        const shortCollection = pathname.split("/")[3]
        const collection = shortCollectionToCollection(shortCollection)
        if(isArticle(collection)){
            config = articleConfig
        } else if(isDataset(collection)){
            config = datasetConfig
        } else {
            config = feedConfig
        }
    } else if(pathname.startsWith("/escribir/articulo")){
        config = articleConfig
    } else {
        config = feedConfig
    }

    const {spaceForLeftSide, spaceForRightSide, centerWidth} = getSpaceAvailable(config)

    return {
        ...config,
        spaceForLeftSide,
        spaceForRightSide,
        centerWidth
    }
}


function getSpaceAvailable(curLayoutConfig: LayoutConfigProps) {
    const reqWidth = 224 +
        pxToNumber(curLayoutConfig.rightMinWidth) +
        pxToNumber(curLayoutConfig.maxWidthCenter);

    const reqWidthRightSide = 80 + pxToNumber(curLayoutConfig.rightMinWidth) +
        pxToNumber(curLayoutConfig.maxWidthCenter);

    const width = window.innerWidth

    const spaceForLeftSide = width >= reqWidth
    const spaceForRightSide = width >= reqWidthRightSide
    const centerWidth = Math.min(
        pxToNumber(curLayoutConfig.maxWidthCenter),
        width - (spaceForRightSide ? pxToNumber(curLayoutConfig.rightMinWidth) : 0) - pxToNumber(curLayoutConfig.leftMinWidth)
    )

    return {spaceForLeftSide, spaceForRightSide, centerWidth: `${centerWidth}px`}
}


function baseConfigEqual(a: LayoutConfigProps, b: LayoutConfigProps) {
    return a.maxWidthCenter == b.maxWidthCenter &&
        a.defaultSidebarState == b.defaultSidebarState &&
        a.leftMinWidth == b.leftMinWidth &&
        a.rightMinWidth == b.rightMinWidth &&
        a.spaceForLeftSide == b.spaceForLeftSide &&
        a.spaceForRightSide == b.spaceForRightSide
}


export const LayoutConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const params = useSearchParams()
    const pathname = usePathname()
    const isMobile = useMediaQuery('(max-width:600px)')

    const [layoutConfig, setLayoutConfig] = useState<LayoutConfigProps>(getLayoutConfig(pathname, params, undefined, isMobile))

    useEffect(() => {
        if ((!layoutConfig.spaceForLeftSide && layoutConfig.openSidebar) || (layoutConfig.spaceForLeftSide && !layoutConfig.openSidebar && layoutConfig.defaultSidebarState)) {
            setLayoutConfig((prev) => ({
                ...prev,
                openSidebar: layoutConfig.spaceForLeftSide
            }))
        }
    }, [layoutConfig?.defaultSidebarState, layoutConfig?.spaceForLeftSide])

    useEffect(() => {
        const handleResize = () => {
            const config = getLayoutConfig(pathname, params, layoutConfig, isMobile)
            if(!baseConfigEqual(layoutConfig, config)){
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
        <LayoutConfigContext.Provider value={{ layoutConfig, setLayoutConfig, isMobile }}>
            {children}
        </LayoutConfigContext.Provider>
    );
};
