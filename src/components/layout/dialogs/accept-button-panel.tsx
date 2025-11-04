import {ReactNode} from "react";
import {BaseFullscreenPopup} from "../base/base-fullscreen-popup";
import {BaseButton} from "../base/baseButton";
import {cn} from "@/lib/utils";


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
    onClose: () => void,
    open: boolean
    backgroundShadow?: boolean
}) => {
    return <BaseFullscreenPopup open={open} backgroundShadow={backgroundShadow}>
        <div className={cn("bg-[var(--background-dark)] portal group pt-8 px-8 pb-4", className)}>
            {children}
            <div className="flex justify-center pt-4 mb-1">
                <BaseButton
                    variant={"outlined"}
                    onClick={onClose}
                    size={"small"}
                >
                    <span className="px-4 text-[13px]">{buttonText}</span>
                </BaseButton>
            </div>
        </div>
    </BaseFullscreenPopup>
};