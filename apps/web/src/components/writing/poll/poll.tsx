import {ArCabildoabiertoEmbedPoll} from "@cabildo-abierto/api";
import {$Typed} from "@atproto/api";
import {PollEditState} from "@/components/writing/poll/edit-poll";
import {sum} from "@cabildo-abierto/utils";
import {pollEditStateToFirstView} from "@/components/writing/poll/poll-edit-to-first-view";
import {useState} from "react";
import {BaseIconButton} from "@/components/utils/base/base-icon-button";
import {WriteButtonIcon} from "@/components/utils/icons/write-button-icon";
import {PollChoice} from "@/components/writing/poll/poll-choice";
import { TrashIcon } from "@phosphor-icons/react";
import {EditPollModal} from "@/components/editor/insert-poll-modal";
import {PollVotes} from "@/components/writing/poll/poll-votes";


export const Poll = ({onDelete, onSelectOption, onEdit, poll, pollId}: {
    onDelete?: () => void
    onEdit?: (v: $Typed<ArCabildoabiertoEmbedPoll.View>) => void
    poll: ArCabildoabiertoEmbedPoll.View
    onSelectOption?: (idx: number) => void
    pollId?: string
}) => {
    const [editing, setEditing] = useState(false)
    const choices = poll.poll.choices
    const selectedIndex = poll.viewer?.choice ? choices.findIndex(c => c.label == poll.viewer.choice) : null

    const totalVotes = sum(poll.votes, x => x)

    function onSavePoll(newPoll: PollEditState) {
        onEdit(pollEditStateToFirstView(newPoll))
        setEditing(false)
    }

    return (
        <div
            className="my-2 w-full border bg-[var(--background-dark)] portal group p-4 shadow-sm space-y-4"
        >
            <div className={"flex justify-between items-start"}>
                <div className="space-y-1">
                    <div className="text-base font-semibold">
                        {poll.poll.description}
                    </div>
                    <div className="text-xs text-[var(--text-light)]">
                        {totalVotes > 0 ? `Votos totales: ${totalVotes}` : "Sé la primera persona en votar."}
                    </div>
                </div>
                <div className={"flex space-x-2"}>
                    {onEdit && poll.key == "unpublished" && <div>
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
                    {pollId && <div className={"w-20"}>
                        <PollVotes
                        pollId={pollId}
                        />
                    </div>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {choices.map((option, idx) => {
                    return <PollChoice
                        key={idx}
                        label={option.label}
                        votes={poll.votes[idx]}
                        totalVotes={totalVotes}
                        voted={selectedIndex == idx}
                        onSelect={onSelectOption ? (() => onSelectOption(idx)) : undefined}
                        disabled={onSelectOption == null || onDelete != null || poll.viewer?.voteUri == "optimistic"}
                    />
                })}
            </div>

            {editing && <EditPollModal
                open={editing}
                initialPoll={{choices: poll.poll.choices.map(c => c.label), description: poll.poll.description, votes: poll.votes}}
                onClose={() => {
                    setEditing(false)
                }}
                onSave={onSavePoll}
            />}
        </div>
    )
}