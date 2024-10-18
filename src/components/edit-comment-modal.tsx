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
import { charCount } from "./utils";
import { useSWRConfig } from "swr";
import { ExtraChars } from "./extra-chars";
const MyLexicalEditor = dynamic( () => import( './editor/lexical-editor' ), { ssr: false } );

export const EditCommentModal = ({contentId, onClose}: {contentId: string, onClose: () => void}) => {
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined)
    const [errorOnEdit, setErrorOnEdit] = useState(false)
    const content = useContent(contentId)
    const {mutate} = useSWRConfig()

    if(content.isLoading){
        return <LoadingSpinner/>
    }

    let settings = {...commentEditorSettings}
    settings.placeholder = "Escribí la nueva versión de tu comentario..."
    settings.editorClassName = "min-h-[200px] content"
    settings.isAutofocus = true
    settings.content = content.content
    settings.initialData = decompress(content.content.compressedText)

    const count = editor && editorState ? charCount(editorState) : 0
    
    return <BaseFullscreenPopup onClose={onClose} closeButton={true}>
        <div className="px-4 sm:w-96 lg:w-128">
            <h3>Editar comentario</h3>

            <div className="border rounded p-1 mt-6">
                <MyLexicalEditor
                    settings={settings}
                    setEditorState={setEditorState}
                    setEditor={setEditor}
                />
                {settings.charLimit && <ExtraChars charLimit={settings.charLimit} count={count}/>}
            </div>

            <StateButton
                text1={"Confirmar cambios"}
                text2={"Enviando..."}
                className="gray-btn my-2 w-64"
                disabled={!validComment(editorState, settings.charLimit)}
                handleClick={async (e) => {
                    setErrorOnEdit(false)
                    const result = await updateContent(compress(JSON.stringify(editorState)), contentId)
                    if(result){
                        mutate("/api/content/"+contentId)
                        onClose()
                        return true
                    } else {
                        setErrorOnEdit(true)
                        return false
                    }
                }}
            />
            {errorOnEdit && <div className="text-red-600 text-sm mb-2">Ocurrió un error al guardar la edición. Intentalo de nuevo.</div>}
        </div>
    </BaseFullscreenPopup>
}