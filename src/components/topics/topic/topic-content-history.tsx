import {EditHistory} from "./edit-history";
import {TopicProps} from "@/lib/definitions";


export const TopicContentHistory = ({
    topic
}: {
    topic: TopicProps
}) => {
    return <div className={"w-full mb-32"}>
        <EditHistory topic={topic}/>
    </div>
}