import {EditHistory} from "./edit-history";
import {TopicView} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";


export const TopicContentHistory = ({
    topic
}: {
    topic: TopicView
}) => {
    return <div className={"w-full mb-32"}>
        <EditHistory topic={topic}/>
    </div>
}