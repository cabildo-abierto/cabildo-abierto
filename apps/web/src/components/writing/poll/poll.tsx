import {ArCabildoabiertoEmbedPoll} from "@cabildo-abierto/api";
import {post} from "@/components/utils/react/fetch";
import {useState} from "react";
import {sum} from "@cabildo-abierto/utils";
import {BaseIconButton} from "@/components/utils/base/base-icon-button";
import {TrashIcon} from "@phosphor-icons/react";
import {$Typed} from "@atproto/api";
import {EditPollModal} from "@/components/editor/insert-poll-modal";
import {LexicalEditor} from "lexical";
import {WriteButtonIcon} from "@/components/utils/icons/write-button-icon";
import {PollEditState} from "@/components/writing/poll/edit-poll";
import {pollEditStateToFirstView} from "@/components/writing/poll/poll-edit-to-first-view";
import {PollChoice} from "@/components/writing/poll/poll-choice";





export const Poll = ({poll, onDelete, activeEditor, onEdit}: {
    poll: ArCabildoabiertoEmbedPoll.View
    activeEditor?: LexicalEditor
    onDelete?: () => void
    onEdit?: (v: $Typed<ArCabildoabiertoEmbedPoll.View>) => void
}) => {
    const [editing, setEditing] = useState(false)
    const choices = poll.poll.choices
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    async function onSelectOption(idx: number) {
        setSelectedIndex(idx)

        await post("/vote-poll/", {
            pollId: poll.id,
            choiceIndex: idx
        })
    }

    const totalVotes = sum(poll.votes, x => x)

    function onSavePoll(newPoll: PollEditState) {
        onEdit(pollEditStateToFirstView(newPoll))
        setEditing(false)
    }

    return (
        <div
            className="w-full max-w-md rounded-2xl border bg-[var(--background-dark)] portal group p-4 shadow-sm space-y-4">
            <div className={"flex justify-between"}>
                <div className="space-y-1">
                    <div className="text-base font-semibold">
                        {poll.poll.description}
                    </div>
                    <div className="text-xs text-[var(--text-light)]">
                        Votos totales: {totalVotes}
                    </div>
                </div>
                <div className={"flex space-x-2"}>
                    {onEdit && poll.id != "unpublished" && <div>
                        <BaseIconButton
                            size={"small"}
                            onClick={() => {
                                setEditing(true)
                            }}
                        >
                            <WriteButtonIcon/>
                        </BaseIconButton>
                    </div>}
                    {onDelete && <div>
                        <BaseIconButton size={"small"} onClick={onDelete}>
                            <TrashIcon/>
                        </BaseIconButton>
                    </div>}
                </div>
            </div>

            <div className="space-y-3 flex flex-col">
                {choices.map((option, idx) => {
                    return <PollChoice
                        key={idx}
                        label={option.label}
                        votes={poll.votes[idx]}
                        totalVotes={totalVotes}
                        voted={selectedIndex == idx}
                        onSelect={() => onSelectOption(idx)}
                        disabled={onDelete != null}
                    />
                })}
            </div>

            {editing && <EditPollModal
                open={editing}
                initialPoll={{choices: poll.poll.choices.map(c => c.label), description: poll.poll.description}}
                onClose={() => {
                    setEditing(false)
                }}
                onSave={onSavePoll}
            />}
        </div>
    )
}