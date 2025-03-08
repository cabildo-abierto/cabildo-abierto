"use client"

import {initializeEmpty, SettingsProps} from "./lexical-editor"
import {FastPostProps, FeedContentProps} from "../../app/lib/definitions";
import {decompress} from "../utils/compression";
import {InitialEditorStateType} from "@lexical/react/LexicalComposer";
import {$insertNodes, LexicalEditor} from "lexical";
import {
    $convertFromMarkdownString,
    $convertToMarkdownString,
    TRANSFORMERS,
} from '@lexical/markdown';
import {
    $generateNodesFromDOM
} from '@lexical/html'
import {ReplyToContent} from "./plugins/CommentPlugin";

const initialValue = `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Este tema está vacío. Editalo para agregar una primera versión.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`


function getInitialData(text: string | undefined, textFormat: string, readOnly: boolean): InitialEditorStateType{
    if(!text){
        return ""
    }
    if(!textFormat || textFormat == "lexical-compressed"){
        let contentText: string
        try {
            contentText = decompress(text)
        } catch {
            return "Ocurrió un error al leer el contenido del tema"
        }
        let initialData
        let emptyContent = contentText == "" || contentText == "Este artículo está vacío!"
        if(readOnly && emptyContent){
            initialData = initialValue
        } else {
            initialData = contentText
        }

        return initialData
    } else if(textFormat == "markdown"){
        const initialData = (editor: LexicalEditor) => {
            $convertFromMarkdownString(text, TRANSFORMERS)
        }
        return initialData
    } else if(textFormat == "markdown-compressed"){
        const contentText = decompress(text)
        const initialData = (editor: LexicalEditor) => {
            $convertFromMarkdownString(contentText, TRANSFORMERS)
        }
        return initialData
    } else if(textFormat == "html"){
        const initialData = (editor: LexicalEditor) => {
            const parser = new DOMParser();
            const dom = parser.parseFromString(text, "text/html");
            const nodes = $generateNodesFromDOM(editor, dom);

            $insertNodes(nodes);
        }
        return initialData

    } else {
        throw Error("Unknown format " + textFormat)
    }

}


export const wikiEditorSettings = (
    readOnly: boolean,
    content: ReplyToContent,
    text: string,
    textFormat: string,
    enableTableOfContents: boolean = true,
    enableComments: boolean,
    quoteReplies?: FastPostProps[],
    pinnedReplies?: string[],
    setPinnedReplies?: (v: string[]) => void): SettingsProps => {

    const initialData = getInitialData(text, textFormat, readOnly)

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
        initialData: initialData,
        editorClassName: "article-content not-article-content",
        isReadOnly: readOnly,
        content: {...content},
        isAutofocus: false,
        placeholderClassName: "ContentEditable__placeholder",
        imageClassName: "",
        preventLeave: true,
        quoteReplies,
        pinnedReplies,
        setPinnedReplies
    }
}
