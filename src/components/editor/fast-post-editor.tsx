"use client"

import dynamic from "next/dynamic";
import {useEffect, useState} from "react";
import {SettingsProps} from "../../../modules/ca-lexical-editor/src/lexical-editor";
import {EditorState} from "lexical";
import {getPlainText} from "@/components/topics/topic/diff";
import {queryMentions} from "@/server-actions/user/users";

const MyLexicalEditor = dynamic(() => import('../../../modules/ca-lexical-editor/src/lexical-editor'), {
    ssr: false,
    loading: () => <></>,
})


const settings: SettingsProps = {
    allowImages: true,
    allowPlots: true,
    allowTables: true,
    markdownShortcuts: false,
    isRichText: false,
    measureTypingPerf: false,
    useContextMenu: false,
    tableOfContents: false,
    showTreeView: false,
    showToolbar: false,
    allowComments: false,
    isDraggableBlock: false,
    useSuperscript: false,
    useStrikethrough: false,
    useSubscript: false,
    placeholder: "¿Qué está pasando?",
    initialText: "",
    initialTextFormat: "plain-text",
    isAutofocus: true,
    editorClassName: "link",
    isReadOnly: false,
    placeholderClassName: "absolute top-0 text-[var(--text-lighter)] pointer-events-none",
    imageClassName: "",
    preventLeave: true,
    queryMentions
}


type FastPostEditorProps = {
    placeholder: string
    setText: (t: string) => void
}


export const FastPostEditor = ({setText, placeholder}: FastPostEditorProps) => {
    const [editorState, setEditorState] = useState<EditorState | null>(null)

    useEffect(() => {
        if(editorState){
            let text = getPlainText(editorState.toJSON().root)
            if(text.endsWith("\n")) text = text.slice(0, text.length-1)
            setText(text)
        }
    }, [editorState, setText])

    return <MyLexicalEditor
        setEditor={() => {}}
        setEditorState={setEditorState}
        settings={{...settings, placeholder}}
    />
}