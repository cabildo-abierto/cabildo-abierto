"use client"

import { validSubscription } from "../utils"
import { useState } from "react"
import Popup from "../popup"
import NeedAccountPopupPanel from "../need-account-popup"
import StateButton from "../state-button"
import { $getRoot, $isDecoratorNode, $isElementNode, $isTextNode, CLEAR_EDITOR_COMMAND, EditorState, ElementNode, LexicalEditor } from "lexical"
import { $generateHtmlFromNodes } from '@lexical/html';

import { SettingsProps } from "src/components/editor/lexical-editor"
import { UserProps } from "src/app/lib/definitions"
import { useUser } from "src/app/hooks/user"

import dynamic from 'next/dynamic'
import LoadingSpinner from "../loading-spinner"
const MyLexicalEditor = dynamic( () => import( 'src/components/editor/lexical-editor' ), { ssr: false } );


export const commentEditorSettings: SettingsProps = {
    disableBeforeInput: false,
    emptyEditor: false,
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
    isDraggableBlock: false,
    useSuperscript: false,
    useStrikethrough: false,
    useSubscript: false,
    useCodeblock: false,
    placeholder: "Agregá un comentario...",
    isAutofocus: false,
    editorClassName: "link",
    initialData: null,
    isReadOnly: false,
    placeholderClassName: ""
}


function canComment(user?: UserProps){
	return validSubscription(user)
}

export function $isWhitespace(node: ElementNode): boolean {
    for (const child of node.getChildren()) {
      if (
        ($isElementNode(child) && !$isWhitespace(child)) ||
        ($isTextNode(child) && child.getTextContent().trim() !== "") ||
        $isDecoratorNode(child)
      ) {
        return false;
      }
    }
    return true;
  }

export function emptyOutput(editorState: EditorState | undefined){
    if(!editorState) return true

    const isEmpty = editorState.read(() => {
        const root = $getRoot();
        const child = root.getFirstChild();

        if (
            child == null ||
            ($isElementNode(child) && child.isEmpty() && root.getChildrenSize() === 1)
            ) {
        return true;
        }

        return $isWhitespace(root);
    });
    return isEmpty;
}

export function validFastPost(state: EditorState | undefined, charLimit: number){
    if(!state) return false
    if(!charLimit) return true
    let isValid = state.read(() => {
        const root = $getRoot()
        return root.getTextContentSize() <= charLimit
    })
    return isValid
}


export function hasChanged(state: EditorState | undefined, initialData: string){
    return JSON.stringify(state) !== initialData
}


type CommentEditorProps = {
    onSubmit: (arg0: string) => void,
    onCancel?: () => void
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
        }
	}

	const SendCommentButton = ({onClick}: any) => {
        return <StateButton
            onClick={onClick}
            className="small-btn"
            text1="Enviar"
            text2="Enviando..."
            disabled={!editor || emptyOutput(editorState)}
        />
	}

    return <div className="content-container p-1">
        <div className="ml-3 mr-2 mt-2">
            <MyLexicalEditor
            settings={commentEditorSettings}
            setEditor={setEditor}
            setEditorState={setEditorState}/>
        </div>
        <div className="flex justify-end">
			<div className="flex justify-end mt-3">
                <div className="px-1">
                    {canComment(user.user) ? <SendCommentButton onClick={handleSubmit}/> :
                        <Popup 
                            Trigger={SendCommentButton}
                            Panel={NeedAccountPopupPanel}
                        />
                    }
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