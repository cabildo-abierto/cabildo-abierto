"use client"
import {ReactNode, useEffect} from "react";
import {SidebarContent} from "./sidebar";
import {useLayoutConfig} from "./layout-config-context";
import {RightPanel} from "./right-panel";
import {pxToNumber} from "@/utils/strings";
import {BottomBarMobile} from "./bottom-bar-mobile";
import {emptyChar} from "@/utils/utils";
import {createPortal} from "react-dom";

export const MainLayoutContent = ({children}: {children: ReactNode}) => {
    const {layoutConfig, setLayoutConfig} = useLayoutConfig()

    useEffect(() => {
        const handleResize = () => {
            const reqWidth = 224 +
                pxToNumber(layoutConfig.rightMinWidth) +
                pxToNumber(layoutConfig.maxWidthCenter);

            const reqWidthRightSide = 80 + pxToNumber(layoutConfig.rightMinWidth) +
                pxToNumber(layoutConfig.maxWidthCenter);

            if ((window.innerWidth >= reqWidth) != layoutConfig.spaceForLeftSide) {
                setLayoutConfig((prev) => ({
                    ...prev,
                    spaceForLeftSide: window.innerWidth >= reqWidth,
                }))
            }

            if((window.innerWidth >= reqWidthRightSide) != layoutConfig.spaceForRightSide){
                setLayoutConfig((prev) => ({
                    ...prev,
                    spaceForRightSide: window.innerWidth >= reqWidthRightSide,
                }))
            }
        };

        window.addEventListener("resize", handleResize);

        handleResize();

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [layoutConfig]);


    const left = <div className={"fixed top-0 z-[1010] left-0 right-auto border-r"}>
        <SidebarContent onClose={() => {}}/>
    </div>

    let right: ReactNode
    if (layoutConfig.openRightPanel) {
        right = <RightPanel/>
    }

    return <div className="flex justify-between w-full min-h-screen">
        <div className={"flex-shrink-0 " + (layoutConfig.spaceForLeftSide ? "w-56" : "min-[500px]:w-20")}>
            {left}
            {layoutConfig.openSidebar && (
                createPortal(<div
                    className={
                        "min-[500px]:hidden w-screen absolute inset-0 h-screen z-[1009] bg-black bg-opacity-50"
                    }
                    onClick={() => {
                        setLayoutConfig((prev) => ({ ...prev, openSidebar: false }));
                    }}
                >
                    {emptyChar}
                </div>, window.document)
            )}
        </div>

        <div className={"w-full flex justify-center"}>
            <div
                className={`flex-grow min-h-screen`}
                style={{
                    minWidth: 0,
                    maxWidth: layoutConfig.maxWidthCenter,
                }}
            >
                {children}
            </div>
        </div>

        {layoutConfig.spaceForRightSide &&
            <div
                className="flex-shrink-0 sticky top-0 max-h-screen no-scrollbar overflow-y-auto"
                style={{ width: layoutConfig.rightMinWidth }}
            >
                {right}
            </div>
        }

        <div className="fixed bottom-0 left-0 w-full max-[500px]:block hidden">
            <BottomBarMobile/>
        </div>
    </div>
}