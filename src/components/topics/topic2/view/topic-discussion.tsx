import {TopicView} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {Dispatch, SetStateAction, useMemo, useState} from "react";
import FeedViewContentFeed from "@/components/feed/feed/feed-view-content-feed";
import {useTopicFeedParams} from "@/components/topics/topic/use-topic-feed-params";
import {useSession} from "@/queries/getters/useSession";
import {get} from "@/utils/fetch";
import {GetFeedOutput} from "@/lib/types";
import {smoothScrollTo} from "@/components/layout/utils/scroll";
import {ArCabildoabiertoFeedDefs} from "@/lex-api";
import {TopicVotesOnFeed} from "@/components/topics/topic/history/topic-votes-on-feed";
import {ReplyButton} from "@/components/thread/reply-button";
import WritePanel, {ReplyToContent} from "@/components/writing/write-panel/write-panel";


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
    const {metric, time, format} = useTopicFeedParams(user)
    const [writingReply, setWritingReply] = useState(false)

    async function getDiscussionFeed(cursor: string) {
        return await get<GetFeedOutput<ArCabildoabiertoFeedDefs.FeedViewContent>>(`/topic-feed/discussion?i=${topic.id}${cursor ? `&cursor=${cursor}` : ""}`)
    }

    const onClickQuote = (cid: string) => {
        if (!pinnedReplies.includes(cid)) {
            setPinnedReplies([cid])
        }
        const elem = document.getElementById("selection:" + cid)
        if (elem) {
            smoothScrollTo(elem)
        }
    }

    const repliesFeed = useMemo(() => {
        return <FeedViewContentFeed
            queryKey={["topic-feed", topic.id, "replies"]}
            getFeed={getDiscussionFeed}
            onClickQuote={onClickQuote}
            noResultsText={"Todavía no hay respuestas."}
            endText={""}
            pageRootUri={topic.uri}
        />
    }, [metric, time, format, topic.uri])

    const replyToContent: ReplyToContent = {
        $type: "ar.cabildoabierto.wiki.topicVersion#topicView",
        ...topic
    }

    return <div className={"flex flex-col items-center"}>
        {repliesFeed && <div
            className={"w-full flex justify-end"}
        >
            <TopicVotesOnFeed
                topic={topic}
                setWritingReply={setWritingReply}
            />
        </div>}
        <div className={"flex w-full"}>
            <ReplyButton
                text={"Responder"}
                variant={"outlined"}
                size={"small"}
                onClick={() => {
                    setWritingReply(true)
                }}
            />
        </div>
        <div className={"max-w-[600px] w-full"}>
            {repliesFeed}
        </div>
        {user && replyToContent && <WritePanel
            open={writingReply}
            onClose={() => {setWritingReply(false)}}
            replyTo={replyToContent}
        />}
    </div>
}