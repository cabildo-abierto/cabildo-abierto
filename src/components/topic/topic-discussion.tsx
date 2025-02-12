import {TopicProps} from "../../app/lib/definitions";
import {ReplyButton} from "../feed/reply-button";
import {useState} from "react";
import {TopicFeed} from "./topic-feed";
import {WritePanel} from "../write-panel";
import {ReplyToContent} from "../editor/plugins/CommentPlugin";

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

    return <div className="w-full flex justify-center">
        <div className={"w-full max-w-[600px]"}>
            <ReplyButton
                text={"Responder al tema"}
                onClick={() => {setWritingReply(true)}}
            />
            <WritePanel open={writingReply} onClose={() => {setWritingReply(false)}} replyTo={topicPropsToReplyToContent(topic, version)}/>
            <TopicFeed
                topicId={topic.id}
                onClickQuote={onClickQuote}
            />
        </div>
    </div>
}