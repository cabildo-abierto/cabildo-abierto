import {useTopicWithNormalizedContent} from "@/queries/getters/useTopic";
import LoadingSpinner from "@/components/layout/base/loading-spinner";
import {TopicEditor} from "@/components/topics/topic/editing/topic-editor";
import {useEffect, useState} from "react";
import {LexicalEditor} from "lexical";
import {TopicHeaderEditor} from "@/components/topics/topic/editing/topic-header-editor";
import {SaveEditButton} from "@/components/topics/topic/editing/save-edit-button";
import {TopicProp} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {TopicPropsEditingPanel} from "@/components/topics/topic/props/topic-props-editing-panel";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {useTopicPageParams} from "@/components/topics/topic/use-topic-page-params";
import {addDefaults} from "@/components/topics/topic/props/topic-prop-editor";


export const TopicEditorPage = () => {
    const {did, rkey, topicId} = useTopicPageParams()
    const {topic} = useTopicWithNormalizedContent(topicId, did, rkey)
    const [editor, setEditor] = useState<LexicalEditor | null>()
    const [props, setProps] = useState<TopicProp[] | null>()
    const {isMobile} = useLayoutConfig()
    const [guardEnabled, setGuardEnabled] = useState(false)

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

    return <div className={"mt-8 space-y-8 pb-32 " + (isMobile ? "pt-6" : "")}>
        <div className={"fixed top-14 right-2 z-[1200] space-y-2 flex flex-col items-end"}>
            <SaveEditButton
                topic={topic}
                editor={editor}
                props={props}
                setGuardEnabled={setGuardEnabled}
            />

            {props && <TopicPropsEditingPanel
                props={props}
                setProps={setProps}
                topic={topic}
            />}
        </div>

        <div className={"max-[850px]:px-4 space-y-8"}>

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
                    guardEnabled={guardEnabled}
                    setGuardEnabled={setGuardEnabled}
                />
            </div>
        </div>
    </div>
}