import {Button} from "../../../../modules/ui-utils/src/button";
import {IconButton} from "../../../../modules/ui-utils/src/icon-button";
import {WriteButtonIcon} from "@/components/layout/icons/write-button-icon";
import React from "react";

export const SidebarWriteButton = ({onClick, showText}: { showText: boolean, onClick: () => void }) => {

    return <>
        <div className={"my-2 h-12 pl-2 " + (showText ? "pr-4 sm:w-[180px] w-full max-w-[300px]" : "")}>
            {showText ? <Button
                    startIcon={<WriteButtonIcon/>}
                    size={"large"}
                    variant={"outlined"}
                    fullWidth={true}
                    onClick={() => {
                        onClick()
                    }}
                    id={"write-button"}
                >
                    <span className={"font-bold text-[16px] sm:text-[14px]"}>
                        Escribir
                    </span>
                </Button> :
                <IconButton
                    color={"background-dark"}
                    onClick={() => {
                        onClick()
                    }}
                    sx={{
                        borderRadius: "0",
                        borderColor: "var(--text-lighter)",
                        border: "1px solid"
                    }}
                    size={"medium"}
                    id={"write-button"}
                >
                    <WriteButtonIcon/>
                </IconButton>
            }
        </div>
    </>
}