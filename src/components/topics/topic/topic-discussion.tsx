import {useState} from "react";
import {TopicFeed} from "./topic-feed";
import {ReplyToContent} from "../../writing/write-panel/write-panel";
import dynamic from "next/dynamic";
import {useSession} from "@/queries/useSession";
import {WikiEditorState} from "@/lib/types";
const WritePanel = dynamic(() => import('@/components/writing/write-panel/write-panel'));
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"
import {useLoginModal} from "@/components/layout/login-modal-provider";


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
    const {setLoginModalOpen} = useLoginModal()
    const {user} = useSession()

    function onSetWritingReply(v) {
        if(!v || user) {
            setWritingReply(v)
        } else {
            setLoginModalOpen(true)
        }
    }

    return <div className={"w-full flex flex-col items-center mb-16 " + (wikiEditorState == "minimized" ? "" : "")}>
        <div className={"w-full"}>
            <div className={"w-full " + (wikiEditorState == "normal" ? "" : "")}>
                <TopicFeed
                    topic={topic}
                    onClickQuote={onClickQuote}
                    topicVersionUri={topicVersionUri}
                    wikiEditorState={wikiEditorState}
                    setWritingReply={onSetWritingReply}
                    replyToContent={replyToContent}
                />
            </div>
        </div>
        {user && replyToContent && <WritePanel
            open={writingReply}
            onClose={() => {setWritingReply(false)}}
            replyTo={replyToContent}
        />}
    </div>
}


export default TopicDiscussion