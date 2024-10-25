import { AcceptButtonPanel } from "../components/accept-button-panel";




export const InvalidConfirmLinkPopup = ({onClose}: {onClose: any}) => {
    return <AcceptButtonPanel
        onClose={onClose}
    >
        <div className="py-4 text-lg">El link de verificación expiró o es inválido.</div>
    </AcceptButtonPanel>
};