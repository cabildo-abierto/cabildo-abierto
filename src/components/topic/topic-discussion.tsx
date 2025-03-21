import {ReplyButton} from "../feed/reply-button";
import {useState} from "react";
import {TopicFeed} from "./topic-feed";
import {WritePanel} from "../writing/write-panel";
import {ReplyToContent} from "../editor/plugins/CommentPlugin";
import {useSWRConfig} from "swr";
import {WikiEditorState} from "./topic-content-expanded-view-header";


/*function topicPropsToReplyToContent(topic: TopicProps, version: number): ReplyToContent {
    return {
        ...topic.versions[version],
        collection: "ar.com.cabildoabierto.topic",
        content: {
            ...topic.versions[version].content,
            topicVersion: {
                topic: {
                    id: topic.id,
                    versions: topic.versions.map((v) => ({title: v.content.topicVersion.title}))
                }
            }
        }
    }
}*/

export const TopicDiscussion = ({
    replyToContent, topicId, onClickQuote, wikiEditorState
}: {
    topicId: string
    replyToContent?: ReplyToContent
    onClickQuote: (cid: string) => void
    wikiEditorState: WikiEditorState
}) => {
    const [writingReply, setWritingReply] = useState(false)
    const {mutate} = useSWRConfig()

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
                await mutate("/api/topic/"+encodeURIComponent(topicId))
                await mutate("/api/topic-feed/"+encodeURIComponent(topicId))
            }}
        />}
    </div>
}