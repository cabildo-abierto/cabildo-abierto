import {ReplyButton} from "../../thread/reply-button";
import {useState} from "react";
import {TopicFeed} from "./topic-feed";
import {ReplyToContent} from "../../writing/write-panel/write-panel";
import dynamic from "next/dynamic";
import {useSession} from "@/queries/useSession";
import {WikiEditorState} from "@/lib/types";
const WritePanel = dynamic(() => import('@/components/writing/write-panel/write-panel'));
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"


const TopicDiscussion = ({
    replyToContent, topic, onClickQuote, wikiEditorState, topicVersionUri
}: {
    topic: ArCabildoabiertoWikiTopicVersion.TopicView
    topicVersionUri: string
    replyToContent?: ReplyToContent
    onClickQuote: (cid: string) => void
    wikiEditorState: WikiEditorState
}) => {
    const [writingReply, setWritingReply] = useState(false)
    const {user} = useSession()

    return <div className={"w-full flex flex-col items-center mb-16" + (wikiEditorState == "minimized" ? "" : "pt-16")}>
        <div className={"w-full max-w-[600px]"}>
            {replyToContent != null && <div className={"w-full"}>
                <ReplyButton
                    text={"Responder"}
                    onClick={() => {setWritingReply(true)}}
                />
            </div>}
            {user && <div className={"w-full border-t " + (wikiEditorState == "normal" ? "" : "")}>
                <TopicFeed
                    topic={topic}
                    onClickQuote={onClickQuote}
                    topicVersionUri={topicVersionUri}
                />
            </div>}
        </div>
        {user && replyToContent && <WritePanel
            open={writingReply}
            onClose={() => {setWritingReply(false)}}
            replyTo={replyToContent}
        />}
    </div>
}


export default TopicDiscussion