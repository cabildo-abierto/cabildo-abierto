"use client"
import {TopicEditorPage} from "./editing/topic-editor-page";
import {TopicViewPage} from "./view/topic-view-page";
import {useTopicPageParams} from "./use-topic-page-params";





export const TopicPage = () => {
    const {editing} = useTopicPageParams()

    if(editing) {
        return <TopicEditorPage/>
    } else {
        return <TopicViewPage/>
    }
}
