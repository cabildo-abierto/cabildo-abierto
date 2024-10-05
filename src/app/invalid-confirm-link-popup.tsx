import { AcceptButtonPanel } from "../components/accept-button-panel";




export const InvalidConfirmLinkPopup = ({onClose}: {onClose: any}) => {
    return <AcceptButtonPanel
        text={<div className="py-4 text-lg">El link de verificación expiró o es inválido.</div>}
        onClose={onClose}
    />
    return (
        <div className="fixed inset-0 bg-opacity-50 bg-gray-800 z-10 flex justify-center items-center backdrop-blur-sm">
            
            <div className="bg-[var(--background)] rounded border-2 border-black p-8 z-10 text-center max-w-lg">
                <div className="py-4 text-lg">El link de verificación expiró o es inválido.</div>
                <div className="flex justify-center items-center py-8 space-x-4">
                    <button onClick={onClose} className="gray-btn">
                        Ok
                    </button>
                </div>
            </div>
        </div>
    );
};