import {ReactNode} from "react";
import {BaseFullscreenPopup} from "./base-fullscreen-popup";
import { Button } from "./button";


export const AcceptButtonPanel = ({
                                      children, className="pt-8 px-8 pb-4", buttonText = "Aceptar", onClose, open
                                  }: {
    children: ReactNode,
    className?: string
    buttonText?: string,
    onClose: () => void,
    open: boolean
}) => {
    return <BaseFullscreenPopup open={open}>
        <div className={className}>
            {children}

            <div className="flex justify-center mt-4 mb-1">
                <Button
                    color="primary"
                    onClick={onClose}
                >
                    <span className="px-4 font-bold text-[13px]">{buttonText}</span>
                </Button>
            </div>
        </div>
    </BaseFullscreenPopup>
};