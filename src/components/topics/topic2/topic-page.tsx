"use client"
import {TopicEditorPage} from "@/components/topics/topic2/editing/topic-editor-page";
import {TopicViewPage} from "@/components/topics/topic2/view/topic-view-page";
import {useTopicPageParams} from "@/components/topics/topic/topic-page";





export const TopicPage = () => {
    const {s} = useTopicPageParams()

    if(s == "editing") {
        return <TopicEditorPage/>
    } else {
        return <TopicViewPage/>
    }
}
