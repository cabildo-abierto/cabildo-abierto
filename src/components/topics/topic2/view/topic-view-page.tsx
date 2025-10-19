import {useTopicWithNormalizedContent} from "@/queries/getters/useTopic";
import {useState} from "react";
import LoadingSpinner from "@/components/layout/utils/loading-spinner";
import {EditTopicButton} from "@/components/topics/topic2/view/edit-topic-button";
import {TopicPropsPanel} from "@/components/topics/topic2/view/topic-props-panel";
import {TopicHeader} from "@/components/topics/topic2/view/topic-header";
import {TopicContent} from "@/components/topics/topic2/view/topic-content";
import {TopicDiscussion} from "@/components/topics/topic2/view/topic-discussion";
import {useTopicPageParams} from "@/components/topics/topic/topic-page";


export const TopicViewPage = () => {
    const {did, rkey, topicId} = useTopicPageParams()
    const {topic} = useTopicWithNormalizedContent(topicId, did, rkey)
    const [pinnedReplies, setPinnedReplies] = useState<string[]>([])

    if(!topic || topic == "loading") {
        return <div className={"py-8"}>
            <LoadingSpinner/>
        </div>
    }

    return <div className={"mt-8 space-y-8 pb-32"}>
        <EditTopicButton/>
        <TopicPropsPanel topic={topic}/>

        <TopicHeader topic={topic}/>

        <div className={"pb-16"}>
            <TopicContent
                topic={topic}
                pinnedReplies={pinnedReplies}
                setPinnedReplies={setPinnedReplies}
            />
        </div>

        <TopicDiscussion
            topic={topic}
            pinnedReplies={pinnedReplies}
            setPinnedReplies={setPinnedReplies}
        />
    </div>
}