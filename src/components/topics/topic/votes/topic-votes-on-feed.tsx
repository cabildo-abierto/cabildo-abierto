import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api"
import {CheckIcon, XIcon} from "@phosphor-icons/react";
import {VoteEditButtons} from "@/components/topics/topic/votes/vote-edit-buttons";
import {Button} from "@/components/layout/utils/button";
import {useEffect, useState} from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {TopicVotesList} from "@/components/topics/topic/votes/topic-votes-list";
import {TopicHistoryPanel} from "@/components/topics/topic/view/topic-history-panel";
import { sum } from "@/utils/arrays";


function countVotes(status: ArCabildoabiertoWikiTopicVersion.TopicView["status"]) {
    const accepts = sum(status.voteCounts, c => c.accepts)
    const rejects = sum(status.voteCounts, c => c.rejects)

    return {accepts, rejects}
}


export const TopicVotesOnFeed = ({topic, setWritingReply}: {
    topic: ArCabildoabiertoWikiTopicVersion.TopicView,
    setWritingReply: (v: boolean) => void
}) => {
    const [votesPanelOpen, setVotesPanelOpen] = useState(false)
    const [openHistory, setOpenHistory] = useState(false)
    const accepted = topic.status.accepted
    const {accepts, rejects} = countVotes(topic.status)
    const isCurrent = !topic.currentVersion || topic.currentVersion == topic.uri

    useEffect(() => {
        if (accepts + rejects == 0 && votesPanelOpen) {
            setVotesPanelOpen(false)
        }
    }, [accepts, rejects])

    return <div className={"my-1 w-full"}>
        <div className={"px-3 space-y-1"}>
            <div className={"w-full flex justify-end"}>
            {accepted ? <div className={"flex items-center space-x-2 py-1 px-2"}>
                    <div className={"flex pb-[2px]"}>
                        <CheckIcon fontSize={18}/>
                    </div>
                    <div className={"text-sm font-light"}>
                        {isCurrent ? "Última versión aceptada" : "Versión aceptada (hay versiones más recientes)"}
                    </div>
                </div> :
                <div className={"flex items-center space-x-2 py-1 px-2"}>
                    {rejects > 0 && <div className={"flex"}>
                        <XIcon fontSize={20}/>
                    </div>}
                    <div className={"text-sm font-light"}>
                        {rejects > 0 ? "Versión rechazada" : "Versión pendiente de revisión"}
                    </div>
                </div>}
            </div>
            <div className={"flex justify-between"}>

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
                        {accepts + rejects > 0 && <div>
                            <Button
                                onClick={() => {
                                    setVotesPanelOpen(!votesPanelOpen)
                                }}
                                size={"small"}
                                color={"transparent"}
                                startIcon={!votesPanelOpen ? <KeyboardArrowDownIcon/> : <KeyboardArrowUpIcon/>}
                            >
                                <div className={"text-xs"}>
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
        </div>

        {votesPanelOpen && <TopicVotesList uri={topic.uri}/>}

        {openHistory && <TopicHistoryPanel
            topic={topic}
            onClose={() => {setOpenHistory(false)}}
        />}
    </div>
}