import {BaseButton} from "@/components/utils/base/base-button";
import {BaseTextField} from "@/components/utils/base/base-text-field";
import {BaseTextArea} from "@/components/utils/base/base-text-area";
import {useEffect, useState} from "react";
import {areArraysEqual, sum, unique} from "@cabildo-abierto/utils";
import {Note} from "@/components/utils/base/note";
import {useTopicPageParams} from "@/components/tema/use-topic-page-params";
import {useAPI} from "@/components/utils/react/queries";
import {usePathname} from "next/navigation";
import {cn} from "@/lib/utils";
import {ArCabildoabiertoEmbedPoll} from "@cabildo-abierto/api";
import {BackButton} from "@/components/utils/base/back-button";
import {CloseButton} from "@/components/utils/base/close-button";
import {useIsMobile} from "@/components/utils/use-is-mobile";


export type PollEditState = {
    choices: string[]
    description: string
    votes?: number[]
}


function useTopicPolls(topicId?: string, did?: string, rkey?: string) {
    const url = topicId ?
        `/topic-polls?topicId=${encodeURIComponent(topicId)}` :
        `/topic-polls?did=${encodeURIComponent(did)}&rkey=${encodeURIComponent(rkey)}`
    return useAPI<ArCabildoabiertoEmbedPoll.View[]>(url, ["topic-polls", topicId, did, rkey])
}


const PreviousPollsButton = ({onClick}: { onClick: () => void }) => {
    const {topicId, did, rkey} = useTopicPageParams()
    const {data, isLoading} = useTopicPolls(topicId, did, rkey)

    if (isLoading) return <div/>
    if (data == null) return <div/>

    return <>
        <BaseButton
            size={"small"}
            className={"text-[var(--text-light)]"}
            onClick={onClick}
        >
            Encuestas anteriores ({data.length})
        </BaseButton>
    </>
}


const PreviousPolls = ({onBack, setPoll, poll, open}: {
    onBack: () => void
    setPoll: (s: PollEditState) => void
    poll: PollEditState
    open: boolean
}) => {
    const {topicId, did, rkey} = useTopicPageParams()
    const {isMobile} = useIsMobile()
    const {data, isLoading} = useTopicPolls(topicId, did, rkey)

    // Un poco hack: esto se asegura de mantener actualizada la cantidad de votos de la encuesta cuando se edita
    // Es un poco lento porque se ejecuta en cada cambio de poll y solo haría falta hacerlo al guardar.
    useEffect(() => {
        if (data) {
            const existingPoll = data
                .find(p => p.poll.description == poll.description && areArraysEqual(
                    p.poll.choices.map(c => c.label),
                    poll.choices.slice(0, poll.choices.length - 1)
                ))

            if (existingPoll && !areArraysEqual(existingPoll.votes, poll.votes)) {
                setPoll({...poll, votes: existingPoll.votes})
            } else if (!existingPoll && poll.votes != null) {
                setPoll({...poll, votes: undefined})
            }
        }
    }, [poll, data])

    if (isLoading) return <div/>
    if (data == null) return <div/>
    if (!open) return <div/>

    return <div>
        <div
            className={cn("space-y-2 flex flex-col", !isMobile ? "max-h-[60vh] overflow-y-auto custom-scrollbar" : "")}>
            {data.map(poll => {
                return <div
                    key={poll.key}
                    className={"w-full border p-2 hover:bg-[var(--background-dark)] cursor-pointer"}
                    onClick={() => {
                        setPoll({
                            description: poll.poll.description,
                            choices: poll.poll.choices.map(c => c.label),
                            votes: poll.votes
                        })
                        onBack()
                    }}
                >
                    <div className={"font-medium"}>
                        {poll.poll.description}
                    </div>
                    <div className={"text-[var(--text-light)]"}>
                        {poll.poll.choices.map(l => l.label).join(", ")}
                    </div>
                    <Note className={"text-left"}>
                        Votos totales: {sum(poll.votes, x => x)}
                    </Note>
                </div>
            })}
            <Note className={"text-left text-xs"}>
                Al insertar una encuesta que fue parte de este tema anteriormente los votos se preservan.
            </Note>
        </div>
    </div>
}


const NewPoll = ({poll, setPoll, onShowPreviousPolls, onSave}: {
    poll: PollEditState,
    setPoll: (p: PollEditState) => void
    onShowPreviousPolls: () => void
    onSave: () => void
}) => {
    const pathname = usePathname()
    const choices = poll.choices

    const inTopic = pathname.startsWith("/tema")

    useEffect(() => {
        if (poll.choices.length == 0) {
            setPoll({...poll, choices: [""]})
        } else if (poll.choices[poll.choices.length - 1].length > 0) {
            setPoll({...poll, choices: [...poll.choices, ""]})
        } else {
            for (let i = 0; i < poll.choices.length - 1; i++) {
                if (poll.choices[i].length == 0) {

                    setPoll({
                        ...poll,
                        choices: [
                            ...poll.choices.slice(0, i),
                            ...poll.choices.slice(i + 1),
                        ]
                    })
                }
            }
        }
    }, [poll])

    const validPoll = unique(poll.choices).length == poll.choices.length && poll.choices.length >= 3

    return <>
        <div className="space-y-1">
            <BaseTextArea
                value={poll.description}
                onChange={e => {
                    setPoll({...poll, description: e.target.value})
                }}
                placeholder={"Descripción..."}
            />
        </div>

        <div className="flex flex-col gap-2">
            {choices.map((option, idx) => {
                return (
                    <div
                        key={idx}
                        className={"space-y-1"}
                    >
                        <BaseTextField
                            size={"default"}
                            value={option}
                            placeholder={`Opción ${idx + 1}...`}
                            onChange={e => {
                                setPoll({
                                    ...poll,
                                    choices: [...choices.slice(0, idx), e.target.value, ...choices.slice(idx + 1)]
                                })
                            }}
                        />
                        {idx >= 1 && choices.slice(0, idx).some(c => c == option) &&
                            <Note className={"text-xs text-left px-0.5"}>
                                Esta opción está repetida.
                            </Note>}
                    </div>
                )
            })}
        </div>

        <div className={cn("flex", inTopic ? "justify-between" : "justify-end")}>
            {inTopic && <PreviousPollsButton
                onClick={onShowPreviousPolls}
            />}
            <BaseButton
                variant={"outlined"}
                size={"small"}
                disabled={!validPoll}
                onClick={onSave}
            >
                Guardar
            </BaseButton>
        </div>
    </>
}


export const EditPoll = ({poll, setPoll, onSave, onClose}: {
    poll: PollEditState
    setPoll: (s: PollEditState) => void
    onSave: () => void
    onClose: () => void
}) => {
    const [showingPreviousPolls, setShowingPreviousPolls] = useState(false)
    const {isMobile} = useIsMobile()

    return (
        <div className={cn("space-y-4", isMobile ? "" : "w-[400px]")}>
            <div className={"absolute bg-[var(--background)] py-2 px-3 top-0 left-0 w-full"}>
                <div className={"flex justify-between items-center py-1"}>
                    <div className={"flex space-x-1 items-center"}>
                        {showingPreviousPolls && <BackButton
                            size={"small"}
                            onClick={() => {
                                setShowingPreviousPolls(false)
                            }}
                        />}
                        <h3 className={"text-left"}>
                            {!showingPreviousPolls ? "Nueva encuesta" : "Encuestas anteriores"}
                        </h3>
                    </div>
                    <CloseButton onClose={onClose}/>
                </div>
            </div>
            <div className={cn("px-3 pt-10 max-h-screen space-y-4 overflow-y-auto custom-scrollbar", isMobile ? "pb-16" : "pb-3")}>
                {!showingPreviousPolls && <NewPoll
                    onSave={onSave}
                    onShowPreviousPolls={() => {
                        setShowingPreviousPolls(true)
                    }}
                    poll={poll}
                    setPoll={setPoll}
                />}
                <PreviousPolls
                    poll={poll}
                    setPoll={setPoll}
                    open={showingPreviousPolls}
                    onBack={() => {
                        setShowingPreviousPolls(false)
                    }}
                />
            </div>
        </div>
    )
}