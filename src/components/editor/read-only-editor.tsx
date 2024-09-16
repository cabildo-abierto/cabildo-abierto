"use client"

import { InitialEditorStateType } from "@lexical/react/LexicalComposer"

import { SettingsProps } from "./lexical-editor"

import dynamic from "next/dynamic";
import { EditorState, LexicalEditor } from "lexical";
import { ContentProps } from "../../app/lib/definitions";
import { useUser } from "../../app/hooks/user";
const MyLexicalEditor = dynamic( () => import( './lexical-editor' ), { ssr: false } );


const ReadOnlyEditor = ({
    initialData,
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
        isComments: content && (content.type == "EntityContent" || content.type == "Post"),
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
        content: content,
        placeholderClassName: ""
    }
    
    return <MyLexicalEditor
        settings={settings}
        setEditor={(editor: LexicalEditor) => {}}
        setEditorState={(state: EditorState) => {}}
    />
}

export default ReadOnlyEditor