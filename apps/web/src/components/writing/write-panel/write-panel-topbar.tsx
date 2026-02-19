import { StateButton } from "@/components/utils/base/state-button";
import {BaseButton} from "@/components/utils/base/base-button";
import {ReplyToContent} from "@/components/writing/write-panel/write-panel";


export const WritePanelTopbar = ({
    replyTo,
    onClose,
    handleClickSubmit,
    valid,
    isVoteReject,
    editing,
    onBack
}: {
    onBack?: () => void
    onClose: () => void
    replyTo: ReplyToContent
    handleClickSubmit: (force: boolean) => Promise<{ error?: string }>
    isVoteReject: boolean
    valid: boolean
    editing: boolean
}) => {

    const isReply = replyTo != undefined
    return <div className="flex justify-between items-end space-x-2 pb-1 px-1">
        <BaseButton
            variant={"text"}
            size={"small"}
            onClick={onClose}
            className={"ml-1"}
        >
            Cancelar
        </BaseButton>
        <StateButton
            variant={"outlined"}
            handleClick={async () => {
                return handleClickSubmit(false)
            }}
            disabled={!valid}
            size={"small"}
        >
            {editing ? "Confirmar cambios" : isReply ? (isVoteReject ? "Rechazar" : "Responder") : "Publicar"}
        </StateButton>
    </div>
}