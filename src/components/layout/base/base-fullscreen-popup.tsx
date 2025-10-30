import {ReactNode} from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent, DialogOverlay,
} from "@/components/ui/dialog"
import {VisuallyHidden} from "@radix-ui/react-visually-hidden";
import {CloseButton} from "@/components/layout/utils/close-button";
import {cn} from "@/lib/utils";


export const BaseFullscreenPopup = ({
                                        children,
                                        closeButton = false,
                                        onClose,
                                        open,
                                        className = "sm:w-auto",
                                        allowClose = false,
                                        hidden = false,
                                        disableScrollLock = true,
                                        backgroundShadow = false,
    overlayClassName
                                    }: {
    open: boolean
    children: ReactNode;
    closeButton?: boolean;
    onClose?: () => void;
    className?: string;
    allowClose?: boolean
    hidden?: boolean
    disableScrollLock?: boolean
    backgroundShadow?: boolean
    zIndex?: number
    overlayClassName?: string
}) => {
    if (hidden) return <div className={"hidden"}>{children}</div>

    return <Dialog
        open={open}
        modal={true}
    >
        {backgroundShadow && <DialogOverlay className={cn("z-[1050]", overlayClassName)}/>}
        <DialogContent
            className={cn(`z-[1400] w-screen sm:min-w-[300px] sm:border border-[var(--accent-dark)]`, className)}
            onClick={e => e.stopPropagation()}
        >
            <VisuallyHidden>
                <DialogTitle>Título</DialogTitle>
            </VisuallyHidden>
            {closeButton && (
                <div className="flex justify-end mr-1 mt-1">
                    <CloseButton onClose={onClose} size={"small"}/>
                </div>
            )}
            {children}
        </DialogContent>
    </Dialog>
};
