"use client"
import { useState } from 'react';
import { useSWRConfig } from 'swr';
import StateButton from './state-button';
import { commentEditorSettings } from './editor/comment-editor';

import dynamic from 'next/dynamic'
import { EditorState, LexicalEditor } from 'lexical';
import { useUser } from '../hooks/user';
import { compress } from './compression';
import { emptyOutput } from './utils';
import { BaseFullscreenPopup } from './ui-utils/base-fullscreen-popup';
import { NeedAccountPopup } from './need-account-popup';
const MyLexicalEditor = dynamic( () => import( './editor/lexical-editor' ), { ssr: false } );



function validFakeNewsReport(editorState: EditorState) {
    return editorState && !emptyOutput(editorState)
}


export const CreateFakeNewsReportModal = ({ contentId, open, onClose }: { contentId: string, onClose: () => void, open: boolean }) => {
    const user = useUser();
    const { mutate } = useSWRConfig();
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined)

    let settings = {...commentEditorSettings}
    settings.placeholder = "Explicá por qué creés que la publicación incluye información falsa. Hacer un reporte sin justificarlo puede ser sancionado."
    settings.editorClassName = "min-h-[200px] " + settings.editorClassName 
    settings.isAutofocus = true

    if(!user) return <NeedAccountPopup text="Necesitás una cuenta para crear un reporte." open={open} onClose={onClose}/>

    return <BaseFullscreenPopup open={open} onClose={onClose} closeButton={true} className="px-1 sm:w-128 w-[98vh]">
        <div className="space-y-3 px-2 flex flex-col items-center">
            <h3>Reportando información falsa</h3>
            <div className="border rounded p-1 w-full">
                <MyLexicalEditor
                    settings={settings}
                    setEditorState={setEditorState}
                    setEditor={setEditor}
                />
            </div>
            <div className="py-4">
                <StateButton
                    handleClick={async () => {
                        /*if(user.user && editor){
                            const {error, ...newComment} = await createFakeNewsReport(
                                compress(JSON.stringify(editor.getEditorState())),
                                user.user.did,
                                contentId,
                            )
                            if(error) return {error}
                            
                            mutate("/api/content/"+contentId)
                            mutate("/api/feed/")
                            mutate("/api/routeFollowingFeed/")
                            onClose()
                            return {}
                        }
                        return {error: "Ocurrió un error al crear el reporte."}*/

                        
                        /*const compressedText = compress(text)
                        const {error, ...newComment} = await createComment(compressedText, user.id, content.id, content.parentEntityId)
                        
                        if(error) return {error}

                        setComments([newComment as CommentProps, ...comments])

                        setViewComments(true)

                        if(["Post", "FastPost"].includes(content.type) || (content.rootContent && ["Post", "FastPost"].includes(content.rootContent.type))){
                            console.log("Mutating feed")
                            await mutate("/api/feed/")
                        }
                        */
                        return {}
                    }}
                    disableElevation={true}
                    text1="Enviar"
                    disabled={!validFakeNewsReport(editorState)}
                />
            </div>
        </div>
    </BaseFullscreenPopup>
};