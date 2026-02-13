import {ReactNode, useEffect} from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogOverlay,
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
        if(layoutConfig.openSidebar && isMobile && open) {
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
    left-0
    translate-x-0
    translate-y-0
    top-0
    h-screen
    sm:w-auto
    sm:left-[50%] 
    sm:top-[50%]
    sm:translate-x-[-50%]
    sm:translate-y-[-50%]
    sm:border
    sm:h-auto
    flex flex-col
    `, className)}
            onClick={e => {
                e.stopPropagation()
            }}
            aria-labelledby={ariaLabelledBy}
        >
            <VisuallyHidden>
                <DialogTitle>Título</DialogTitle>
                <DialogDescription>Descripción</DialogDescription>
            </VisuallyHidden>
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
