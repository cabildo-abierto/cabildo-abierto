import {useEffect, useState} from "react";
import {EditorState, LexicalEditor} from "lexical";
import {useNavigationGuard} from "next-navigation-guard";
import {getEditorSettings} from "@/components/writing/settings";
import {PreventLeavePopup} from "@/components/layout/prevent-leave-popup";
import {useTopicWithNormalizedContent} from "@/queries/getters/useTopic";
import dynamic from "next/dynamic";
import LoadingSpinner from "@/components/layout/utils/loading-spinner";
import {getTopicTitle} from "@/components/topics/topic/utils";
import {TopicProp} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
const MyLexicalEditor = dynamic(() => import( '../../../../../modules/ca-lexical-editor/src/lexical-editor' ), {ssr: false});


export const TopicEditor = ({
                                topicId,
    props,
    setEditor
}: {
    props: TopicProp[]
    topicId: string
    setEditor: (e: LexicalEditor) => void
}) => {
    const {topic} = useTopicWithNormalizedContent(topicId)
    const [editorState, setEditorState] = useState<EditorState | null>()
    const [guardEnabled, setGuardEnabled] = useState(false)
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
        <MyLexicalEditor
            settings={getEditorSettings({
                isReadOnly: false,
                initialText: topic.text,
                initialTextFormat: topic.format,
                embeds: topic.embeds ?? [],
                allowComments: false,
                tableOfContents: true,
                showToolbar: true,
                isDraggableBlock: true,
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