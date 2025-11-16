import {ReactNode} from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogOverlay,
    DialogHeader,
    DialogDescription
} from "../ui/dialog"
import {VisuallyHidden} from "@radix-ui/react-visually-hidden";
import {CloseButton} from "../base/close-button";
import {cn} from "@/lib/utils";


export const BaseFullscreenPopup = ({
                                        children,
                                        closeButton = false,
                                        onClose,
                                        open,
                                        className,
                                        hidden = false,
                                        backgroundShadow = false,
    overlayClassName,
    ariaLabelledBy="panel"
                                    }: {
    open: boolean
    children: ReactNode
    closeButton?: boolean
    onClose?: () => void
    className?: string
    hidden?: boolean
    backgroundShadow?: boolean
    zIndex?: number
    overlayClassName?: string
    ariaLabelledBy?: string
}) => {
    // TO DO (!): Cerrar la sidebar al abrir el popup


    if (hidden) return <div className={"hidden"}>{children}</div>


    return <Dialog
        open={open}
        modal={true}
    >
        {backgroundShadow && <DialogOverlay
            className={cn("z-[1050]", overlayClassName)}
        />}
        <DialogContent
            className={cn(`z-[1400] w-screen sm:min-w-[300px] sm:border border-[var(--accent-dark)] sm:w-auto`, className)}
            onClick={e => {
                e.stopPropagation()
            }}
            aria-labelledby={ariaLabelledBy}
        >
            <DialogHeader>
                <VisuallyHidden>
                    <DialogTitle>Título</DialogTitle>
                    <DialogDescription>Descripción</DialogDescription>
                </VisuallyHidden>
            </DialogHeader>
            {closeButton && onClose && (
                <div className="flex justify-end mr-1 mt-1">
                    <CloseButton
                        onClose={onClose}
                        size={"small"}
                    />
                </div>
            )}
            {children}
        </DialogContent>
    </Dialog>
};
