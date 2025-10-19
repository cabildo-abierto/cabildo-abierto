import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api"
import {CheckIcon, XIcon} from "@phosphor-icons/react";
import {VoteEditButtons} from "@/components/topics/topic/history/vote-edit-buttons";
import {Button} from "@/components/layout/utils/button";
import {useEffect, useState} from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {TopicVotesList} from "@/components/topics/topic/topic-votes-list";
import {TopicHistoryPanel} from "@/components/topics/topic2/view/topic-history-panel";

export const TopicVotesOnFeed = ({topic, setWritingReply}: {
    topic: ArCabildoabiertoWikiTopicVersion.TopicView,
    setWritingReply: (v: boolean) => void
}) => {
    const [votesPanelOpen, setVotesPanelOpen] = useState(false)
    const [openHistory, setOpenHistory] = useState(false)
    const accepts = topic.status.voteCounts[0].accepts
    const rejects = topic.status.voteCounts[0].rejects
    const accepted = topic.status.accepted
    const isCurrent = !topic.currentVersion || topic.currentVersion == topic.uri

    useEffect(() => {
        if (accepts + rejects == 0 && votesPanelOpen) {
            setVotesPanelOpen(false)
        }
    }, [accepts, rejects])

    return <div className={"my-1 w-full"}>
        <div className={"flex justify-between pl-3"}>
            <Button
                size={"small"}
                variant={"text"}
                color={"transparent"}
                onClick={() => {
                    setOpenHistory(true)
                }}
            >
                <div className={"text-xs"}>
                    Historial de versiones
                </div>
            </Button>
            <div className={"flex space-x-2 justify-between items-center border-[var(--accent-dark)]"}>
                <div className={"flex space-x-2 items-center"}>
                    {accepted ? <div className={"flex items-center space-x-2 py-1 px-2"}>
                            <div className={"flex pb-[2px]"}>
                                <CheckIcon fontSize={18}/>
                            </div>
                            <div className={"text-sm  font-light"}>
                                {isCurrent ? "Última versión aceptada" : "Versión aceptada (hay versiones más recientes)"}
                            </div>
                        </div> :
                        <div className={"flex flex-grow space-x-2 py-1 px-2"}>
                            <div className={"flex"}>
                                <XIcon fontSize={20} weight={"bold"}/>
                            </div>
                            <div className={"text-sm  font-light"}>
                                {rejects > 0 ? "Versión rechazada" : "Versión pendiente de revisión"}
                            </div>
                        </div>}
                    {accepts + rejects > 0 && <div>
                        <Button
                            size={"small"}
                            color={"transparent"}
                            startIcon={!votesPanelOpen ? <KeyboardArrowDownIcon/> : <KeyboardArrowUpIcon/>}
                        >
                            <div className={"text-xs"} onClick={() => {
                                setVotesPanelOpen(!votesPanelOpen)
                            }}>
                                Ver votos
                            </div>
                        </Button>
                    </div>}
                    <VoteEditButtons
                        topicId={topic.id}
                        versionRef={topic}
                        acceptCount={accepts}
                        rejectCount={rejects}
                        acceptUri={topic.viewer?.accept}
                        rejectUri={topic.viewer?.reject}
                    />
                </div>
            </div>
        </div>

        {votesPanelOpen && <TopicVotesList uri={topic.uri}/>}

        {openHistory && <TopicHistoryPanel
            topic={topic}
            onClose={() => {setOpenHistory(false)}}
        />}
    </div>
}