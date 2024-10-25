import { ReactNode } from "react";
import { BaseFullscreenPopup } from "./base-fullscreen-popup";


export const AcceptButtonPanel = ({children, buttonText="Aceptar", onClose}: {children: ReactNode, buttonText?: string, onClose: () => void}) => {
    return <BaseFullscreenPopup>
        <div className="p-8">
            {children}

            <div className="flex justify-center mt-8">
                <button className="gray-btn" onClick={onClose}>
                    {buttonText}
                </button>
            </div>
        </div>
    </BaseFullscreenPopup>
};