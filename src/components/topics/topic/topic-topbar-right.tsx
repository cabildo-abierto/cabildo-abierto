import {Button} from "@/components/layout/utils/button";
import {usePathname, useRouter} from "next/navigation";
import {useTopicPageParams} from "@/components/topics/topic/use-topic-page-params";
import {TopicFeedConfig} from "@/components/topics/topic/feed/topic-feed-config";


export const TopicTopbarRight = () => {
    const {topicId} = useTopicPageParams()
    const router = useRouter()
    const pathname = usePathname()

    const inTopicPage = pathname.startsWith("/tema") && !pathname.startsWith("/tema/menciones")

    return <div className={""}>
        {inTopicPage && <Button
            size={"small"}
            variant={"text"}
            color={"transparent"}
            onClick={() => {router.push(`/tema/menciones?i=${topicId}`)}}
        >
            <div className={"w-40"}>Ir al muro del tema</div>
        </Button>}
        {!inTopicPage && <div className={"flex items-center space-x-1"}>
            <TopicFeedConfig selected={"Menciones"}/>
            <Button
                size={"small"}
                variant={"text"}
                color={"transparent"}
                onClick={() => {router.push(`/tema?i=${topicId}`)}}
            >
                <span className={""}>Ir al tema</span>
            </Button>
        </div>}
    </div>
}