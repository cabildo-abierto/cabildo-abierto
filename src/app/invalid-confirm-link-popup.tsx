import { AcceptButtonPanel } from "../components/accept-button-panel";




export const InvalidConfirmLinkPopup = ({onClose}: {onClose: any}) => {
    return <AcceptButtonPanel
        onClose={onClose}
    >
        <div className="py-4 text-lg">El link de verificación expiró o es inválido.</div>
        <div>No te preocupes, intentá iniciar sesión y te va a aparecer la opción de volver a enviar el mail.</div>
    </AcceptButtonPanel>
};