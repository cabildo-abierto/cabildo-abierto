import { ReactNode } from "react";
import { Box, Modal } from "@mui/material";
import { CloseButton } from "./close-button";
import {Color} from "./button";

export const BaseFullscreenPopup = ({
    children,
    closeButton = false,
    onClose,
    open,
    className="sm:w-auto",
    color="background-dark",
    allowClose = false,
    hidden=false,
    disableScrollLock=true,
    backgroundShadow=true,
}: {
    open: boolean
    children: ReactNode;
    closeButton?: boolean;
    onClose?: () => void;
    className?: string;
    allowClose?: boolean
    color?: Color
    hidden?: boolean
    disableScrollLock?: boolean
    backgroundShadow?: boolean
}) => {
    if(hidden) return <div className={"hidden"}>{children}</div>
    return (
        <Modal
            open={open}
            onClose={() => {
                if (allowClose && onClose) onClose();
            }}
            disableEnforceFocus={true}
            disableScrollLock={disableScrollLock}
            className={"flex justify-center items-center"}
            BackdropProps={{
                style: {
                    backgroundColor: backgroundShadow ? "rgba(0, 0, 0, 0.5)" : "transparent",
                }
            }}
        >
            <Box className={"w-screen sm:min-w-[300px] shadow-lg sm:rounded-lg sm:border " + className} sx={{backgroundColor: `var(--${color})`}}>
                {closeButton && (
                    <div className="flex justify-end mr-1 mt-1">
                        <CloseButton
                            onClose={onClose}
                            size={"small"}
                            color={color}
                        />
                    </div>
                )}
                {children}
            </Box>
        </Modal>
    );
};
