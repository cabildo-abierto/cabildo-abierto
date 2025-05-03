import {ReplyButton} from "../../thread/reply-button";
import {useState} from "react";
import {TopicFeed} from "./topic-feed";
import {ReplyToContent, WritePanel} from "../../writing/write-panel/write-panel";
import {WikiEditorState} from "./topic-content-expanded-view-header";



export const TopicDiscussion = ({
    replyToContent, topicId, onClickQuote, wikiEditorState
}: {
    topicId: string
    replyToContent?: ReplyToContent
    onClickQuote: (cid: string) => void
    wikiEditorState: WikiEditorState
}) => {
    const [writingReply, setWritingReply] = useState(false)

    return <div className="w-full flex flex-col items-center">
        {replyToContent != null && <div className={"w-full"}>
            <ReplyButton
                text={"Responder al contenido del tema"}
                onClick={() => {setWritingReply(true)}}
            />
        </div>}
        <div className={"w-full " + (wikiEditorState == "normal" ? "" : "")}>
            <TopicFeed
                topicId={topicId}
                onClickQuote={onClickQuote}
            />
        </div>
        {replyToContent && <WritePanel
            open={writingReply}
            onClose={() => {setWritingReply(false)}}
            replyTo={replyToContent}
            onSubmit={async () => {
                // TO DO await mutate("/api/topic/"+encodeURIComponent(topicId))
                // TO DO await mutate("/api/topic-feed/"+encodeURIComponent(topicId))
            }}
        />}
    </div>
}