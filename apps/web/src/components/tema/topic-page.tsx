"use client"
import {TopicEditorPage} from "./editing/topic-editor-page";
import {TopicViewPage} from "./view/topic-view-page";
import {useTopicPageParams} from "./use-topic-page-params";
import {ContentContextProvider} from "@/components/layout/contexts/content-context";
import {ContentContextRef, getUri} from "@cabildo-abierto/utils";



export const TopicPage = () => {
    const {editing, topicId, did, rkey} = useTopicPageParams()

    const content: ContentContextRef = topicId ?
        {type: "topic", id: topicId} :
        {type: "uri", uri: getUri(did, "ar.cabildoabierto.wiki.topicVersion", rkey)}

    return <ContentContextProvider content={content}>
        {editing ? <TopicEditorPage/> : <TopicViewPage/>}
    </ContentContextProvider>
}
