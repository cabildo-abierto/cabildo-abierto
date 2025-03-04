import {EditHistory} from "./edit-history";
import {TopicProps} from "../../app/lib/definitions";


export const TopicContentHistory = ({
    topic
}: {
    topic: TopicProps
}) => {
    return <div className={"w-full mb-32 mt-8"}>
        <h3>
            Historial de ediciones
        </h3>
        <div className={"mt-4"}>
            <EditHistory topic={topic}/>
        </div>
    </div>
}