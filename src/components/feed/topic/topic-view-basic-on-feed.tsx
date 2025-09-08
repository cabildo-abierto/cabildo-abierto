import {TopicViewBasic} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion"
import {getTopicTitle} from "@/components/topics/topic/utils"
import {topicUrl} from "@/utils/uri"
import Link from "next/link"
import ReplyIcon from "@mui/icons-material/Reply"
import {useTopicFeedParams} from "@/components/topics/topic/topic-feed"
import {usePathname} from "next/navigation";
import {CustomLink} from "../../../../modules/ui-utils/src/custom-link";
import {useSession} from "@/queries/useSession";


export const TopicViewBasicOnFeed = ({topic, showingChildren}: { topic: TopicViewBasic, showingChildren: boolean }) => {
    const {user} = useSession()
    const {selected} = useTopicFeedParams(user)
    const pathname = usePathname()

    if(pathname.startsWith("/tema") && selected == "Respuestas"){
        return null
    }

    if (showingChildren) {
        return <CustomLink
            tag={"div"}
            href={topicUrl(topic.id)}
            className={"w-full hover:bg-[var(--background-dark)] text-sm text-[var(--text-light)] px-4 py-2"}
        >
            <ReplyIcon fontSize={"inherit"}/> <span>
                Respuesta al tema
            </span> <span className={"text-[var(--primary)] hover:underline"}>
                {getTopicTitle(topic)}
            </span>
        </CustomLink>
    } else {
        return <Link href={topicUrl(topic.id)}>
            <div className={"hover:bg-[var(--background-dark)] w-full text-[var(--text-light)] p-4 border-b"}>
                <span>Edición del tema</span> <span className={"text-[var(--primary)]"}>{getTopicTitle(topic)}</span>
            </div>
        </Link>
    }

}