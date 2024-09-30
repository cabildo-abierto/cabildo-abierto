"use client"

import { validSubscription } from "../utils"
import { useState } from "react"
import StateButton from "../state-button"
import { $getRoot, $isDecoratorNode, $isElementNode, $isTextNode, CLEAR_EDITOR_COMMAND, EditorState, ElementNode, LexicalEditor } from "lexical"


import dynamic from 'next/dynamic'
import LoadingSpinner from "../loading-spinner"
import { SettingsProps } from "./lexical-editor"
import { UserProps } from "../../app/lib/definitions"
import { useUser } from "../../app/hooks/user"
const MyLexicalEditor = dynamic( () => import( './lexical-editor' ), { ssr: false } );


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
    editorClassName: "link h-16",
    initialData: null,
    isReadOnly: false,
    placeholderClassName: "absolute top-0 text-[var(--text-lighter)] pointer-events-none"
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


export function nodesEqual(node1: any, node2: any){
    if(node1.type != node2.type){
        return false
    }
    const keys1 = Object.keys(node1);
    const keys2 = Object.keys(node2);
  
    if (keys1.length !== keys2.length) {
      return false;
    }
  
    function keyEquals(key: string){
        if(key == "children"){
            for(let i = 0; i < node1.children.length; i++){
                if(!nodesEqual(node1.children[i], node2.children[i])){
                    return false
                }
            }
            return true
        } else if(key == "textFormat"){
            return true
        } else {
            return node1[key] == node2[key]
        }
    }

    for (let key of keys1) {
        if (!keys2.includes(key) || !keyEquals(key)) {
            return false;
        }
    }

    return true
}


export function hasChanged(state: EditorState | undefined, initialData: string){
    const json1 = state.toJSON()
    try {
        const json2 = JSON.parse(initialData)
        return !nodesEqual(json1.root, json2.root)
    } catch {
        return !emptyOutput(state)
    }
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
            disabled={!editor || emptyOutput(editorState) || !user.user}
        />
	}

    const settings = {...commentEditorSettings}
    if(!user.user) settings.placeholder = "Necesitás una cuenta para agregar un comentario."

    return <div className="content-container p-1">
        <div className="ml-3 mr-2 mt-2">
            <MyLexicalEditor
            settings={settings}
            setEditor={setEditor}
            setEditorState={setEditorState}/>
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