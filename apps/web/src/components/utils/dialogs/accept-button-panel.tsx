import {ReactNode} from "react";
import {BaseFullscreenPopup} from "./base-fullscreen-popup";
import {cn} from "@/lib/utils";
import {StateButton, StateButtonClickHandler} from "../base/state-button";


export const AcceptButtonPanel = ({
                                      children,
                                      className,
                                      buttonText = "Aceptar",
                                      onClose,
                                      open,
                                      backgroundShadow=false
                                  }: {
    children: ReactNode,
    className?: string
    buttonText?: string,
    onClose: StateButtonClickHandler,
    open: boolean
    backgroundShadow?: boolean
}) => {
    return <BaseFullscreenPopup
        open={open}
        backgroundShadow={backgroundShadow}
    >
        <div
            className={cn("bg-[var(--background-dark)] portal group pt-8 px-8 pb-4", className)}
        >
            {children}
            <div className="flex justify-center pt-4 mb-1">
                <StateButton
                    variant={"outlined"}
                    handleClick={onClose}
                    size={"small"}
                >
                    <span className="px-4 text-[13px]">{buttonText}</span>
                </StateButton>
            </div>
        </div>
    </BaseFullscreenPopup>
};