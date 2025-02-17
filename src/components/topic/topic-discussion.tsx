import {TopicProps} from "../../app/lib/definitions";
import {ReplyButton} from "../feed/reply-button";
import {useState} from "react";
import {TopicFeed} from "./topic-feed";
import {WritePanel} from "../write-panel";
import {ReplyToContent} from "../editor/plugins/CommentPlugin";
import {useLayoutConfig} from "../layout/layout-config-context";

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

export const TopicDiscussion = ({topic, version, onClickQuote}: {
    topic: TopicProps, version: number, onClickQuote: (cid: string) => void}) => {
    const [writingReply, setWritingReply] = useState(false)
    const {layoutConfig} = useLayoutConfig()

    return <div className="w-full flex flex-col items-center">
        <div className={"w-full"}><ReplyButton
            text={"Responder al tema"}
            onClick={() => {setWritingReply(true)}}
        /></div>
        <div className={"w-full max-w-[600px] " + (layoutConfig.distractionFree ? "border-l border-r" : "")}>
            <WritePanel open={writingReply} onClose={() => {setWritingReply(false)}} replyTo={topicPropsToReplyToContent(topic, version)}/>
            <TopicFeed
                topicId={topic.id}
                onClickQuote={onClickQuote}
            />
        </div>
    </div>
}