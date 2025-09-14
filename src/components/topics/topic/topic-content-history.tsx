import {EditHistory} from "./history/edit-history";
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"

export const TopicContentHistory = ({
    topic
}: {
    topic: ArCabildoabiertoWikiTopicVersion.TopicView
}) => {
    return <div className={"w-full mb-32"}>
        <EditHistory topic={topic}/>
    </div>
}