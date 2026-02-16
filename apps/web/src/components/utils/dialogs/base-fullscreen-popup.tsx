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
import {produce} from "immer";
import {BackButton} from "@/components/utils/base/back-button";
import {useLayoutState} from "@/components/layout/main-layout/layout-state-context";
import {useIsMobile} from "@/components/utils/use-is-mobile";


export const BaseFullscreenPopup = ({
                                        children,
                                        closeButton = false,
                                        onClose,
                                        open,
                                        className,
                                        hidden = false,
                                        backgroundShadow = false,
    overlayClassName,
    ariaLabelledBy="panel",
    fullscreenOnMobile = true,
    onBack
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
    fullscreenOnMobile?: boolean
    onBack?: () => void
}) => {
    const {layoutState, setLayoutState} = useLayoutState()
    const {isMobile} = useIsMobile()

    useEffect(() => {
        if(layoutState.openSidebar && isMobile && open) {
            setLayoutState(produce(layoutState, draft => {
                draft.openSidebar = false
            }))
        }
    }, [layoutState, isMobile])

    if (hidden) return <div className={"hidden"}>{children}</div>


    return <Dialog
        open={open}
        modal={true}
    >
        {backgroundShadow && <DialogOverlay
            className={cn("z-[1399]", overlayClassName)}
        />}
        <DialogContent
            className={cn("z-[1400] flex flex-col", isMobile && fullscreenOnMobile ?
                    "fixed w-screen left-0 translate-x-0 translate-y-0 top-0 h-screen" :
                    "w-auto left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2", className)}
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
                <div className="flex justify-between items-center mx-1 mt-1">
                    {onBack ? <BackButton
                        onClick={onBack}
                        size={"small"}
                    /> : <div/>}
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
