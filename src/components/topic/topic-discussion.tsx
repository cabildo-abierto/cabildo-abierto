import {TopicProps} from "../../app/lib/definitions";
import {ReplyButton} from "../feed/reply-button";
import {useState} from "react";
import {TopicFeed} from "./topic-feed";
import {WritePanel} from "../write-panel";
import {ReplyToContent} from "../editor/plugins/CommentPlugin";
import {useLayoutConfig} from "../layout/layout-config-context";
import {getCollectionFromUri} from "../utils";
import {useSWRConfig} from "swr";

function topicPropsToReplyToContent(topic: TopicProps, version: number): ReplyToContent {
    return {
        ...topic.versions[version].content.record,
        collection: "ar.com.cabildoabierto.topic",
        content: {
            ...topic.versions[version].content,
            topicVersion: {
                topic: {
                    id: topic.id,
                    versions: topic.versions
                }
            }
        }
    }
}

export const TopicDiscussion = ({topic, version, onClickQuote, viewingContent}: {
    topic: TopicProps, version: number, onClickQuote: (cid: string) => void,
    viewingContent: boolean
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
        <div className={"w-full max-w-[600px] " + (viewingContent ? "border-t mt-20" : "")}>
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