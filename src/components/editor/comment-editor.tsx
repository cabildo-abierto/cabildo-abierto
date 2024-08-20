"use client"

import { validSubscription } from "../utils"
import { useState } from "react"
import Popup from "../popup"
import NeedAccountPopupPanel from "../need-account-popup"
import StateButton from "../state-button"
import { $getRoot, $isDecoratorNode, $isElementNode, $isTextNode, CLEAR_EDITOR_COMMAND, EditorState, ElementNode, LexicalEditor } from "lexical"
import { $generateHtmlFromNodes } from '@lexical/html';

import dynamic from 'next/dynamic'
import { SettingsProps } from "@/components/editor/lexical-editor"
import { UserProps } from "@/app/lib/definitions"
import { useUser } from "@/app/hooks/user"

const MyLexicalEditor = dynamic( () => import( '@/components/editor/lexical-editor' ), { ssr: false } );



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

type CommentEditorProps = {
    onSubmit: (arg0: string) => void,
    onCancel?: () => void
}

const CommentEditor = ({ onSubmit, onCancel }: CommentEditorProps) => {
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editorOutput, setEditorOutput] = useState<EditorState | undefined>(undefined)
    const user = useUser()

    if(user.isLoading){
        return <></>
    }

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
        isDraggableBlock: false,
        useSuperscript: false,
        useStrikethrough: false,
        useSubscript: false,
        useCodeblock: false,
        placeholder: "Agregá un comentario...",
        isAutofocus: false,
        editorClassName: "link",
        user: user.user,
        initialData: null,
        isReadOnly: false
    }

    async function handleSubmit(){
        if(editor && editorOutput){
            editorOutput.read(async () => {
                await onSubmit(JSON.stringify(editorOutput))
                editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined)
            })
        }
	}

	const SendCommentButton = ({onClick}: any) => {
        return <StateButton
            onClick={onClick}
            className="small-btn"
            text1="Enviar"
            text2="Enviando..."
            disabled={emptyOutput(editorOutput)}
        />
	}

    return <div className="px-1 py-2 border rounded bg-white">
        <div className="ml-3 mr-2 mt-2">
            <MyLexicalEditor settings={settings} setEditor={setEditor} setOutput={setEditorOutput}/>
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