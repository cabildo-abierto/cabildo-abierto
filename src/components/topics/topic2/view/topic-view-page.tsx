import {useTopicWithNormalizedContent} from "@/queries/getters/useTopic";
import {useState} from "react";
import LoadingSpinner from "@/components/layout/utils/loading-spinner";
import {EditTopicButton} from "@/components/topics/topic2/view/edit-topic-button";
import {TopicPropsPanel} from "@/components/topics/topic2/view/topic-props-panel";
import {TopicHeader} from "@/components/topics/topic2/view/topic-header";
import {TopicContent} from "@/components/topics/topic2/view/topic-content";
import {TopicDiscussion} from "@/components/topics/topic2/view/topic-discussion";
import {useTopicPageParams} from "@/components/topics/topic/topic-page";
import {useLayoutConfig} from "@/components/layout/layout-config-context";


export const TopicViewPage = () => {
    const {did, rkey, topicId} = useTopicPageParams()
    const {topic} = useTopicWithNormalizedContent(topicId, did, rkey)
    const [pinnedReplies, setPinnedReplies] = useState<string[]>([])
    const {isMobile} = useLayoutConfig()

    if (!topic || topic == "loading") {
        return <div className={"py-8"}>
            <LoadingSpinner/>
        </div>
    }

    return <div className={"mt-8 space-y-8 pb-32 " + (isMobile ? "pt-6" : "")}>
        {!isMobile && <div className={"absolute top-14 right-2 z-[200] space-y-2 flex flex-col items-end"}>
            <EditTopicButton/>
            <TopicPropsPanel topic={topic}/>
        </div>}

        <div className={"max-[850px]:px-4 space-y-8"}>
            <TopicHeader topic={topic}/>

            <div className={"pb-16"}>
                <TopicContent
                    topic={topic}
                    pinnedReplies={pinnedReplies}
                    setPinnedReplies={setPinnedReplies}
                />
            </div>
        </div>

        <TopicDiscussion
            topic={topic}
            pinnedReplies={pinnedReplies}
            setPinnedReplies={setPinnedReplies}
        />
    </div>
}