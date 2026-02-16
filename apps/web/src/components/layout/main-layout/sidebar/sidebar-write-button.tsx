import {BaseButton} from "@/components/utils/base/base-button";
import {BaseIconButton} from "@/components/utils/base/base-icon-button";
import {WriteButtonIcon} from "@/components/utils/icons/write-button-icon";
import React from "react";
import {cn} from "@/lib/utils";
import {useLayoutState} from "@/components/layout/main-layout/layout-state-context";
import {useIsMobile} from "@/components/utils/use-is-mobile";

export const SidebarWriteButton = ({setWritePanelOpen, showText}: {
    showText: boolean,
    setWritePanelOpen: (v: boolean) => void
}) => {
    const {isMobile} = useIsMobile()
    const {layoutState, setLayoutState} = useLayoutState()

    return <div className={cn("my-2 h-12 pl-2", showText && "pr-4 sm:w-[180px] w-full max-w-[300px]")}>
        {showText ? <BaseButton
                startIcon={<WriteButtonIcon/>}
                size={"large"}
                variant={"outlined"}
                onClick={() => {
                    setWritePanelOpen(true)
                    if (isMobile) {
                        setLayoutState({
                            ...layoutState,
                            openSidebar: false
                        })
                    }
                }}
                id={"write-button"}
                fontWeight={500}
                className={"w-full"}
                letterSpacing={"0.02em"}
            >
                    <span className={"text-[16px] sm:text-[14px]"}>
                        Escribir
                    </span>
            </BaseButton> :
            <BaseIconButton
                variant={"outlined"}
                size={"large"}
                onClick={() => {
                    setWritePanelOpen(true)
                }}
                id={"write-button"}
            >
                <WriteButtonIcon/>
            </BaseIconButton>
        }
    </div>
}