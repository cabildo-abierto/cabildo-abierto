"use client"
import { useState } from 'react';
import { useSWRConfig } from 'swr';
import StateButton from './state-button';
import { commentEditorSettings } from './editor/comment-editor';

import dynamic from 'next/dynamic'
import { EditorState, LexicalEditor } from 'lexical';
import { createFakeNewsReport } from '../actions/contents';
import { useUser } from '../app/hooks/user';
import { compress } from './compression';
import { emptyOutput } from './utils';
import { BaseFullscreenPopup } from './base-fullscreen-popup';
const MyLexicalEditor = dynamic( () => import( './editor/lexical-editor' ), { ssr: false } );



function validFakeNewsReport(editorState: EditorState) {
    return editorState && !emptyOutput(editorState)
}


export const CreateFakeNewsReportModal = ({ contentId, onClose }: { contentId: string, onClose: () => void }) => {
    const user = useUser();
    const { mutate } = useSWRConfig();
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined)

    let settings = {...commentEditorSettings}
    settings.placeholder = "Explicá por qué creés que la publicación incluye información falsa. Tené en cuenta que hacer un reporte sin justificarlo puede ser sancionado."
    settings.editorClassName = "min-h-[200px]"
    settings.isAutofocus = true

    return <BaseFullscreenPopup onClose={onClose} closeButton={true}>
        <div className="space-y-3 px-6 pb-6 sm:w-128">
            <h3>Reportando información falsa</h3>
            <div className="border rounded p-1">
                <MyLexicalEditor
                    settings={settings}
                    setEditorState={setEditorState}
                    setEditor={setEditor}
                />
            </div>
            <div className="py-4">
                <StateButton
                    handleClick={async () => {
                        if(user.user && editor){
                            await createFakeNewsReport(
                                compress(JSON.stringify(editor.getEditorState())),
                                contentId,
                                user.user.id
                            )
                            
                            mutate("/api/comments/"+contentId)
                            mutate("/api/replies-feed/"+user.user.id)
                            onClose()
                            return true
                        }
                        return false
                    }}
                    className="gray-btn w-64"
                    text1="Confirmar"
                    text2="Enviando..."
                    disabled={!validFakeNewsReport(editorState)}
                />
            </div>
        </div>
    </BaseFullscreenPopup>
};