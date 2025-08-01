import {ReplyButton} from "../../thread/reply-button";
import {useState} from "react";
import {TopicFeed} from "./topic-feed";
import {ReplyToContent} from "../../writing/write-panel/write-panel";
import dynamic from "next/dynamic";
import {useSession} from "@/queries/useSession";
import {WikiEditorState} from "@/lib/types";
const WritePanel = dynamic(() => import('@/components/writing/write-panel/write-panel'));



const TopicDiscussion = ({
    replyToContent, topicId, onClickQuote, wikiEditorState, topicVersionUri
}: {
    topicId: string
    topicVersionUri: string
    replyToContent?: ReplyToContent
    onClickQuote: (cid: string) => void
    wikiEditorState: WikiEditorState
}) => {
    const [writingReply, setWritingReply] = useState(false)
    const {user} = useSession()

    return <div className="w-full flex flex-col items-center mb-16">
        {replyToContent != null && <div className={"w-full"}>
            <ReplyButton
                text={"Responder en la discusión del tema"}
                onClick={() => {setWritingReply(true)}}
            />
        </div>}
        {user && <div className={"w-full border-t " + (wikiEditorState == "normal" ? "" : "")}>
            <TopicFeed
                topicId={topicId}
                onClickQuote={onClickQuote}
                topicVersionUri={topicVersionUri}
            />
        </div>}
        {user && replyToContent && <WritePanel
            open={writingReply}
            onClose={() => {setWritingReply(false)}}
            replyTo={replyToContent}
        />}
    </div>
}


export default TopicDiscussion