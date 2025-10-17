import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api"
import {CheckIcon, XIcon} from "@phosphor-icons/react";
import {VoteEditButtons} from "@/components/topics/topic/history/vote-edit-buttons";
import {ReplyButton} from "@/components/thread/reply-button";
import {Button} from "@/components/layout/utils/button";
import {useState} from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {TopicVotesList} from "@/components/topics/topic/topic-votes-list";

export const TopicVotesOnFeed = ({topic, setWritingReply}: {
    topic: ArCabildoabiertoWikiTopicVersion.TopicView,
    setWritingReply: (v: boolean) => void
}) => {
    const [votesPanelOpen, setVotesPanelOpen] = useState(false)
    const accepts = topic.status.voteCounts[0].accepts
    const rejects = topic.status.voteCounts[0].rejects
    const accepted = topic.status.accepted
    const isCurrent = !topic.currentVersion || topic.currentVersion == topic.uri

    return <div className={""}>
        <div className={"flex bg-[var(--background-dark)] mt-2 space-x-2 pl-3 p-2 items-center border-[var(--accent-dark)]"}>
            {accepted ? <div className={"flex flex-grow items-center space-x-2 py-1 px-2"}>
                    <div className={"flex pb-[2px]"}>
                        <CheckIcon fontSize={18}/>
                    </div>
                    <div className={"text-sm  font-light"}>
                        Versión aceptada{isCurrent ? "" : " (hay versiones más recientes)"}.
                    </div>
                </div> :
                <div className={"flex flex-grow space-x-2 py-1 px-2"}>
                    <div className={"flex"}>
                        <XIcon fontSize={20} weight={"bold"}/>
                    </div>
                    <div className={"text-sm  font-light"}>
                        Versión rechazada{isCurrent ? "" : " (hay versiones más recientes)"}.
                    </div>
                </div>}
            {accepts + rejects > 0 && <div>
                <Button
                    size={"small"}
                    color={"background-dark"}
                    startIcon={!votesPanelOpen ? <KeyboardArrowDownIcon/> : <KeyboardArrowUpIcon/>}
                >
                    <div className={"text-xs"} onClick={() => {setVotesPanelOpen(!votesPanelOpen)}}>
                        Ver votos
                    </div>
                </Button>
            </div>}
            <div>
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

        {votesPanelOpen && <TopicVotesList uri={topic.uri}/>}
        <div className={"flex justify-end my-2"}>
            <ReplyButton
                text={"Responder"}
                fullWidth={false}
                onClick={() => {
                    setWritingReply(true)
                }}
            />
        </div>
    </div>
}