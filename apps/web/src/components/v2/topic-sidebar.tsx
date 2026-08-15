import {ArCabildoabiertoWikiTopicVersion, TopicDiscussionOutput} from "@cabildo-abierto/api"
import ThreadReplies from "@/components/feed/thread-replies";
import React from "react";
import {splitUri} from "@cabildo-abierto/utils";
import {useAPI} from "@/components/utils/react/queries";

function useTopicDiscussion(uri: string) {
    const {did, rkey} = splitUri(uri)
    return useAPI<TopicDiscussionOutput>(
        `/topic-discussion?did=${did}&rkey=${rkey}`, ["topic-discussion", uri]
    )
}

export const TopicSidebar = ({topic}: {
    topic: ArCabildoabiertoWikiTopicVersion.TopicView
}) => {
    let {data: discussion, isLoading: discussionLoading} = useTopicDiscussion(topic.uri)

    return <div className={"fixed top-0 right-0 pt-14"}>
        {discussion && <ThreadReplies
            parentRef={{uri: topic.uri, cid: topic.cid}}
            replies={discussion}
            onClickQuote={() => {}}
        />}
    </div>
}