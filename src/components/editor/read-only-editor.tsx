"use client"

import { InitialEditorStateType } from "@lexical/react/LexicalComposer"

import { SettingsProps } from "./lexical-editor"

import dynamic from "next/dynamic";
import { EditorState, LexicalEditor } from "lexical";
import { CommentProps } from "../../app/lib/definitions";
import { ContentType } from "@prisma/client";
const MyLexicalEditor = dynamic(() => import('./lexical-editor'), {
    ssr: false,
    loading: () => <></>, 
});

const ReadOnlyEditor = ({
    initialData,
    content, 
    editorClassName="link"
}: {
    initialData: InitialEditorStateType,
    content?: {
        type: ContentType
        isContentEdited: boolean
        id: string
        childrenContents: CommentProps[]
        compressedText?: string
    },
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
        placeholderClassName: "",
        imageClassName: (content && content.type == "FastPost") ? "fastpost-image" : "",
        preventLeave: true
    }
    
    return <div key={content ? (content.id + content.isContentEdited) : 0}>
        <MyLexicalEditor
            settings={settings}
            setEditor={(editor: LexicalEditor) => {}}
            setEditorState={(state: EditorState) => {}}
        />
    </div>
}

export default ReadOnlyEditor