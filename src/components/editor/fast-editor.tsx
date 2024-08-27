"use client"

import MyLexicalEditor, { SettingsProps } from "./lexical-editor"
import { useState } from "react"
import StateButton from "../state-button"
import { EditorState, LexicalEditor } from "lexical"
import { emptyOutput } from "./comment-editor"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { InitialEditorStateType } from "@lexical/react/LexicalComposer"


const FastEditor = ({onSubmit, onSaveDraft, initialData=null}: 
    {onSubmit?: any, onSaveDraft?: any, initialData?: InitialEditorStateType}
) => {
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editorOutput, setEditorOutput] = useState<EditorState | undefined>(undefined)
    const router = useRouter()

    const isDevPlayground = false
    const settings: SettingsProps = {
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
        showToolbar: false,
        isComments: false,
        isDraggableBlock: true,
        useSuperscript: false,
        useStrikethrough: false,
        useSubscript: false,
        useCodeblock: false,
        placeholder: "Escribí tu publicación acá...",
        initialData: initialData,
        isAutofocus: true,
        editorClassName: "content",
        isReadOnly: false
    }

    async function handleSubmit(){
        if(editor && editorOutput){
            editorOutput.read(async () => {
                await onSubmit(JSON.stringify(editorOutput), "FastPost")
                router.push("/")
            })
        }
	}

    async function handleSaveDraft(){
        if(editor && editorOutput){
            editorOutput.read(async () => {
                await onSaveDraft(JSON.stringify(editorOutput), "FastPost")
                router.push("/borradores")
            })
        }
	}

	const PublishButton = ({onClick}: any) => {
        return <StateButton
            onClick={onClick}
            className="gray-btn"
            text1="Publicar"
            text2="Publicando..."
            disabled={emptyOutput(editorOutput)}
        />
	}

    const SaveDraftButton = ({onClick}: any) => {
        return <StateButton
            onClick={onClick}
            className="gray-btn"
            text1="Guardar borrador"
            text2="Guardando..."
            disabled={emptyOutput(editorOutput)}
        />
	}

    const DraftsButton = () => {
        return <Link href="/borradores">
            <button className="gray-btn">
                Ver borradores
            </button>
        </Link>
    }

    return <div className="p-1 rounded">
        <div className="flex justify-between mt-3">
            <DraftsButton/>
			<div className="flex justify-end">
                <div className="px-1">
                    <PublishButton onClick={handleSubmit}/>
                </div>
                <SaveDraftButton onClick={handleSaveDraft}/>
			</div>
		</div>
        <div className="mt-12">
            <MyLexicalEditor
                settings={settings}
                setEditor={setEditor}
                setOutput={setEditorOutput}
            />
        </div>
    </div>
}


export default FastEditor