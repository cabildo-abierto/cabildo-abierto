import { ReactNode } from "react";
import { BaseFullscreenPopup } from "./base-fullscreen-popup";


export const AcceptButtonPanel = ({text, onClose}: {text: ReactNode, onClose: () => void}) => {
    return <BaseFullscreenPopup>
        <div className="p-8">
            {text}

            <div className="flex justify-center mt-8">
                <button className="gray-btn" onClick={onClose}>
                    Aceptar
                </button>
            </div>
        </div>
    </BaseFullscreenPopup>
};