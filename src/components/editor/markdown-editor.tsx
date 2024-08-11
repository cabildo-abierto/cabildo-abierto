"use client"
import { useState } from "react"
import MyLexicalEditor from "./lexical-editor"
import { useRouter } from "next/navigation"
import { $getRoot, EditorState, LexicalEditor } from "lexical"
import StateButton from "../state-button"
import { updateContent } from "@/actions/create-content"

import {$convertToMarkdownString} from "@lexical/markdown"

const MarkdownEditor = ({initialData, contentId, entityId}: any) => {
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editorOutput, setEditorOutput] = useState<EditorState | undefined>(undefined)
    const router = useRouter()
    
    const isDevPlayground = false
    const settings = {
        disableBeforeInput: false,
        emptyEditor: isDevPlayground,
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
        showToolbar: true,
        isComments: false,
        isDraggableBlock: true,
        useSuperscript: false,
        useStrikethrough: false,
        useSubscript: false,
        useCodeblock: false,
        placeholder: "Este artículo está vacío!",
        initialData: initialData,
        isMarkdownEditor: true
    }

    const SaveEditButton = () => {
        return <StateButton
            className="large-btn"
            text1="Guardar edición"
            text2="Guardando..."
            onClick={async () => {
                if(editorOutput){
                    editorOutput.read(async () => {
                        const root = $getRoot()
                        const markdown = $convertToMarkdownString(undefined, root, false)
                        await updateContent(markdown, contentId)
                        router.push("/wiki/"+encodeURIComponent(entityId))
                    })
                }
            }}
        />
    }

    return <>
        <div className="flex justify-end">
        <SaveEditButton/>
        </div>
        <div className="ck-content">
            <MyLexicalEditor
                settings={settings}
                setEditor={setEditor}
                setOutput={setEditorOutput}
            />
        </div>
    </>
}


export default MarkdownEditor