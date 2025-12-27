import {BaseButton} from "@/components/utils/base/base-button";
import {usePathname, useRouter} from "next/navigation";
import {useTopicPageParams} from "./use-topic-page-params";
import {TopicFeedConfig} from "./feed/topic-feed-config";
import {useMainPageFeeds} from "@/components/feed/config/main-page-feeds-context";
import {useTopicTitle} from "@/queries/getters/useTopic";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";


export const TopicTopbarRight = () => {
    const {topicId} = useTopicPageParams()
    const router = useRouter()
    const pathname = usePathname()
    const {addFeed, select, openFeeds} = useMainPageFeeds()
    const {data, isLoading} = useTopicTitle(topicId)

    const inTopicPage = pathname.startsWith("/tema") && !pathname.startsWith("/tema/menciones")

    return <div className={""}>
        {inTopicPage && isLoading && <div>
            <LoadingSpinner/>
        </div>}
        {inTopicPage && data?.title && <BaseButton
            size={"small"}
            className={"max-w-40"}
            onClick={() => {
                if(!openFeeds.tabs.find(t => t.config.type == "topic" && t.config.subtype == "mentions" && t.config.id == topicId)) {
                    console.log("did not find it")
                    addFeed({
                        type: "topic",
                        subtype: "mentions",
                        id: topicId,
                        title: data?.title
                    })
                    router.push("/inicio")
                } else {
                    console.log("found it")
                    select(openFeeds.tabs.findIndex(t => t.config.type == "topic" && t.config.subtype == "mentions" && t.config.id == topicId), true)
                }
            }}
        >
            Ir al muro del tema
        </BaseButton>}
        {!inTopicPage && <div className={"flex items-center space-x-1"}>
            <TopicFeedConfig selected={"Menciones"}/>
            <BaseButton
                className={"max-w-20"}
                size={"small"}
                onClick={() => {router.push(`/tema?i=${topicId}`)}}
            >
                Ir al tema
            </BaseButton>
        </div>}
    </div>
}