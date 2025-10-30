import {BaseButton} from "../base/baseButton";
import {BaseIconButton} from "../base/base-icon-button";
import {WriteButtonIcon} from "@/components/layout/icons/write-button-icon";
import React from "react";

export const SidebarWriteButton = ({onClick, showText}: { showText: boolean, onClick: () => void }) => {

    return <>
        <div className={"my-2 h-12 pl-2 " + (showText ? "pr-4 sm:w-[180px] w-full max-w-[300px]" : "")}>
            {showText ? <BaseButton
                    startIcon={<WriteButtonIcon/>}
                    size={"large"}
                    variant={"outlined"}
                    onClick={() => {
                        onClick()
                    }}
                    id={"write-button"}
                    fontWeight={500}
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
                        onClick()
                    }}
                    id={"write-button"}
                >
                    <WriteButtonIcon/>
                </BaseIconButton>
            }
        </div>
    </>
}