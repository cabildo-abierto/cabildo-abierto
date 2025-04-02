import { ReactNode } from "react";
import { Box, Modal } from "@mui/material";
import { CloseButton } from "./close-button";

export const BaseFullscreenPopup = ({
    children,
    closeButton = false,
    onClose,
    open,
    className,
    allowClose = false
}: {
    open: boolean
    children: ReactNode;
    closeButton?: boolean;
    onClose?: () => void;
    className?: string;
    allowClose?: boolean
}) => {
    return (
        <Modal
            open={open}
            onClose={() => {
                if (allowClose && onClose) onClose();
            }}
            disableEnforceFocus={true}
            disableScrollLock={true}
            className={"flex justify-center items-center"}
        >
            <Box className={"min-w-[300px] shadow-lg bg-[var(--background)] rounded-lg " + className}>
                {closeButton && (
                    <div className="flex justify-end mr-1 mt-1">
                        <CloseButton onClose={onClose} size={"small"} />
                    </div>
                )}
                {children}
            </Box>
        </Modal>
    );
};
