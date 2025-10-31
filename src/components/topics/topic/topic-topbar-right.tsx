import {BaseButton} from "@/components/layout/base/baseButton";
import {usePathname, useRouter} from "next/navigation";
import {useTopicPageParams} from "@/components/topics/topic/use-topic-page-params";
import {TopicFeedConfig} from "@/components/topics/topic/feed/topic-feed-config";


export const TopicTopbarRight = () => {
    const {topicId} = useTopicPageParams()
    const router = useRouter()
    const pathname = usePathname()

    const inTopicPage = pathname.startsWith("/tema") && !pathname.startsWith("/tema/menciones")

    return <div className={""}>
        {inTopicPage && <BaseButton
            size={"small"}
            className={"max-w-40"}
            onClick={() => {router.push(`/tema/menciones?i=${topicId}`)}}
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