import {BaseButton} from "../base/baseButton";
import {BaseIconButton} from "../base/base-icon-button";
import {WriteButtonIcon} from "@/components/layout/icons/write-button-icon";
import React from "react";
import {useLayoutConfig} from "@/components/layout/layout-config-context";

export const SidebarWriteButton = ({setWritePanelOpen, showText}: {
    showText: boolean,
    setWritePanelOpen: (v: boolean) => void
}) => {
    const {layoutConfig, setLayoutConfig, isMobile} = useLayoutConfig()

    return <>
        <div className={"my-2 h-12 pl-2 " + (showText ? "pr-4 sm:w-[180px] w-full max-w-[300px]" : "")}>
            {showText ? <BaseButton
                    startIcon={<WriteButtonIcon/>}
                    size={"large"}
                    variant={"outlined"}
                    onClick={() => {
                        setWritePanelOpen(true)
                        if(isMobile) {
                            setLayoutConfig({
                                ...layoutConfig,
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
    </>
}