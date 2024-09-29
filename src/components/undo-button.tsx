import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import TickButton from './tick-button';
import StateButton from './state-button';
import { useSWRConfig } from 'swr';
import { userAgent } from 'next/server';
import { undoChange } from '../actions/entities';
import { useContent } from '../app/hooks/contents';
import { useUser } from '../app/hooks/user';
import { EntityProps } from '../app/lib/definitions';
import InfoPanel from './info-panel';
import { CloseButtonIcon, UndoIcon } from './icons';
import { hasEditPermission, permissionToPrintable } from './utils';
import { PermissionLevel } from './editor/wiki-editor';
import { NoEditPermissionsMsg } from './no-edit-permissions-msg';
import { AcceptButtonPanel } from './accept-button-panel';

export function validExplanation(text: string) {
    return text.length > 0
}

const UndoChangesModal = ({ onClose, entity, version }: { onClose: any, entity: EntityProps, version: number}) => {
    const user = useUser()
    const [explanation, setExplanation] = useState("")
    const [vandalism, setVandalism] = useState(false)
    const [oportunism, setOportunism] = useState(false)
    const {content} = useContent(entity.versions[version].id)

    const {mutate} = useSWRConfig()

    const infoPanelVandalism = <div>Si te parece que empeoró la calidad del artículo intencionalmente. La situación va a ser revisada por un administrador.</div>

    const infoPanelOportunism = <div>Si te parece que intentó obtener un rédito económico desproporcionado con respecto a la mejora que representa en el artículo.</div>

    const vandalismInfo = <span className="text-gray-800 text-sm">Marcar como vandalismo <InfoPanel text={infoPanelVandalism} className="w-72"/></span>

    const oportunismInfo = <span className="text-gray-800 text-sm">Marcar como oportunismo <InfoPanel text={infoPanelOportunism} className="w-72"/></span>

    let modalContent = null

    if(!user.user){
        return <AcceptButtonPanel text="Necesitás una cuenta para deshacer cambios." onClose={onClose}/>
    }
    if(hasEditPermission(user.user, entity.protection)){
        modalContent = <div className="space-y-3 p-6">
            <h3>Deshacer el último cambio en "{entity.name}"</h3>
            <div>
                <textarea
                    rows={4}
                    className="resize-none w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-none placeholder-gray-500"
                    value={explanation}
                    onChange={(e) => {setExplanation(e.target.value)}}
                    placeholder="Explicá el motivo por el que te parece necesario deshacer este cambio. Deshacer cambios sin justificación podría ser motivo de sanción. El reporte va a estar abierto a discusión y va a ser revisado por un administrador."
                />
            </div>
            {<TickButton text={vandalismInfo} setTicked={setVandalism} ticked={vandalism} size={20} color="#455dc0" />}
            {<TickButton text={oportunismInfo} setTicked={setOportunism} ticked={oportunism} size={20} color="#455dc0" />}
            <div className="mt-4">
                <StateButton
                    onClick={async () => {
                        if(user.user && content){
                            await undoChange(entity.id, content.id, version, explanation, user.user.id, vandalism, oportunism)
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
    } else {
        return <AcceptButtonPanel
            text={<div>
                <p>Necesitás permisos de edición para deshacer cambios.</p>
                <NoEditPermissionsMsg user={user.user} level={entity.protection}/>
            </div>}
            onClose={onClose}
        />
    }
    

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[var(--background)] rounded-lg shadow-lg text-center">
                <div className="flex justify-end px-1">
                    <button
                        onClick={(e) => {e.preventDefault(); e.stopPropagation(); onClose();}}
                    >
                        <CloseButtonIcon/>
                    </button>
                </div>
                
                {modalContent}
            </div>
        </div>,
        document.body // This renders the modal directly inside the body
    );
};



export const UndoButton = ({entity, version}: {entity: EntityProps, version: number}) => {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return <div className="relative">
        <button
            className="underline hover:text-[var(--primary)] text-sm"
            onClick={(e) => {e.stopPropagation(); e.preventDefault(); setIsModalOpen(true)}}>
            <UndoIcon/>
        </button>

        {isModalOpen && 
        <UndoChangesModal
            onClose={() => setIsModalOpen(false)}
            entity={entity}
            version={version}
        />
        }
    </div>
}

