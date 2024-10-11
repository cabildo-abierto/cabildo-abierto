import { ReactNode } from "react"
import { createPortal } from "react-dom"
import { CloseButton } from "./close-button"


export const BaseFullscreenPopup = ({children, closeButton=false, onClose}: {children: ReactNode, closeButton?: boolean, onClose?: () => void}) => {
    return createPortal(<div className="fixed inset-0 z-50 flex justify-center items-center"
    >
        <div className="bg-[var(--background)] rounded border-2 border-black text-center max-w-lg z-50">
            {closeButton && <div className="flex justify-end">
                <CloseButton onClose={onClose}/>
            </div>}
            {children}
        </div>
    </div>,
    document.body)
}