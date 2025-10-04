import {ReactNode} from "react";
import {BaseFullscreenPopup} from "./base-fullscreen-popup";
import {Button} from "./button";
import { Color } from "./color";


export const AcceptButtonPanel = ({
                                      children,
                                      className = "pt-8 px-8 pb-4",
                                      buttonText = "Aceptar",
                                      onClose,
                                      open,
                                      backgroundShadow = true,
    color
                                  }: {
    children: ReactNode,
    className?: string
    buttonText?: string,
    onClose: () => void,
    open: boolean
    backgroundShadow?: boolean
    color?: Color
}) => {
    return <BaseFullscreenPopup color={color} open={open} backgroundShadow={backgroundShadow}>
        <div className={className}>
            {children}

            <div className="flex justify-center mt-4 mb-1">
                <Button
                    variant={"outlined"}
                    onClick={onClose}
                >
                    <span className="px-4 text-[13px]">{buttonText}</span>
                </Button>
            </div>
        </div>
    </BaseFullscreenPopup>
};