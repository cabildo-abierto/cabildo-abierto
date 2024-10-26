import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import TickButton from './tick-button';
import StateButton from './state-button';
import { useSWRConfig } from 'swr';
import { undoChange } from '../actions/entities';
import { useContent } from '../app/hooks/contents';
import { useUser } from '../app/hooks/user';
import { EntityProps } from '../app/lib/definitions';
import InfoPanel from './info-panel';
import { CloseButtonIcon, CloseButtonIconWithHover } from './icons';
import { hasEditPermission } from './utils';
import { NoEditPermissionsMsg } from './no-edit-permissions-msg';
import { AcceptButtonPanel } from './accept-button-panel';
import { BaseFullscreenPopup } from './base-fullscreen-popup';



export function validExplanation(text: string) {
    return text.length > 0
}

export const UndoChangesModal = ({ onClose, entity, version }: { onClose: () => void, entity: EntityProps, version: number}) => {
    const user = useUser()
    const [explanation, setExplanation] = useState("")
    const [vandalism, setVandalism] = useState(false)
    const [oportunism, setOportunism] = useState(false)
    const {content} = useContent(entity.versions[version].id)

    const {mutate} = useSWRConfig()

    const infoPanelVandalism = <span>Si te parece que empeoró la calidad del contenido intencionalmente.</span>

    const infoPanelOportunism = <span>Si te parece que intentó obtener un rédito económico desproporcionado con respecto a la mejora que representa en el contenido.</span>

    const vandalismInfo = <span className="text-gray-800 text-sm">Marcar como vandalismo <InfoPanel text={infoPanelVandalism} className="w-72"/></span>

    const oportunismInfo = <span className="text-gray-800 text-sm">Marcar como oportunismo <InfoPanel text={infoPanelOportunism} className="w-72"/></span>

    let modalContent = null

    if(!user.user){
        return <AcceptButtonPanel onClose={onClose}>
            Necesitás una cuenta para deshacer cambios.
        </AcceptButtonPanel>
    }
    if(hasEditPermission(user.user, entity.protection)){
        return <BaseFullscreenPopup closeButton={true} onClose={onClose}>
            <div className="space-y-3 px-6 mb-4">
                <h3>Deshacer el último cambio en {entity.name}</h3>
                <div>
                    <textarea
                        rows={4}
                        className="resize-none w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-none placeholder-gray-500"
                        value={explanation}
                        onChange={(e) => {setExplanation(e.target.value)}}
                        placeholder="Explicá el motivo por el que te parece necesario deshacer este cambio."
                    />
                </div>
                {<TickButton text={vandalismInfo} setTicked={setVandalism} ticked={vandalism} size={20} color="#455dc0" />}
                {<TickButton text={oportunismInfo} setTicked={setOportunism} ticked={oportunism} size={20} color="#455dc0" />}
                <div className="mt-4">
                    <StateButton
                        handleClick={async () => {
                            if(user.user && content){
                                const result = await undoChange(entity.id, content.id, version, explanation, user.user.id, vandalism, oportunism)
                                if(!result) return {error: "Ocurrió un error un inesperado. Es posible que el cambio se haya deshecho correctamente. Contactate con el soporte."}
                                if(result.error) return {error: result.error}
                                mutate("/api/entity/"+entity.id)
                                mutate("/api/entities")
                                onClose()
                            }
                            return {}
                        }}
                        disabled={!validExplanation(explanation)}
                        className="gray-btn w-full"
                        text1="Confirmar"
                        text2="Deshaciendo cambios..."
                    />
                </div>
            </div>
        </BaseFullscreenPopup>
    } else {
        return <AcceptButtonPanel
            onClose={onClose}
        >
            <div>
                <p>Necesitás permisos de edición para deshacer cambios.</p>
                <NoEditPermissionsMsg user={user.user} level={entity.protection}/>
            </div>
        </AcceptButtonPanel>
    }
};