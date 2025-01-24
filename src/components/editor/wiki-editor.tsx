"use client"

import { SettingsProps } from "./lexical-editor"
import {FastPostProps} from "../../app/lib/definitions";


const initialValue = `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"¡Este tema no tiene contenido! Si tenés información relevante o te interesa investigar el tema, editalo para agregar una primera versión.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`


export const wikiEditorSettings = (
    readOnly: boolean,
    content: {cid: string, uri: string},
    contentText: string,
    enableTableOfContents: boolean = true,
    enableComments: boolean,
    quoteReplies?: FastPostProps[],
    pinnedReplies?: string[],
    setPinnedReplies?: (v: string[]) => void): SettingsProps => {
    
    let initialData = null
    let emptyContent = contentText == "" || contentText == "Este artículo está vacío!"
    if(readOnly && emptyContent){
        initialData = initialValue
    } else {
        initialData = contentText
    }
        
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
        placeholder: "Explicá el tema del título o agregá información...",
        initialData: initialData,
        editorClassName: "content",
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
