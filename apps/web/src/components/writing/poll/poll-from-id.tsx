import {ArCabildoabiertoEmbedPoll, ArCabildoabiertoEmbedVisualization} from "@cabildo-abierto/api";
import {post} from "@/components/utils/react/fetch";
import {QueryClient, useQueryClient} from "@tanstack/react-query";
import {useErrors} from "@/components/layout/contexts/error-context";
import {produce} from "immer";
import {toast} from "sonner";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {useAPI} from "@/components/utils/react/queries";
import {Poll} from "@/components/writing/poll/poll";
import {$Typed} from "@atproto/api";
import {Note} from "@/components/utils/base/note";

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



export function usePoll(pollId: string) {
    return useAPI<ArCabildoabiertoEmbedPoll.View>(`/poll/${encodeURIComponent(pollId)}`, ["poll", pollId])
}

export const PollFromId = ({pollId, onDelete, onEdit}: {
    pollId: string
    onDelete?: () => void
    onEdit?: (v: $Typed<ArCabildoabiertoEmbedVisualization.Main> | $Typed<ArCabildoabiertoEmbedPoll.View>) => void
}) => {
    const {refetch, data: poll, isLoading} = usePoll(pollId)
    const {addError} = useErrors()
    const qc = useQueryClient()

    if(isLoading) {
        return <div className={"border p-3 rounded-2xl"}>
            <LoadingSpinner/>
        </div>
    }

    if(!poll) {
        return <div className={"border p-3 rounded-2xl"}>
            <Note>
                Ocurrió un error al cargar la encuesta.
            </Note>
        </div>
    }

    async function onSelectOption(idx: number) {
        const choices = poll.poll.choices
        const selectedIndex = poll.viewer?.choice ? choices.findIndex(c => c.label == poll.viewer.choice) : null

        if(selectedIndex == idx) {
            optimisticCancelPollVote(qc, pollId)
            const {error} = await post("/cancel-vote-poll/", {
                pollId
            })
            if(error) {
                addError(error)
            } else {
                toast("Se canceló tu voto.")
            }
        } else {
            optimisticAddPollVote(qc, pollId, idx)
            const {error} = await post("/vote-poll/", {
                pollId,
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

    return <Poll
        onSelectOption={onSelectOption}
        poll={poll}
        onDelete={onDelete}
        onEdit={onEdit}
    />
}