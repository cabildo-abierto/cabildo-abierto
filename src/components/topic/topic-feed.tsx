"use client"
import {useTopicFeed} from "../../hooks/contents";
import Feed from "../feed/feed";


export const TopicFeed = ({topicId, onClickQuote}: {topicId: string, onClickQuote: (cid: string) => void}) => {
    let feed = useTopicFeed(topicId)

    return <Feed
        feed={feed}
        onClickQuote={onClickQuote}
    />
}