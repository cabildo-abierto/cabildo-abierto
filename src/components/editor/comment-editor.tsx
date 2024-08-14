"use client"

import { UserProps } from "@/actions/get-user"
import { validSubscription } from "../utils"
import { useState } from "react"
import Popup from "../popup"
import NeedAccountPopupPanel from "../need-account-popup"
import StateButton from "../state-button"
import { $getRoot, $isDecoratorNode, $isElementNode, $isTextNode, EditorState, ElementNode, LexicalEditor } from "lexical"
import { $generateHtmlFromNodes } from '@lexical/html';

import dynamic from 'next/dynamic'

const MyLexicalEditor = dynamic( () => import( '@/components/editor/lexical-editor' ), { ssr: false } );



function canComment(user: UserProps | null | undefined){
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

export function emptyOutput(editorState: EditorState | null){
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

const CommentEditor = ({ user, onSubmit, onCancel }: any) => {
    const [editor, setEditor] = useState<LexicalEditor | null>(null)
    const [editorOutput, setEditorOutput] = useState<EditorState | null>(null)

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
        showToolbar: false,
        isComments: false,
        isDraggableBlock: false,
        useSuperscript: false,
        useStrikethrough: false,
        useSubscript: false,
        useCodeblock: false,
        placeholder: "Agregá un comentario...",
        isAutofocus: false,
        editorClassName: "link"
    }

    async function handleSubmit(){
        if(editor && editorOutput){
            editorOutput.read(async () => {
                const html = $generateHtmlFromNodes(editor, null)
                await onSubmit(html)
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

    return <div className="p-1 border rounded">
        <div className="ml-3 mr-2 mt-2">
            <MyLexicalEditor settings={settings} setEditor={setEditor} setOutput={setEditorOutput}/>
        </div>
        <div className="flex justify-end">
			<div className="flex justify-end mt-3">
                <div className="px-1">
                    {canComment(user) ? <SendCommentButton onClick={handleSubmit}/> :
                        <Popup 
                            Trigger={SendCommentButton}
                            Panel={NeedAccountPopupPanel}
                        />
                    }
                </div>
				{onCancel != null &&
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