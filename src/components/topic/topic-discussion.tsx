import {TopicProps} from "../../app/lib/definitions";
import {ReplyButton} from "../feed/reply-button";
import {useState} from "react";
import {TopicFeed} from "./topic-feed";
import {WritePanel} from "../writing/write-panel";
import {ReplyToContent} from "../editor/plugins/CommentPlugin";
import {useSWRConfig} from "swr";
import {WikiEditorState} from "./topic-content-expanded-view-header";

function topicPropsToReplyToContent(topic: TopicProps, version: number): ReplyToContent {
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
}

export const TopicDiscussion = ({
    topic, version, onClickQuote, wikiEditorState
}: {
    topic: TopicProps
    version: number
    onClickQuote: (cid: string) => void
    wikiEditorState: WikiEditorState
}) => {
    const [writingReply, setWritingReply] = useState(false)
    const {mutate} = useSWRConfig()


    return <div className="w-full flex flex-col items-center">
        <div className={"w-full"}>
            <ReplyButton
                text={"Responder al tema"}
                onClick={() => {setWritingReply(true)}}
            />
        </div>
        <div className={"w-full max-w-[600px] " + (wikiEditorState == "normal" ? "border-t mt-20" : "")}>
            <TopicFeed
                topicId={topic.id}
                onClickQuote={onClickQuote}
            />
        </div>
        <WritePanel
            open={writingReply}
            onClose={() => {setWritingReply(false)}}
            replyTo={topicPropsToReplyToContent(topic, version)}
            onSubmit={async () => {
                await mutate("/api/topic/"+encodeURIComponent(topic.id))
                await mutate("/api/topic-feed/"+encodeURIComponent(topic.id))
            }}
        />
    </div>
}