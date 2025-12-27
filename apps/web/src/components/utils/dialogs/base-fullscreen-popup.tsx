import {ReactNode, useEffect} from "react";
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
import {useLayoutConfig} from "@/components/layout/main-layout/layout-config-context";
import {produce} from "immer";


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
    const {layoutConfig, setLayoutConfig, isMobile} = useLayoutConfig()
    useEffect(() => {
        if(layoutConfig.openSidebar && isMobile) {
            setLayoutConfig(produce(layoutConfig, draft => {
                draft.openSidebar = false
            }))
        }
    }, [layoutConfig, isMobile])

    if (hidden) return <div className={"hidden"}>{children}</div>


    return <Dialog
        open={open}
        modal={true}
    >
        {backgroundShadow && <DialogOverlay
            className={cn("z-[1399]", overlayClassName)}
        />}
        <DialogContent
            className={cn(
                `
    z-[1400]
    fixed
    w-screen
    translate-x-0
    top-1/2
    left-0
    h-auto
    sm:w-auto
    sm:left-[50%] sm:top-[50%]
    sm:translate-x-[-50%] translate-y-[-100%] sm:translate-y-[-50%]
    sm:border
    `, className)}
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
