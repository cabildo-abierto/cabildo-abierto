"use client"

import {SettingsProps} from "../../../modules/ca-lexical-editor/src/lexical-editor"
import {FastPostProps} from "@/lib/definitions";
import {ReplyToContent} from "../../../modules/ca-lexical-editor/src/plugins/CommentPlugin";


export const wikiEditorSettings = (
    readOnly: boolean,
    content: ReplyToContent | null,
    text: string,
    textFormat: string,
    enableTableOfContents: boolean = true,
    enableComments: boolean,
    quoteReplies?: FastPostProps[],
    pinnedReplies?: string[],
    setPinnedReplies?: (v: string[]) => void): SettingsProps => {

    return {
        disableBeforeInput: false,
        emptyEditor: false,
        isAutocomplete: false,
        isCharLimit: false,
        isCharLimitUtf8: false,
        allowImages: true,
        isCollab: false,
        isMaxLength: false,
        isRichText: true,
        measureTypingPerf: false,
        shouldPreserveNewLinesInMarkdown: true,
        shouldUseLexicalContextMenu: false,
        showNestedEditorTreeView: false,
        showTableOfContents: enableTableOfContents,
        showTreeView: false,
        tableCellBackgroundColor: false,
        tableCellMerge: false,
        showActions: false,
        showToolbar: !readOnly,
        isComments: readOnly && enableComments,
        isDraggableBlock: !readOnly,
        useSuperscript: false,
        useStrikethrough: false,
        useSubscript: false,
        useCodeblock: false,
        placeholder: "Agregá información sobre el tema...",
        editorClassName: "article-content not-article-content px-2",
        isReadOnly: readOnly,
        content: content,
        isAutofocus: false,
        placeholderClassName: "ContentEditable__placeholder px-2",
        imageClassName: "",
        preventLeave: true,
        initialText: text,
        initialTextFormat: textFormat,
        quoteReplies,
        pinnedReplies,
        setPinnedReplies
    }
}
