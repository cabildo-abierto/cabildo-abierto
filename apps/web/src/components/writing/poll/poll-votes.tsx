import {useAPI} from "@/components/utils/react/queries";
import {BaseFullscreenPopup} from "@/components/utils/dialogs/base-fullscreen-popup";
import {useEffect, useState} from "react";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {ArCabildoabiertoEmbedPollVote} from "@cabildo-abierto/api";
import {ProfilePic} from "@/components/perfil/profile-pic";
import {usePoll} from "@/components/writing/poll/poll-from-id";
import {CloseButton} from "@/components/utils/base/close-button";


function usePollVotes(pollId: string) {
    return useAPI<ArCabildoabiertoEmbedPollVote.View[]>(`/poll-votes/${encodeURIComponent(pollId)}`, ["poll-votes", pollId])
}


const PollVotesModal = ({open, pollId, onClose}: {
    open: boolean
    pollId: string
    onClose: () => void
}) => {
    const {data, isLoading, refetch} = usePollVotes(pollId)
    const {data: poll} = usePoll(pollId)

    useEffect(() => {
        refetch()
    }, [poll])

    if (!poll) return null

    return <BaseFullscreenPopup open={open} closeButton={false}>
        <div className={"w-[400px] p-3 space-y-3"}>
            <div className={"flex justify-between"}>
                <h3>
                    Votos
                </h3>
                <div>
                    <CloseButton onClose={onClose}/>
                </div>
            </div>
            {poll.poll.description && <div>
                {poll.poll.description}
            </div>}
            {isLoading && <div className={"py-8"}>
                <LoadingSpinner/>
            </div>}
            {data && <div className={"space-y-2"}>
                {poll.poll.choices.map((c, j) => {
                    const votes = data.filter(v => v.choice == c.label)
                    if (votes.length == 0) return null
                    return <div key={j} className={""}>
                        <div className={"font-light text-[var(--text-light)] pb-2"}>
                            {c.label} ({votes.length})
                        </div>
                        <div className={"flex flex-wrap gap-1"}>
                            {votes.map((v, i) => {
                                return <div key={i}>
                                    <ProfilePic user={v.author} className={"rounded-full h-6 w-6"}/>
                                </div>
                            })}
                        </div>
                    </div>
                })}
            </div>}
        </div>
    </BaseFullscreenPopup>
}


export const PollVotes = ({pollId}: { pollId: string }) => {
    const [open, setOpen] = useState(false)

    return <>
        <div className={"flex justify-end"}>
            <button
                onClick={() => {
                    setOpen(true)
                }}
                className={"border py-0.5 px-1.5 text-sm text-[13px] hover:bg-[var(--background-dark2)] text-[var(--text-light)]"}
            >
                Ver votos
            </button>
        </div>
        <PollVotesModal
            pollId={pollId}
            open={open}
            onClose={() => {
                setOpen(false)
            }}
        />
    </>
}