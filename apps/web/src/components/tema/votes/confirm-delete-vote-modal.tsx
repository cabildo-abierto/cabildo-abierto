import {ConfirmModal} from "../../utils/dialogs/confirm-modal";
import {StateButtonClickHandler} from "@/components/utils/base/state-button";


export const ConfirmDeleteVoteModal = ({
    onConfirm,
    onClose
}: {
    onConfirm: StateButtonClickHandler
    onClose: () => void
}) => {
    return <ConfirmModal
        title={"Cancelar voto"}
        text={"Al borrar este voto se va a borrar también la publicación que lo justificaba."}
        open={true}
        onConfirm={onConfirm}
        onClose={onClose}
    />
}