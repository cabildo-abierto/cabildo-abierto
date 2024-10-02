"use client"
import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import CloseIcon from '@mui/icons-material/Close';
import StateButton from './state-button';
import { commentEditorSettings } from './editor/comment-editor';

import dynamic from 'next/dynamic'
import { EditorState, LexicalEditor } from 'lexical';
import { createFakeNewsReport } from '../actions/contents';
import { useUser } from '../app/hooks/user';
import { compress } from './compression';
import { emptyOutput } from './utils';
import { CloseButton } from './close-button';
const MyLexicalEditor = dynamic( () => import( './editor/lexical-editor' ), { ssr: false } );



function validFakeNewsReport(editorState: EditorState) {
    return editorState && !emptyOutput(editorState)
}


export const CreateFakeNewsReportModal = ({ onClose, contentId }: { onClose: () => void, contentId: string }) => {
    const user = useUser();
    const { mutate } = useSWRConfig();
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined)

    let settings = {...commentEditorSettings}
    settings.placeholder = "Explicá por qué creés que la publicación incluye información falsa. Tené en cuenta que hacer un reporte sin justificarlo puede ser sancionado."
    settings.editorClassName = "min-h-[200px]"
    settings.isAutofocus = true

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-5">
            <div className="bg-[var(--background)] rounded-lg shadow-lg text-center w-96 md:w-128">
                <div className="flex justify-end">
                    <CloseButton onClose={onClose}/>
                </div>

                <div className="space-y-3 px-6 pb-6">
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
                            onClick={async () => {
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
            </div>
        </div>,
        document.body
    );
};