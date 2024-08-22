import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import CreateIcon from '@mui/icons-material/Create';
import BoltIcon from '@mui/icons-material/Bolt';
import ArticleIcon from '@mui/icons-material/Article';
import Link from 'next/link';
import TickButton from './tick-button';
import StateButton from './state-button';
import { createEntity, undoChange } from '@/actions/create-entity';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/hooks/user';
import { useSWRConfig } from 'swr';
import CloseIcon from '@mui/icons-material/Close';
import { ContentProps, EntityProps } from '@/app/lib/definitions';
import { useContent } from '@/app/hooks/contents';

export function validExplanation(text: string) {
    return text.length > 0
}

const UndoChangesModal = ({ onClose, entity, version }: { onClose: any, entity: EntityProps, version: number}) => {
    const user = useUser()
    const [explanation, setExplanation] = useState("")
    const {mutate} = useSWRConfig()
    const router = useRouter()
    const [vandalism, setVandalism] = useState(false)
    const {content} = useContent(entity.versions[version].id)

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[var(--background)] rounded-lg shadow-lg text-center">
                <div className="flex justify-end px-1">
                    <button
                        onClick={onClose}
                    >
                        <CloseIcon/>
                    </button>
                </div>
                
                <div className="space-y-3 p-6">
                    <h3>Deshacer el último cambio en {entity.name}</h3>
                    <div>
                        <textarea
                            rows={4}
                            className="resize-none w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-none placeholder-gray-500"
                            value={explanation}
                            onChange={(e) => {setExplanation(e.target.value)}}
                            placeholder="Explicá el motivo por el que te parece necesario deshacer este cambio. Deshacer cambios sin justificación podría ser motivo de sanción."
                        />
                    </div>
                    {false && <div className="flex items-center space-x-2 px-2">
                        <TickButton onClick={setVandalism} size={20} color="#455dc0" />
                        <span className="text-gray-800 text-sm">Es vandalismo</span>
                    </div>}
                    <div className="py-4">
                        <StateButton
                            onClick={async () => {
                                if(user.user && content){
                                    await undoChange(entity.id, content.id, version, explanation)
                                    onClose()
                                }
                            }}
                            disabled={!validExplanation(explanation)}
                            className="gray-btn w-full"
                            text1="Confirmar"
                            text2="Deshaciendo cambios..."
                        />
                    </div>
                </div>
            </div>
        </div>,
        document.body // This renders the modal directly inside the body
    );
};



export const UndoButton = ({entity, version}: {entity: EntityProps, version: number}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return <div className="relative">
        <div className="px-2">
            <button className="small-btn" onClick={() => {setIsModalOpen(true)}}>
                Deshacer cambio
            </button>
        </div>

        {isModalOpen && 
        <UndoChangesModal
            onClose={() => setIsModalOpen(false)}
            entity={entity}
            version={version}
        />
        }
    </div>
}

