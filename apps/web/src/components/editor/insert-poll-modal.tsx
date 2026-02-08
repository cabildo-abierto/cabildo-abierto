import {BaseFullscreenPopup} from "@/components/utils/dialogs/base-fullscreen-popup";
import {LexicalEditor} from "lexical";
import {EditPoll, PollEditState} from "@/components/writing/poll/edit-poll";
import {useState} from "react";
import {CloseButton} from "@/components/utils/base/close-button";
import {INSERT_EMBED_COMMAND} from "@/components/editor/plugins/EmbedPlugin";
import {EmbedPayload} from "@/components/editor/nodes/EmbedNode";
import {useErrors} from "@/components/layout/contexts/error-context";
import {pollEditStateToFirstView} from "@/components/writing/poll/poll-edit-to-first-view";


export const EditPollModal = ({
    onClose,
    open,
    onSave,
    initialPoll
                              }: {
    open: boolean
    onClose: () => void
    onSave: (poll: PollEditState) => void,
    initialPoll?: PollEditState
}) => {
    const [poll, setPoll] = useState<PollEditState>(initialPoll ?? {
        choices: [""],
        description: ""
    })

    return <BaseFullscreenPopup
        open={open}
        onClose={onClose}
        closeButton={false}
    >
        <div className={"flex justify-between items-center py-1"}>
            <h3 className={"text-left px-3"}>
                Nueva encuesta
            </h3>
            <CloseButton onClose={onClose}/>
        </div>
        <div className={"p-3"}>
            <EditPoll
                poll={poll}
                setPoll={setPoll}
                onSave={() => {onSave(poll)}}
            />
        </div>
    </BaseFullscreenPopup>
}


export function InsertPollModal({
                                    activeEditor,
                                    onClose,
                                    open
                                }: {
    activeEditor: LexicalEditor;
    open: boolean;
    onClose: () => void;
}) {
    const {addError} = useErrors()

    function onSave(poll: PollEditState) {
        const embed = pollEditStateToFirstView(poll)

        if(embed.poll.choices.length < 2) {
            addError("La encuesta tiene que tener al menos dos opciones.")
        }

        const payload: EmbedPayload = {
            spec: embed
        }
        activeEditor.dispatchCommand(INSERT_EMBED_COMMAND, payload)
        onClose()
    }

    return <EditPollModal
        open={open}
        onSave={onSave}
        onClose={onClose}
    />
}
