"use client"

import { UserProps } from "@/actions/get-user"
import { validSubscription } from "../utils"
import MyLexicalEditor from "./lexical-editor"
import { useState } from "react"
import Popup from "../popup"
import NeedAccountPopupPanel from "../need-account-popup"
import StateButton from "../state-button"
import { $getRoot, $isDecoratorNode, $isElementNode, $isTextNode, EditorState, ElementNode, LexicalEditor } from "lexical"
import { $generateHtmlFromNodes } from '@lexical/html';
import { emptyOutput } from "./comment-editor"
import { useRouter } from "next/navigation"
import { createPost } from "@/actions/create-content"
import Link from "next/link"
import { TitleInput } from "./title-input"

const PostEditor = ({onSubmit, onSaveDraft, initialData}: any) => {
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editorOutput, setEditorOutput] = useState<EditorState | undefined>(undefined)
    const router = useRouter()
    const [title, setTitle] = useState("")

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
        placeholder: "Escribí tu publicación acá...",
        initialData: initialData,
        editorClassName: "content mt-4"
    }

    async function handleSubmit(){
        if(editor && editorOutput){
            editorOutput.read(async () => {
                await onSubmit(JSON.stringify([title, editorOutput]), "Post")
                router.push("/")
            })
        }
	}

    async function handleSaveDraft(){
        if(editor && editorOutput){
            editorOutput.read(async () => {
                await onSaveDraft(JSON.stringify([title, editorOutput]), "Post")
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
        <div className="mt-4 ml-4">
        <TitleInput onChange={setTitle}/>
        </div>
        <div className="mt-4">
        <MyLexicalEditor settings={settings} setEditor={setEditor} setOutput={setEditorOutput}/>
        </div>
    </div>
}


export default PostEditor