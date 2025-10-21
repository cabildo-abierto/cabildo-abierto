import {Button} from "@/components/layout/utils/button";
import {usePathname, useRouter} from "next/navigation";
import {useTopicPageParams} from "@/components/topics/topic/topic-page";
import {QuotesIcon} from "@phosphor-icons/react";


export const TopicTopbarRight = () => {
    const {topicId} = useTopicPageParams()
    const router = useRouter()
    const pathname = usePathname()

    const inTopicPage = pathname.startsWith("/tema") && !pathname.startsWith("/tema/menciones")

    return <div className={"pr-2"}>
        {inTopicPage && <Button
            size={"small"}
            variant={"text"}
            color={"transparent"}
            onClick={() => {router.push(`/tema/menciones?i=${topicId}`)}}
        >
            Ir al muro del tema
        </Button>}
        {!inTopicPage && <Button
            size={"small"}
            variant={"text"}
            color={"transparent"}
            onClick={() => {router.push(`/tema?i=${topicId}`)}}
        >
            Ir al tema
        </Button>}
    </div>
}