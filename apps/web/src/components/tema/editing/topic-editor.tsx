import {useEffect, useState} from "react";
import {EditorState, LexicalEditor} from "lexical";
import {useNavigationGuard} from "next-navigation-guard";
import {getEditorSettings} from "../../writing/settings";
import {PreventLeavePopup} from "../../utils/dialogs/prevent-leave-popup";
import {useTopicWithNormalizedContent} from "@/queries/getters/useTopic";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {getTopicTitle} from "../utils";
import {ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api";
import {useLayoutConfig} from "../../layout/main-layout/layout-config-context";
import {CAEditor} from "@/components/editor";


export const TopicEditor = ({
    topicId,
    props,
    setEditor,
    guardEnabled,
    setGuardEnabled
}: {
    props: ArCabildoabiertoWikiTopicVersion.TopicProp[]
    topicId: string
    setEditor: (e: LexicalEditor) => void
    guardEnabled: boolean
    setGuardEnabled: (v: boolean) => void
}) => {
    const {topic} = useTopicWithNormalizedContent(topicId)
    const [editorState, setEditorState] = useState<EditorState | null>()
    const {isMobile} = useLayoutConfig()
    const navGuard = useNavigationGuard({enabled: guardEnabled})
    const [initialEditorState, setInitialEditorState] = useState(null)

    useEffect(() => {
        if (editorState) {
            const state = JSON.stringify(editorState.toJSON())
            if (!initialEditorState) {
                setInitialEditorState(state)
            } else if (state != initialEditorState) {
                if (!guardEnabled) setGuardEnabled(true)
            } else {
                if (guardEnabled) setGuardEnabled(false)
            }
        }
    }, [editorState, initialEditorState])

    if(!topic || topic == "loading") {
        return <div className={"py-16"}>
            <LoadingSpinner/>
        </div>
    }

    return <div className={"mb-72"}>
        <CAEditor
            settings={getEditorSettings({
                isReadOnly: false,
                initialText: topic.text,
                initialTextFormat: topic.format,
                embeds: topic.embeds ?? [],
                allowComments: false,
                tableOfContents: true,
                showToolbar: true,
                isDraggableBlock: !isMobile,
                title: getTopicTitle({id: topic.id, props}),
                editorClassName: "relative article-content not-article-content mt-8 min-h-[300px]",
                placeholderClassName: "text-[var(--text-light)] absolute top-0",
                placeholder: "Agregá información sobre el tema...",
                topicMentions: false
            })}
            setEditor={setEditor}
            setEditorState={setEditorState}
        />
        <PreventLeavePopup navGuard={navGuard}/>
    </div>
}