import {useTopicWithNormalizedContent} from "@/queries/getters/useTopic";
import {getTopicTitle} from "@/components/topics/topic/utils";
import {BackButton} from "@/components/layout/utils/back-button";
import {useTopicPageParams} from "@/components/topics/topic/use-topic-page-params";


export const TopbarTopicFeed = () => {
    const {topicId, did, rkey} = useTopicPageParams()
    const {topic} = useTopicWithNormalizedContent(topicId, did, rkey)

    return <div className={"flex items-center space-x-2"}>
        <BackButton behavior={"ca-back"}/>
        {topic && topic != "loading" && <div className={"font-bold text-lg"}>
            {getTopicTitle(topic)}
        </div>}
    </div>
}