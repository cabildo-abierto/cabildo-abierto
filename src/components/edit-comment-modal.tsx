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
import { useUser } from "../app/hooks/user";
import useMedia from "use-media";
import { FullscreenDialog } from "./fullscreen-dialog";
import { CloseButton } from "./close-button";
const MyLexicalEditor = dynamic( () => import( './editor/lexical-editor' ), { ssr: false } );

export const EditCommentModal = ({contentId, onClose}: {contentId: string, onClose: () => void}) => {
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined)
    const [errorOnEdit, setErrorOnEdit] = useState(false)
    const content = useContent(contentId)
    const {mutate} = useSWRConfig()
    const {user} = useUser()
    const isSmallScreen = useMedia({ maxWidth: "640px" });

    if(content.isLoading){
        return <LoadingSpinner/>
    }

    let settings = {...commentEditorSettings}
    settings.placeholder = "Escribí la nueva versión de tu comentario..."
    settings.editorClassName = settings.editorClassName + " min-h-[200px]"
    settings.isAutofocus = true
    settings.content = content.content
    settings.initialData = decompress(content.content.compressedText)

    const count = editor && editorState ? charCount(editorState) : 0
    
    const editorComp = <div className="border rounded p-1 mt-6">
        <MyLexicalEditor
            settings={settings}
            setEditorState={setEditorState}
            setEditor={setEditor}
        />
        {settings.charLimit && <ExtraChars charLimit={settings.charLimit} count={count}/>}
    </div>

    const saveBtn = <div className="my-2"><StateButton
        text1="Guardar"
        disableElevation={true}
        disabled={!validComment(editorState, settings.charLimit)}
        handleClick={async () => {
            setErrorOnEdit(false)
            const {error} = await updateContent(compress(
                JSON.stringify(editorState)),
                contentId,
                user.id
            )
            if(!error){
                mutate("/api/content/"+contentId)
                onClose()
                return {}
            } else {
                setErrorOnEdit(true)
                return {}
            }
        }}
    /></div>

    const error = errorOnEdit ? <div className="text-red-600 text-sm mb-2">Ocurrió un error al guardar la edición. Intentalo de nuevo.</div> : <></>


    if(isSmallScreen){
        return <FullscreenDialog>
            <div className="px-2">
                <div className="flex justify-between items-center">
                    <CloseButton onClose={onClose}/>
                    {saveBtn}
                </div>
                {editorComp}
                {error}
            </div>
        </FullscreenDialog>
    } else {
        return <BaseFullscreenPopup onClose={onClose} closeButton={true}>
            <div className="px-4 w-128">
                <h3>Editando comentario</h3>
                {editorComp}
                <div className="flex justify-end">
                {saveBtn}
                </div>
                {error}
            </div>
        </BaseFullscreenPopup>
    }
    
}