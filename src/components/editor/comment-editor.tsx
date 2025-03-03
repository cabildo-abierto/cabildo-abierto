"use client"

import { charCount, validPost } from "../utils/utils"
import { useState } from "react"
import StateButton from "../ui-utils/state-button"
import { CLEAR_EDITOR_COMMAND, EditorState, LexicalEditor } from "lexical"


import dynamic from 'next/dynamic'
import LoadingSpinner from "../ui-utils/loading-spinner"
import { SettingsProps } from "./lexical-editor"
import { useUser } from "../../hooks/user"
import { ExtraChars } from "../writing/extra-chars"
const MyLexicalEditor = dynamic( () => import( './lexical-editor' ), { ssr: false } );


export const commentEditorSettings: SettingsProps = {
    disableBeforeInput: false,
    emptyEditor: false,
    isAutocomplete: false,
    isCharLimit: true,
    charLimit: 300,
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
    editorClassName: "content comment min-h-16 relative",
    initialData: null,
    isReadOnly: false,
    placeholderClassName: "absolute top-0 text-[var(--text-lighter)] pointer-events-none",
    imageClassName: "",
    preventLeave: true,
    allowImages: false
}


type CommentEditorProps = {
    onSubmit: (arg0: string) => Promise<{error?: string}>,
    onCancel?: () => void
}

export function validComment(editorState: EditorState, charLimit: number) {
    return validPost(editorState, charLimit, "Comment", []).problem == undefined
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
            const {error} = await onSubmit(JSON.stringify(editor.getEditorState()))
            editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined)
            return {error}
        }
        return {error: "Ocurrió un problema al enviar el comentario."}
	}

    const settings = {...commentEditorSettings}
    if(!user.user) settings.placeholder = "Necesitás una cuenta para agregar un comentario."
    
    const count = editor && editorState ? charCount(editorState) : 0

    return <div className="content-container rounded p-1">
        <div className="ml-3 mr-2 mt-2">
            <MyLexicalEditor
                settings={settings}
                setEditor={setEditor}
                setEditorState={setEditorState}
            />
            {settings.charLimit && <ExtraChars charLimit={settings.charLimit} count={count}/>}
        </div>
        <div className="flex justify-end">
			<div className="flex justify-end mt-3">
                <div className="px-1">
                    <StateButton
                        handleClick={handleSubmit}
                        size="small"
                        disableElevation={true}
                        text1="Enviar"
                        disabled={!user.user || !validComment(editorState, settings.charLimit)}
                        variant="contained"
                    />
                </div>
				{onCancel &&
					<div className="px-1">
						<StateButton
							handleClick={async () => {onCancel(); return {}}}
                            size="small"
                            disableElevation={true}
                            text1="Cancelar"
                            variant="contained"
						/>
					</div>
				}
			</div>
		</div>
    </div>
}


export default CommentEditor