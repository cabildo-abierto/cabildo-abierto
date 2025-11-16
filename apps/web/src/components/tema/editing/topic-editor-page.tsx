import {useTopicWithNormalizedContent} from "@/queries/getters/useTopic";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {TopicEditor} from "./topic-editor";
import {useEffect, useState} from "react";
import {LexicalEditor} from "lexical";
import {TopicHeaderEditor} from "./topic-header-editor";
import {SaveEditButton} from "./save-edit-button";
import {ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api";
import {TopicPropsEditingPanel} from "../props/topic-props-editing-panel";
import {useLayoutConfig} from "../../layout/main-layout/layout-config-context";
import {useTopicPageParams} from "../use-topic-page-params";
import {addDefaults} from "../props/topic-prop-editor";


export const TopicEditorPage = () => {
    const {did, rkey, topicId} = useTopicPageParams()
    const {topic} = useTopicWithNormalizedContent(topicId, did, rkey)
    const [editor, setEditor] = useState<LexicalEditor | null>()
    const [props, setProps] = useState<ArCabildoabiertoWikiTopicVersion.TopicProp[] | null>()
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
        <div className={"fixed top-14 right-2 z-[200] space-y-2 flex flex-col items-end"}>
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