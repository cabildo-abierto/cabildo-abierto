import { ReactNode, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { CloseButton } from "./close-button"


export const BaseFullscreenPopup = ({ children, closeButton = false, onClose, className="px-1" }: {children: ReactNode, closeButton?: boolean, onClose?: () => void, className?: string}) => {
    const [ready, setReady] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (typeof document !== 'undefined' && document.body) {
            setReady(true);
            setIsMobile(/Mobi|Android/i.test(navigator.userAgent));
            document.body.style.overflow = 'hidden'; // Disable scrolling on body

            return () => {
                document.body.style.overflow = 'auto'; // Re-enable scrolling when component unmounts
            };
        }
    }, []);

    if (!ready) return null;

    return createPortal(
        <div 
            className={`inset-0 z-50 flex justify-center items-center ${isMobile ? 'absolute' : 'fixed'}`}
            style={{ transform: 'translateZ(0)' }} // Force layer creation
        >
            <div className={className}>
                <div className="bg-white rounded border-2 border-black text-center z-50 overflow-y-scroll">
                    {closeButton && (
                        <div className="flex justify-end">
                            <CloseButton onClose={onClose} />
                        </div>
                    )}
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};
