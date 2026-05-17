import { ArCabildoabiertoWikiEmbed, ArCabildoabiertoWikiTopic } from "../client";
import {EmbedContext} from "./editor";


export type CreateTopicVersionProps = {
    id: string | null
    props?: ArCabildoabiertoWikiTopic.TopicProp[]
}


export type TopicForBatchEdit = {
    id: string
    props: ArCabildoabiertoWikiTopic.TopicProp[]
    propsToDelete: string[]
}


export type EditPropsParams = {
    topic: TopicForBatchEdit
    message: string
}


export type BatchEdit = {
    message: string
    topics: TopicForBatchEdit[]
}


export type DiffParams = {currentText: string, currentFormat: string, markdown: string, embeds: ArCabildoabiertoWikiEmbed.View[]}
export type DiffOutput = {charsAdded: number, charsDeleted: number}
