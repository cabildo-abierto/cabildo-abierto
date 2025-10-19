import {useTopicPageParams} from "@/components/topics/topic/topic-page";
import {useTopicWithNormalizedContent} from "@/queries/getters/useTopic";
import LoadingSpinner from "@/components/layout/utils/loading-spinner";
import {TopicEditor} from "@/components/topics/topic2/editing/topic-editor";
import {useEffect, useState} from "react";
import {LexicalEditor} from "lexical";
import {TopicHeaderEditor} from "@/components/topics/topic2/editing/topic-header-editor";
import {SaveEditButton} from "@/components/topics/topic2/editing/save-edit-button";
import {TopicProp} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {addDefaults} from "@/components/topics/topic/topic-props-editor";
import {TopicPropsEditingPanel} from "@/components/topics/topic2/editing/topic-props-editing-panel";


export const TopicEditorPage = () => {
    const {did, rkey, topicId} = useTopicPageParams()
    const {topic} = useTopicWithNormalizedContent(topicId, did, rkey)
    const [editor, setEditor] = useState<LexicalEditor | null>()
    const [props, setProps] = useState<TopicProp[] | null>()

    useEffect(() => {
        if(topic && topic != "loading") {
            setProps(addDefaults(topic.props, topic.id))
        }
    }, [topic])

    if(!topic || topic == "loading") {
        return <div className={"py-8"}>
            <LoadingSpinner/>
        </div>
    }

    return <div className={"mt-8 space-y-8 pb-32"}>
        <SaveEditButton topic={topic} editor={editor} props={props}/>
        {props && <TopicPropsEditingPanel
            props={props}
            setProps={setProps}
            topic={topic}
        />}

        {props && <TopicHeaderEditor
            topicId={topic.id}
            props={props}
            setProps={setProps}
        />}

        <div className={"pb-16"}>
            <TopicEditor
                topicId={topic.id}
                props={props}
                setEditor={setEditor}
            />
        </div>
    </div>
}