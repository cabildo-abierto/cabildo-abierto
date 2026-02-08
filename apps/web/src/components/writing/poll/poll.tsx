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
import {QueryClient, useQueryClient} from "@tanstack/react-query";
import {usePoll} from "@/components/writing/poll/poll-from-main";
import {useErrors} from "@/components/layout/contexts/error-context";
import {produce} from "immer";
import {toast} from "sonner";


function optimisticCancelPollVote(qc: QueryClient, pollId: string) {
    qc.setQueryData(["poll", pollId], (oldPoll: ArCabildoabiertoEmbedPoll.View | null) => {
        if(!oldPoll) return oldPoll

        return produce(oldPoll, draft => {
            const curVote = draft.viewer?.choice
            if(!curVote) return
            const curVoteIdx = draft.poll.choices.findIndex(c => c.label == curVote)
            draft.votes = draft.votes.map(((v, i) => i == curVoteIdx ? v-1 : v))
            draft.viewer = {}
        })
    })
}


function optimisticAddPollVote(qc: QueryClient, pollId: string, idx: number) {
    qc.setQueryData(["poll", pollId], (oldPoll: ArCabildoabiertoEmbedPoll.View | null) => {
        if(!oldPoll) return oldPoll

        return produce(oldPoll, draft => {
            const curVote = draft.viewer?.choice
            if(curVote) {
                const curVoteIdx = draft.poll.choices.findIndex(c => c.label == curVote)
                draft.votes = draft.votes.map(((v, i) => i == curVoteIdx ? v-1 : v))
            }
            draft.votes = draft.votes.map(((v, i) => i == idx ? v+1 : v))
            draft.viewer = {
                choice: draft.poll.choices[idx].label,
                voteUri: "optimistic"
            }
        })
    })
}


export const Poll = ({poll, onDelete, activeEditor, onEdit}: {
    poll: ArCabildoabiertoEmbedPoll.View
    activeEditor?: LexicalEditor
    onDelete?: () => void
    onEdit?: (v: $Typed<ArCabildoabiertoEmbedPoll.View>) => void
}) => {
    const {refetch} = usePoll(poll.id)
    const [editing, setEditing] = useState(false)
    const choices = poll.poll.choices
    const selectedIndex = poll.viewer?.choice ? choices.findIndex(c => c.label == poll.viewer.choice) : null
    const {addError} = useErrors()
    const qc = useQueryClient()

    async function onSelectOption(idx: number) {
        if(selectedIndex == idx) {
            optimisticCancelPollVote(qc, poll.id)
            const {error} = await post("/cancel-vote-poll/", {
                pollId: poll.id
            })
            if(error) {
                addError(error)
            } else {
                toast("Se canceló tu voto.")
            }
        } else {
            optimisticAddPollVote(qc, poll.id, idx)
            const {error} = await post("/vote-poll/", {
                pollId: poll.id,
                choiceIdx: idx
            })
            if(error) {
                addError(error)
            } else {
                toast("Se guardó tu voto.")
                refetch()
            }
        }
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
                        {totalVotes > 0 ? `Votos totales: ${totalVotes}` : "Sé la primera persona en votar."}
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
                        disabled={onDelete != null || poll.viewer?.voteUri == "optimistic"}
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