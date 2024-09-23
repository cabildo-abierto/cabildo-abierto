import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import TickButton from './tick-button';
import StateButton from './state-button';
import CloseIcon from '@mui/icons-material/Close';
import { useSWRConfig } from 'swr';
import { userAgent } from 'next/server';
import { undoChange } from '../actions/entities';
import { useContent } from '../app/hooks/contents';
import { useUser } from '../app/hooks/user';
import { EntityProps } from '../app/lib/definitions';
import InfoPanel from './info-panel';

export function validExplanation(text: string) {
    return text.length > 0
}

const UndoChangesModal = ({ onClose, entity, version }: { onClose: any, entity: EntityProps, version: number}) => {
    const user = useUser()
    const [explanation, setExplanation] = useState("")
    const [vandalism, setVandalism] = useState(false)
    const {content} = useContent(entity.versions[version].id)

    const {mutate} = useSWRConfig()

    const infoPanelVandalism = <span>Marcá la modificación como vandalismo si te parece que fue una modificación que intencionalmente empeoró la calidad del artículo. La situación va a ser revisada por un administrador.</span>

    const vandalismInfo = <span className="text-gray-800 text-sm">Marcar como vandalismo <InfoPanel text={infoPanelVandalism} className="w-72"/></span>

    const modalContent = <div className="space-y-3 p-6">
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
        {<TickButton text={vandalismInfo} setTicked={setVandalism} ticked={vandalism} size={20} color="#455dc0" />}
        <div className="py-4">
            <StateButton
                onClick={async () => {
                    if(user.user && content){
                        await undoChange(entity.id, content.id, version, explanation)
                        mutate("/api/entity/"+entity.id)
                        mutate("/api/entities")
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

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[var(--background)] rounded-lg shadow-lg text-center">
                <div className="flex justify-end px-1">
                    <button
                        onClick={(e) => {e.preventDefault(); e.stopPropagation(); onClose();}}
                    >
                        <CloseIcon/>
                    </button>
                </div>
                
                {modalContent}
            </div>
        </div>,
        document.body // This renders the modal directly inside the body
    );
};



export const UndoButton = ({entity, version}: {entity: EntityProps, version: number}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const user = useUser()

    return <div className="relative">
        <div className="px-2 flex justify-ceter">
            <button disabled={!user.user} className="underline hover:text-[var(--primary)] text-sm" onClick={(e) => {e.stopPropagation(); e.preventDefault(); setIsModalOpen(true)}}>
                Deshacer
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

