"use client"

import React, {createContext, useContext, useState, ReactNode, useEffect} from "react";
import {isArticle, isDataset, shortCollectionToCollection} from "@cabildo-abierto/utils";
import {usePathname} from "next/navigation";
import {pxToNumber} from "@cabildo-abierto/utils";
import {useWindowSize} from "usehooks-ts";
import {useIsMobile} from "@/components/utils/use-is-mobile";

export type LayoutConfigProps = {
    maxWidthCenter: string
    widthLeftSide: string
    widthRightSide: string
    defaultSidebarState: boolean
    openSidebar: boolean
    widthLeftSideSmall: string,
    openRightPanel: boolean
    centerWidth?: string
    spaceForRightSide?: boolean
    spaceForLeftSide?: boolean
    spaceForMinimizedLeftSide?: boolean
    readingLayout: boolean
    rightDisappearsFirst?: boolean
    sidebarKind: "floating" | "background"
}


const LayoutConfigContext = createContext<{
    layoutConfig: LayoutConfigProps;
    setLayoutConfig: React.Dispatch<React.SetStateAction<LayoutConfigProps>>;
    isMobile: boolean
    width: number
} | undefined>(undefined);

export const useLayoutConfig = () => {
    const context = useContext(LayoutConfigContext);
    if (!context) {
        throw new Error("useLayout must be used within a LayoutConfigContext");
    }
    return context
}


function getLayoutConfig(pathname: string, windowWidth: number, currentConfig?: LayoutConfigProps, isMobile: boolean = false): LayoutConfigProps {
    const feedConfig: LayoutConfigProps = {
        maxWidthCenter: "600px",
        widthLeftSide: "220px",
        widthRightSide: "300px",
        widthLeftSideSmall: "80px",
        openSidebar: currentConfig?.openSidebar ?? true,
        openRightPanel: true,
        defaultSidebarState: true,
        sidebarKind: "background",
        readingLayout: false
    }
    const datasetConfig: LayoutConfigProps = {
        maxWidthCenter: "800px",
        widthLeftSide: "80px",
        widthRightSide: "300px",
        widthLeftSideSmall: "80px",
        openSidebar: currentConfig?.openSidebar ?? true,
        openRightPanel: true,
        defaultSidebarState: true,
        sidebarKind: "background",
        readingLayout: false
    }
    const articleConfig: LayoutConfigProps = {
        maxWidthCenter: "682px",
        widthLeftSide: "220px",
        widthRightSide: "300px",
        widthLeftSideSmall: "80px",
        openSidebar: false,
        defaultSidebarState: false,
        openRightPanel: false,
        sidebarKind: "floating",
        readingLayout: true
    }
    const maximizedTopicConfig: LayoutConfigProps = {
        maxWidthCenter: "800px",
        widthLeftSide: "240px",
        widthRightSide: "300px",
        widthLeftSideSmall: "80px",
        openSidebar: false,
        defaultSidebarState: false,
        openRightPanel: false,
        rightDisappearsFirst: true,
        sidebarKind: "floating",
        readingLayout: false
    }
    const mobileConfig: LayoutConfigProps = {
        maxWidthCenter: "600px",
        widthLeftSide: "0px",
        widthRightSide: "0px",
        widthLeftSideSmall: "80px",
        defaultSidebarState: false,
        openSidebar: false,
        openRightPanel: false,
        sidebarKind: "floating",
        readingLayout: false
    }
    const emptyLayoutConfig: LayoutConfigProps = {
        maxWidthCenter: undefined,
        widthLeftSide: "0px",
        widthRightSide: "0px",
        widthLeftSideSmall: "0px",
        openSidebar: false,
        defaultSidebarState: false,
        openRightPanel: false,
        rightDisappearsFirst: true,
        sidebarKind: "floating",
        readingLayout: false
    }

    let config: LayoutConfigProps
    if (isMobile) {
        config = mobileConfig
    } else if (pathname.startsWith("/temas")) {
        config = {
            ...feedConfig,
            maxWidthCenter: "800px"
        }
    } else if (pathname.startsWith("/tema") && !pathname.startsWith("/tema/menciones")) {
        config = maximizedTopicConfig
    } else if (pathname.startsWith("/panel")) {
        config = {
            ...maximizedTopicConfig,
            defaultSidebarState: true
        }
    } else if (pathname.startsWith("/c")) {
        const shortCollection = pathname.split("/")[3]
        const collection = shortCollectionToCollection(shortCollection)
        if (isArticle(collection)) {
            config = articleConfig
        } else if (isDataset(collection)) {
            config = datasetConfig
        } else {
            config = feedConfig
        }
    } else if (pathname.startsWith("/escribir/articulo")) {
        config = articleConfig
    } else if(pathname.startsWith("/admin")) {
        config = emptyLayoutConfig
    } else {
        config = feedConfig
    }

    const {
        spaceForLeftSide,
        spaceForRightSide,
        centerWidth,
        spaceForMinimizedLeftSide
    } = getSpaceAvailable(config, windowWidth)

    return {
        ...config,
        spaceForLeftSide,
        spaceForRightSide,
        spaceForMinimizedLeftSide,
        centerWidth,
    }
}


function getSpaceAvailable(curLayoutConfig: LayoutConfigProps, width: number) {
    const reqWidthLeftSide = pxToNumber(curLayoutConfig.widthLeftSide) +
        pxToNumber(curLayoutConfig.widthRightSide) +
        pxToNumber(curLayoutConfig.maxWidthCenter)

    const reqWidthMinimizedLeftSideSide = pxToNumber(curLayoutConfig.widthLeftSideSmall) +
        pxToNumber(curLayoutConfig.maxWidthCenter)

    const reqWidthRightSide = pxToNumber(curLayoutConfig.widthLeftSideSmall) +
        pxToNumber(curLayoutConfig.widthRightSide) +
        pxToNumber(curLayoutConfig.maxWidthCenter)


    const spaceForLeftSide = width >= reqWidthLeftSide
    const spaceForRightSide = width >= reqWidthRightSide
    const spaceForMinimizedLeftSide = width >= reqWidthMinimizedLeftSideSide
    const centerWidth = Math.min(
        pxToNumber(curLayoutConfig.maxWidthCenter),
        width - (spaceForRightSide ? pxToNumber(curLayoutConfig.widthRightSide) : (spaceForMinimizedLeftSide ? pxToNumber(curLayoutConfig.widthLeftSideSmall) : 0)) - pxToNumber(curLayoutConfig.widthLeftSide)
    )

    return {spaceForLeftSide, spaceForRightSide, centerWidth: `${centerWidth}px`, spaceForMinimizedLeftSide}
}


function baseConfigEqual(a: LayoutConfigProps, b: LayoutConfigProps) {
    return a.maxWidthCenter == b.maxWidthCenter &&
        a.defaultSidebarState == b.defaultSidebarState &&
        a.widthLeftSide == b.widthLeftSide &&
        a.widthRightSide == b.widthRightSide &&
        a.spaceForLeftSide == b.spaceForLeftSide &&
        a.spaceForRightSide == b.spaceForRightSide
}


export const LayoutConfigProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const pathname = usePathname()
    const {isMobile} = useIsMobile()
    const size = useWindowSize()

    const [layoutConfig, setLayoutConfig] = useState<LayoutConfigProps>(getLayoutConfig(pathname, size.width, undefined, isMobile))

    useEffect(() => {
        if ((!layoutConfig.spaceForLeftSide && layoutConfig.openSidebar) || (layoutConfig.spaceForLeftSide && !layoutConfig.openSidebar && layoutConfig.defaultSidebarState)) {
            setLayoutConfig((prev) => ({
                ...prev,
                openSidebar: layoutConfig.spaceForLeftSide
            }))
        }
    }, [layoutConfig?.defaultSidebarState, layoutConfig?.spaceForLeftSide])

    useEffect(() => {
        const config = getLayoutConfig(pathname, size.width, layoutConfig, isMobile)
        if (!baseConfigEqual(layoutConfig, config)) {
            setLayoutConfig(config)
        }
    }, [layoutConfig, pathname, size]);

    return (
        <LayoutConfigContext.Provider value={{layoutConfig, setLayoutConfig, isMobile, width: size.width}}>
            {children}
        </LayoutConfigContext.Provider>
    );
};
