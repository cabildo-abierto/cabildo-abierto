"use client"
import {useTopicPageParams} from "./use-topic-page-params";
import {ContentContextProvider} from "@/components/layout/contexts/content-context";
import {ContentContextRef, getUri} from "@cabildo-abierto/utils";
import {NewTopicPage} from "@/components/tema/new-topic-page";



export const TopicPage = () => {
    const {topicId, did, rkey} = useTopicPageParams()

    const content: ContentContextRef = topicId ?
        {type: "topic", id: topicId} :
        {type: "uri", uri: getUri(did, "ar.cabildoabierto.wiki.topicVersion", rkey)}

    return <ContentContextProvider content={content}>
        {<NewTopicPage/>}
        {/*editing ? <TopicEditorPage/> : <TopicViewPage/>*/}
    </ContentContextProvider>
}
