"use client"
import { useState } from "react"
import MyLexicalEditor from "./lexical-editor"
import { useRouter } from "next/navigation"
import { $getRoot, EditorState, LexicalEditor } from "lexical"
import StateButton from "../state-button"
import { updateContent } from "@/actions/create-content"

import Link from "next/link"

const WikiEditor = ({initialData, content, contents, entityId, user, readOnly=false}: any) => {
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
        showToolbar: !readOnly,
        isComments: readOnly,
        isDraggableBlock: !readOnly,
        useSuperscript: false,
        useStrikethrough: false,
        useSubscript: false,
        useCodeblock: false,
        placeholder: "Este artículo está vacío!",
        initialData: initialData,
        isMarkdownEditor: false,
        editorClassName: "content mt-4",
        isReadOnly: readOnly,
        user: user,
        content: content,
        isAutofocus: true
    }

    const SaveEditButton = () => {
        return <StateButton
            className="gray-btn"
            text1="Guardar edición"
            text2="Guardando..."
            onClick={async () => {
                if(editor && editorOutput){
                    editorOutput.read(async () => {
                        await updateContent(JSON.stringify(editor.getEditorState()), content.id)
                        router.push("/wiki/"+entityId)
                    })
                }
            }}
        />
    }

    /*const saveSelection = () => {
        //const selection = window.getSelection()
        const contentContainer = document.getElementById("editor")
        if(!contentContainer) return

        const selection = SelectionSerializer.save(contentContainer)
        const json = JSON.stringify(selection)

        setSavedSelection(json)
    }

    const markSelection = () => {
        const contentContainer = document.getElementById("editor")
        if(!contentContainer) return
        if(!savedSelection) return
        const selection = JSON.parse(savedSelection)
        SelectionSerializer.restore(contentContainer, selection)
    }*/

    return <>
        {!readOnly && <div className="flex justify-end">
            <Link href={"/wiki/"+entityId} className="px-2">
                <button className="gray-btn">
                    Cancelar
                </button>
            </Link>
            <SaveEditButton/>
        </div>}

        <div id="editor">
            <MyLexicalEditor
                settings={settings}
                setEditor={setEditor}
                setOutput={setEditorOutput}
                contents={contents}
            />
        </div>
    </>
}


export default WikiEditor