"use client"
import {TopicEditorPage} from "./editing/topic-editor-page";
import {TopicViewPage} from "./view/topic-view-page";
import {useTopicPageParams} from "./use-topic-page-params";





export const TopicPage = () => {
    const {s} = useTopicPageParams()

    if(s == "editing") {
        return <TopicEditorPage/>
    } else {
        return <TopicViewPage/>
    }
}
