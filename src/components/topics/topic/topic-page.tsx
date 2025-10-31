"use client"
import {TopicEditorPage} from "@/components/topics/topic/editing/topic-editor-page";
import {TopicViewPage} from "@/components/topics/topic/view/topic-view-page";
import {useTopicPageParams} from "@/components/topics/topic/use-topic-page-params";





export const TopicPage = () => {
    const {s} = useTopicPageParams()

    if(s == "editing") {
        return <TopicEditorPage/>
    } else {
        return <TopicViewPage/>
    }
}
