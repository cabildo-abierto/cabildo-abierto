import {useTopicWithNormalizedContent} from "@/queries/getters/useTopic";
import {getTopicTitle} from "../utils";
import {BackButton} from "@/components/utils/base/back-button";
import {useTopicPageParams} from "../use-topic-page-params";
import {useLayoutConfig} from "../../layout/main-layout/layout-config-context";


export const TopbarTopicFeed = () => {
    const {topicId, did, rkey} = useTopicPageParams()
    const {topic} = useTopicWithNormalizedContent(topicId, did, rkey)
    const {isMobile} = useLayoutConfig()

    return <div className={"flex items-center space-x-2 " + (isMobile ? "w-full" : "max-w-[80%]")}>
        {!isMobile && <BackButton behavior={"ca-back"}/>}
        {topic && topic != "loading" && <div className={"font-bold text-lg truncate text-ellipsis"}>
            {getTopicTitle(topic)}
        </div>}
    </div>
}