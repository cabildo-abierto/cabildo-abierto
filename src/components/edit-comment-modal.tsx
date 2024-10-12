import { BaseFullscreenPopup } from "./base-fullscreen-popup"

import dynamic from 'next/dynamic'
import { commentEditorSettings, validComment } from "./editor/comment-editor";
import { useState } from "react";
import { EditorState, LexicalEditor } from "lexical";
import { useContent } from "../app/hooks/contents";
import LoadingSpinner from "./loading-spinner";
import { compress, decompress } from "./compression";
import StateButton from "./state-button";
import { updateContent } from "../actions/contents";
const MyLexicalEditor = dynamic( () => import( './editor/lexical-editor' ), { ssr: false } );

export const EditCommentModal = ({contentId, onClose}: {contentId: string, onClose: () => void}) => {
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined)
    const content = useContent(contentId)

    if(content.isLoading){
        return <LoadingSpinner/>
    }

    let settings = {...commentEditorSettings}
    settings.placeholder = "Escribí la nueva versión de tu comentario..."
    settings.editorClassName = "min-h-[200px]"
    settings.isAutofocus = true
    settings.content = content.content
    settings.initialData = decompress(content.content.compressedText)

    return <BaseFullscreenPopup onClose={onClose} closeButton={true}>
        <div className="px-4 sm:w-96 lg:w-128">
            <h3>Editar comentario</h3>

            <div className="border rounded p-1 mt-6">
                <MyLexicalEditor
                    settings={settings}
                    setEditorState={setEditorState}
                    setEditor={setEditor}
                />
            </div>

            <StateButton
                text1={"Confirmar cambios"}
                text2={"Enviando..."}
                className="gray-btn my-2 w-64"
                disabled={!validComment(editorState)}
                onClick={async (e) => {
                    await updateContent(contentId, compress(JSON.stringify(editorState)))
                    return true
                }}
            />
        </div>
    </BaseFullscreenPopup>
}