import {EditHistory} from "./edit-history";
import {TopicProps} from "@/lib/types";


export const TopicContentHistory = ({
    topic
}: {
    topic: TopicProps
}) => {
    return <div className={"w-full mb-32"}>
        <EditHistory topic={topic}/>
    </div>
}