import {useTopicWithNormalizedContent} from "@/queries/getters/useTopic";
import {useState} from "react";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {EditTopicButton} from "./edit-topic-button";
import {useTopicPageParams} from "../use-topic-page-params";
import {useLayoutConfig} from "../../layout/main-layout/layout-config-context";
import TopicNotFoundPage from "../topic-not-found-page";
import {cn} from "@/lib/utils";
import dynamic from "next/dynamic";

const TopicDiscussion = dynamic(() => import("./topic-discussion").then(mod => mod.TopicDiscussion), {
    ssr: false
})

const TopicContent = dynamic(() => import("./topic-content").then(mod => mod.TopicContent), {
    ssr: false
})

const TopicPropsPanel = dynamic(() => import("../props/topic-props-panel").then(mod => mod.TopicPropsPanel), {
    ssr: false
})

const TopicHeader = dynamic(() => import("./topic-header").then(mod => mod.TopicHeader), {
    ssr: false
})

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

    return <div
        className={cn("mt-8 space-y-8 pb-32", isMobile && "pt-6")}
    >
        <div
            className="absolute top-14 right-2 z-[200] space-y-2 flex flex-col items-end"
        >
            <EditTopicButton/>
            <TopicPropsPanel
                topic={topic}
            />
        </div>

        <div
            className={cn(
            "space-y-8",
                isMobile ? "px-4" : (!layoutConfig.spaceForRightSide ? "pr-4 " : ""), !layoutConfig.spaceForLeftSide && "pl-4")}
        >
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