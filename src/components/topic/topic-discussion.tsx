import { smoothScrollTo } from "../editor/plugins/TableOfContentsPlugin"
import {TopicProps} from "../../app/lib/definitions";
import {ReplyButton} from "../feed/reply-button";
import {useState} from "react";
import {TopicFeed} from "./topic-feed";
import {WritePanel} from "../write-panel";



export const TopicDiscussion = ({topic, version, onClickQuote}: {
    topic: TopicProps, version: number, onClickQuote: (cid: string) => void}) => {
    const content = topic.versions[version]
    const [writingReply, setWritingReply] = useState(false)


    return <div className="w-full flex justify-center">
        <div className={"w-full max-w-[600px]"}>
            <ReplyButton
                text={"Responder al tema"}
                onClick={() => {setWritingReply(true)}}
            />
            <WritePanel open={writingReply} onClose={() => {setWritingReply(false)}} replyToTopic={content}/>
            <TopicFeed
                topicId={topic.id}
                onClickQuote={onClickQuote}
            />
        </div>
    </div>
}