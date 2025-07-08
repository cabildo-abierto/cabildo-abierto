import {useState} from "react";
import {AcceptButtonPanel} from "../../../modules/ui-utils/src/accept-button-panel";


export const useLoginRequiredModal = (text: string = "Iniciá sesión para realizar esta acción") => {
    const [open, setOpen] = useState(false)

    const modal = <AcceptButtonPanel
        onClose={() => {setOpen(false)}}
        open={open}
    >
        {text}
    </AcceptButtonPanel>

    return {setShowLoginRequiredModal: setOpen, showingLoginRequiredModal: open, modal}
}