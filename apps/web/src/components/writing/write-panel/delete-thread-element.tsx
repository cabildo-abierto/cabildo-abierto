import {BaseIconButton} from "@/components/utils/base/base-icon-button";
import {useState} from "react";
import {CloseButtonIcon} from "@/components/utils/icons/close-button-icon";
import {ConfirmModal} from "@/components/utils/dialogs/confirm-modal";


export const DeleteThreadElement = ({onDelete}: {
    onDelete: () => void
}) => {
    const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false)

    return <div>
        <BaseIconButton
            onClick={() => {
                setConfirmDeleteModalOpen(true)
            }}
            size={"small"}
        >
            <CloseButtonIcon/>
        </BaseIconButton>
        {confirmDeleteModalOpen && <ConfirmModal
            title={`¿Descartar la publicación?`}
            text={"Se va a descartar este elemento del hilo."}
            open={true}
            onConfirm={() => {
                onDelete()
                setConfirmDeleteModalOpen(false)
            }}
            onClose={() => {
                setConfirmDeleteModalOpen(false)
            }}
            confirmButtonVariant={"error"}
            confirmButtonText={"Borrar"}
        />}
    </div>
}