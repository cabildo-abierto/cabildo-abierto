"use client"

import { InitialEditorStateType } from "@lexical/react/LexicalComposer"

import { SettingsProps } from "./lexical-editor"

import dynamic from "next/dynamic";
import { EditorState, LexicalEditor } from "lexical";
import {FastPostProps} from "../../app/lib/definitions";
import {ReplyToContent} from "./plugins/CommentPlugin";

const MyLexicalEditor = dynamic(() => import('./lexical-editor'), {
    ssr: false,
    loading: () => <></>, 
});

const ReadOnlyEditor = ({
    initialData,
    allowTextComments = false,
    editorClassName="link",
    content,
    quoteReplies,
    pinnedReplies,
    setPinnedReplies,
    showTableOfContents = false
}: {
    initialData: InitialEditorStateType
    allowTextComments?: boolean
    editorClassName?: string
    content?: ReplyToContent
    quoteReplies?: FastPostProps[]
    pinnedReplies?: string[]
    setPinnedReplies?: (v: string[]) => void
    showTableOfContents?: boolean
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
        showTableOfContents: showTableOfContents,
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
        content: content,
        placeholderClassName: "",
        imageClassName: "",
        preventLeave: true,
        quoteReplies: quoteReplies,
        pinnedReplies: pinnedReplies,
        setPinnedReplies: setPinnedReplies
    }
    
    return <MyLexicalEditor
        settings={settings}
        setEditor={() => {}}
        setEditorState={() => {}}
    />
}

export default ReadOnlyEditor