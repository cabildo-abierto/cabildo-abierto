import {EditHistory} from "./history/edit-history";
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"

export const TopicContentHistory = ({
    topic
}: {
    topic: ArCabildoabiertoWikiTopicVersion.TopicView
}) => {
    return <EditHistory topic={topic}/>
}