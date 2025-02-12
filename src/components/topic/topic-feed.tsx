"use client"
import {useTopicFeed} from "../../hooks/contents";
import Feed from "../feed/feed";
import LoadingSpinner from "../loading-spinner";


export const TopicFeed = ({topicId, onClickQuote}: {topicId: string, onClickQuote: (cid: string) => void}) => {
    let feed = useTopicFeed(topicId)

    return <Feed
        feed={feed}
        onClickQuote={onClickQuote}
    />
}