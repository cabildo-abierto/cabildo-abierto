import {ConfirmModal} from "@/components/layout/confirm-modal";
import {StateButtonClickHandler} from "@/components/layout/utils/state-button";


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