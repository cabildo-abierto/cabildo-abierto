"use client"
import {useTopicFeed} from "../../hooks/contents";
import Feed from "../feed/feed";
import LoadingSpinner from "../loading-spinner";


export const TopicFeed = ({topicId, onClickQuote}: {topicId: string, onClickQuote: (cid: string) => void}) => {
    let {feed, isLoading} = useTopicFeed(topicId)

    if(isLoading) {
        return <LoadingSpinner/>
    }

    return <Feed
        feed={{isLoading: false, isError: false, feed: feed ? feed : []}}
        onClickQuote={onClickQuote}
    />
}