import { ReactNode, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { CloseButton } from "./close-button"


export const BaseFullscreenPopup = ({ children, closeButton = false, onClose }: {children: ReactNode, closeButton?: boolean, onClose?: () => void}) => {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (typeof document !== 'undefined' && document.body) {
            setReady(true);
            document.body.style.overflow = 'hidden'; // Disable scrolling

            // Re-enable scrolling when the component unmounts
            return () => {
                document.body.style.overflow = 'auto';
            };
        }
    }, []);

    if (!ready) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex justify-center items-center">
            <div className="px-1">
                <div className="bg-white rounded border-2 border-black text-center max-w-lg z-50">
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
