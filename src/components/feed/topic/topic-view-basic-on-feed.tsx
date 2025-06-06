import {TopicViewBasic} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {getTopicTitle} from "@/components/topics/topic/utils";
import {topicUrl} from "@/utils/uri";
import Link from "next/link";
import ReplyIcon from "@mui/icons-material/Reply";


export const TopicViewBasicOnFeed = ({topic, showingChildren}: { topic: TopicViewBasic, showingChildren: boolean }) => {

    if(showingChildren){
        return <Link href={topicUrl(topic.id)} className={"flex hover:bg-[var(--background-dark)]"}>
            <div className={"mt-1 flex justify-start mx-2 space-x-1 text-[var(--text-light)] px-4 py-2"}>
                <div className={"flex items-center space-x-1"}>
                    <ReplyIcon fontSize={"inherit"}/>
                    <div>
                    Respuesta al tema</div>
                </div>
                <div className={"text-[var(--primary)] hover:underline"}>
                    {getTopicTitle(topic)}
                </div>
            </div>
        </Link>
    } else {
        return <Link href={topicUrl(topic.id)}>
            <div className={"hover:bg-[var(--background-dark)] w-full text-[var(--text-light)] p-4 border-b"}>
                <span>Edición del tema</span> <span className={"text-[var(--primary)]"}>{getTopicTitle(topic)}</span>
            </div>
        </Link>
    }

}