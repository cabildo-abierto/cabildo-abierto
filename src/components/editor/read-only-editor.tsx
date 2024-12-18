"use client"

import { InitialEditorStateType } from "@lexical/react/LexicalComposer"

import { SettingsProps } from "./lexical-editor"

import dynamic from "next/dynamic";
import { EditorState, LexicalEditor } from "lexical";

const MyLexicalEditor = dynamic(() => import('./lexical-editor'), {
    ssr: false,
    loading: () => <></>, 
});

const ReadOnlyEditor = ({
    initialData,
    allowTextComments = false,
    editorClassName="link"
}: {
    initialData: InitialEditorStateType,
    allowTextComments?: boolean,
    editorClassName?: string
}) => {
    const settings: SettingsProps = {
        disableBeforeInput: false,
        emptyEditor: false,
        isAutocomplete: false,
        allowImages: true,
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
        isComments: allowTextComments,
        isDraggableBlock: false,
        useSuperscript: false,
        useStrikethrough: false,
        useSubscript: false,
        useCodeblock: false,
        placeholder: "",
        initialData: initialData,
        isAutofocus: true,
        editorClassName: editorClassName,
        isReadOnly: true,
        content: undefined,
        placeholderClassName: "",
        imageClassName: "",
        preventLeave: true
    }
    
    return <MyLexicalEditor
        settings={settings}
        setEditor={(editor: LexicalEditor) => {}}
        setEditorState={(state: EditorState) => {}}
    />
}

export default ReadOnlyEditor