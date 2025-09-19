import {EditHistory} from "./history/edit-history";
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"

export const TopicContentHistory = ({
    topic
}: {
    topic: ArCabildoabiertoWikiTopicVersion.TopicView
}) => {
    return <div className={"w-full"}>
        <EditHistory topic={topic}/>
    </div>
}