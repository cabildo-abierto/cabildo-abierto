"use client"

import { charCount, emptyOutput, validPost } from "../utils"
import { useState } from "react"
import StateButton from "../state-button"
import { CLEAR_EDITOR_COMMAND, EditorState, LexicalEditor } from "lexical"


import dynamic from 'next/dynamic'
import LoadingSpinner from "../loading-spinner"
import { SettingsProps } from "./lexical-editor"
import { useUser } from "../../app/hooks/user"
const MyLexicalEditor = dynamic( () => import( './lexical-editor' ), { ssr: false } );


export const commentEditorSettings: SettingsProps = {
    disableBeforeInput: false,
    emptyEditor: false,
    isAutocomplete: false,
    isCharLimit: true,
    charLimit: 800,
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
    isDraggableBlock: false,
    useSuperscript: false,
    useStrikethrough: false,
    useSubscript: false,
    useCodeblock: false,
    placeholder: "Agregá un comentario...",
    isAutofocus: false,
    editorClassName: "link min-h-16",
    initialData: null,
    isReadOnly: false,
    placeholderClassName: "absolute top-0 text-[var(--text-lighter)] pointer-events-none"
}


type CommentEditorProps = {
    onSubmit: (arg0: string) => void,
    onCancel?: () => void
}

export function validComment(editorState: EditorState, charLimit: number) {
    return !emptyOutput(editorState) && validPost(editorState, charLimit)
}

const CommentEditor = ({ onSubmit, onCancel }: CommentEditorProps) => {
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined)
    const user = useUser()
    
    if(user.isLoading){
        return <LoadingSpinner/>
    }
    
    async function handleSubmit(){
        if(editor){
            await onSubmit(JSON.stringify(editor.getEditorState()))
            editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined)
            return true
        }
        return false
	}

	const SendCommentButton = ({onClick}: {onClick: (e: any) => Promise<boolean>}) => {

        return <StateButton
            onClick={onClick}
            className="small-btn"
            text1="Enviar"
            text2="Enviando..."
            disabled={!user.user || !validComment(editorState, settings.charLimit)}
        />
	}

    const settings = {...commentEditorSettings}
    if(!user.user) settings.placeholder = "Necesitás una cuenta para agregar un comentario."
    
    const count = editor && editorState ? charCount(editorState) : 0

    return <div className="content-container p-1">
        <div className="ml-3 mr-2 mt-2">
            <MyLexicalEditor
            settings={settings}
            setEditor={setEditor}
            setEditorState={setEditorState}/>
            {settings.charLimit && settings.charLimit-count < 100 && <div className="flex justify-end text-sm text-[var(--text-light)] mt-2">
                Caracteres restantes: {settings.charLimit-count}
            </div>}
        </div>
        <div className="flex justify-end">
			<div className="flex justify-end mt-3">
                <div className="px-1">
                    <SendCommentButton onClick={handleSubmit}/>
                </div>
				{onCancel &&
					<div className="px-1">
						<button
							onClick={onCancel}
							className="small-btn"
						>
							Cancelar
						</button>
					</div>
				}
			</div>
		</div>
    </div>
}


export default CommentEditor