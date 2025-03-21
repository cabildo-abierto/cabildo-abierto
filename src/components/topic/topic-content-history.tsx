import {EditHistory} from "./edit-history";
import {TopicProps} from "../../app/lib/definitions";


export const TopicContentHistory = ({
    topic
}: {
    topic: TopicProps
}) => {
    return <div className={"w-full mb-32"}>
        <EditHistory topic={topic}/>
    </div>
}