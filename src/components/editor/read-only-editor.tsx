"use client"

import { InitialEditorStateType } from "@lexical/react/LexicalComposer"

import { SettingsProps } from "./lexical-editor"

import dynamic from "next/dynamic";
import { useUser } from "@/app/hooks/user";
import { ContentProps } from "@/app/lib/definitions";
const MyLexicalEditor = dynamic( () => import( '@/components/editor/lexical-editor' ), { ssr: false } );


const ReadOnlyEditor = ({initialData,
    content, 
    editorClassName="link"
}: {
    initialData: InitialEditorStateType,
    content?: ContentProps,
    editorClassName?: string
}) => {
    const user = useUser()

    const settings: SettingsProps = {
        disableBeforeInput: false,
        emptyEditor: false,
        isAutocomplete: false,
        isCharLimit: false,
        isCharLimitUtf8: false,
        isCollab: false,
        isMaxLength: false,
        isRichText: true,
        measureTypingPerf: false,
        shouldPreserveNewLinesInMarkdown: true,
        shouldUseLexicalContextMenu: false,
        showNestedEditorTreeView: false,
        showTableOfContents: false,
        showTreeView: false,
        tableCellBackgroundColor: false,
        tableCellMerge: false,
        showActions: false,
        showToolbar: false,
        isComments: user.user != null,
        isDraggableBlock: false,
        useSuperscript: false,
        useStrikethrough: false,
        useSubscript: false,
        useCodeblock: false,
        placeholder: "Escribí tu publicación acá...",
        initialData: initialData,
        isAutofocus: true,
        editorClassName: editorClassName,
        isReadOnly: true,
        content: content,
        placeholderClassName: ""
    }
    
    return <MyLexicalEditor
        settings={settings}
        setEditor={() => {}}
        setOutput={() => {}}
    />
}

export default ReadOnlyEditor