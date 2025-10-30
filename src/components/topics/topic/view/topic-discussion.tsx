import {TopicView} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import React, {Dispatch, SetStateAction, useCallback, useState} from "react";
import {useSession} from "@/queries/getters/useSession";
import {GetFeedOutput} from "@/lib/types";
import {smoothScrollTo} from "@/components/layout/utils/scroll";
import {ArCabildoabiertoFeedDefs} from "@/lex-api";
import {TopicVotesOnFeed} from "@/components/topics/topic/votes/topic-votes-on-feed";
import {ReplyButton} from "@/components/thread/reply-button";
import WritePanel, {ReplyToContent} from "@/components/writing/write-panel/write-panel";
import {DiscussionButton} from "@/components/topics/topic/view/discussion-button";
import {useAPI} from "@/queries/utils";
import {LoadingFeed} from "@/components/feed/feed/loading-feed";
import FeedElement from "@/components/feed/feed/feed-element";
import {FeedEndText} from "@/components/feed/feed/feed-end-text";
import {getFeedElementKey} from "@/components/feed/feed/feed-view-content-feed";
import {splitUri} from "@/utils/uri";



function useTopicDiscussion(uri: string) {
    const {did, rkey} = splitUri(uri)
    return useAPI<GetFeedOutput<ArCabildoabiertoFeedDefs.FeedViewContent>>(
        `/topic-feed/discussion?did=${did}&rkey=${rkey}`, ["topic-discussion", uri]
    )
}



export const TopicDiscussion = ({
                                    topic,
                                    pinnedReplies,
                                    setPinnedReplies
                                }: {
    topic: TopicView
    pinnedReplies: string[]
    setPinnedReplies: Dispatch<SetStateAction<string[]>>
}) => {
    const {user} = useSession()
    const [writingReply, setWritingReply] = useState(false)
    let {data: discussion, isLoading: discussionLoading} = useTopicDiscussion(topic.uri)

    const onClickQuote = useCallback((cid: string) => {
        if (!pinnedReplies.includes(cid)) {
            setPinnedReplies([cid])
        }
        const elem = document.getElementById("selection:" + cid)
        if (elem) {
            smoothScrollTo(elem)
        }
    }, [pinnedReplies, setPinnedReplies])

    const replyToContent: ReplyToContent = {
        $type: "ar.cabildoabierto.wiki.topicVersion#topicView",
        ...topic
    }

    return <div className={"flex flex-col items-center"} id={"discusion"}>
        <div
            className={"w-full flex justify-end"}
        >
            <TopicVotesOnFeed
                topic={topic}
                setWritingReply={setWritingReply}
            />
        </div>
        <div className={"flex w-full"}>
            <ReplyButton
                text={"Responder"}
                size={"large"}
                onClick={() => {
                    setWritingReply(true)
                }}
            />
        </div>
        <div className={"max-w-[600px] w-full"}>
            {discussion && <div>
                {discussion.feed.filter(x => x != null).map((e, i) => {
                    const key = getFeedElementKey(e)
                    return <div key={key}>
                        <FeedElement
                            elem={e}
                            onClickQuote={onClickQuote}
                            pageRootUri={topic.uri}
                        />
                    </div>
                })}
                {discussion.feed.filter(x => x != null).length == 0 && <FeedEndText text={"Todavía no hay respuestas."}/>}
            </div>}
            {discussionLoading && <div>
                <LoadingFeed/>
            </div>}
        </div>
        {user && replyToContent && <WritePanel
            open={writingReply}
            onClose={() => {setWritingReply(false)}}
            replyTo={replyToContent}
        />}
        <DiscussionButton replyCount={topic.replyCount}/>
    </div>
}