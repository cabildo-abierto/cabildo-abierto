import {getEditorSettings} from "@/components/writing/settings";
import dynamic from "next/dynamic";

const MyLexicalEditor = dynamic(() => import( '../../../../modules/ca-lexical-editor/src/lexical-editor' ), {ssr: false});
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api"
import {EditorState, LexicalEditor} from "lexical";
import {useEffect, useState} from "react";
import {useNavigationGuard} from "next-navigation-guard";
import {PreventLeavePopup} from "@/components/layout/prevent-leave-popup";

export const TopicEditor = ({topic, setEditor}: {
    topic: ArCabildoabiertoWikiTopicVersion.TopicView
    setEditor: (e: LexicalEditor) => void
}) => {
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

    return <div>
        <MyLexicalEditor
            settings={getEditorSettings({
                isReadOnly: false,
                initialText: topic.text,
                initialTextFormat: topic.format,
                embeds: topic.embeds ?? [],
                allowComments: false,
                tableOfContents: false,
                showToolbar: true,
                isDraggableBlock: true,
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