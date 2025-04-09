import {ReactNode} from "react";
import {BaseFullscreenPopup} from "./base-fullscreen-popup";
import Button from "@mui/material/Button";


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

            <div className="flex justify-center mt-8 mb-1">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={onClose}
                    sx={{textTransform: "none"}}
                    disableElevation={true}
                >
                    <span className="px-4">{buttonText}</span>
                </Button>
            </div>
        </div>
    </BaseFullscreenPopup>
};