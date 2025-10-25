import {useTopicWithNormalizedContent} from "@/queries/getters/useTopic";
import {useState} from "react";
import LoadingSpinner from "@/components/layout/utils/loading-spinner";
import {EditTopicButton} from "@/components/topics/topic/view/edit-topic-button";
import {TopicPropsPanel} from "@/components/topics/topic/view/topic-props-panel";
import {TopicHeader} from "@/components/topics/topic/view/topic-header";
import {TopicContent} from "@/components/topics/topic/view/topic-content";
import {TopicDiscussion} from "@/components/topics/topic/view/topic-discussion";
import {useTopicPageParams} from "@/components/topics/topic/use-topic-page-params";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import TopicNotFoundPage from "@/components/topics/topic/topic-not-found-page";


export const TopicViewPage = () => {
    const {did, rkey, topicId} = useTopicPageParams()
    const {topic} = useTopicWithNormalizedContent(topicId, did, rkey)
    const [pinnedReplies, setPinnedReplies] = useState<string[]>([])
    const {isMobile} = useLayoutConfig()
    const {layoutConfig} = useLayoutConfig()

    if (topic == "loading") {
        return <div className={"py-8"}>
            <LoadingSpinner/>
        </div>
    } else if(!topic) {
        return <TopicNotFoundPage/>
    }

    return <div className={"mt-8 space-y-8 pb-32 " + (isMobile ? "pt-6" : "")}>
        <div className={"absolute top-14 right-2 z-[200] space-y-2 flex flex-col items-end"}>
            <EditTopicButton/>
            <TopicPropsPanel
                topic={topic}
            />
        </div>

        <div className={"space-y-8 " + (isMobile ? "px-4": (!layoutConfig.spaceForRightSide ? "pr-4 " : "") + (!layoutConfig.spaceForLeftSide ? "pl-4" : ""))}>
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