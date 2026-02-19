import { ArCabildoabiertoFeedArticle, ArCabildoabiertoWikiTopicVersion } from "../client";
import {EmbedContext} from "./editor";


export type CreateTopicVersionProps = {
    id: string
    text?: string
    format?: string,
    props?: ArCabildoabiertoWikiTopicVersion.TopicProp[]
    message?: string,
    claimsAuthorship?: boolean
    embeds?: ArCabildoabiertoFeedArticle.ArticleEmbedView[]
    embedContexts?: EmbedContext[]
}


export type TopicForBatchEdit = {
    id: string
    props: ArCabildoabiertoWikiTopicVersion.TopicProp[]
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


export type DiffParams = {currentText: string, currentFormat: string, markdown: string, embeds: ArCabildoabiertoFeedArticle.ArticleEmbedView[]}
export type DiffOutput = {charsAdded: number, charsDeleted: number}
