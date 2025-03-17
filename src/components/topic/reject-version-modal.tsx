import React, { useState } from 'react';
import TickButton from '../ui-utils/tick-button';
import StateButton from '../ui-utils/state-button';
import { useUser } from '../../hooks/user';
import { TopicProps } from '../../app/lib/definitions';
import InfoPanel from '../ui-utils/info-panel';
import { NoEditPermissionsMsg } from './no-edit-permissions-msg';
import { AcceptButtonPanel } from '../ui-utils/accept-button-panel';
import { BaseFullscreenPopup } from '../ui-utils/base-fullscreen-popup';
import { NeedAccountPopup } from "../auth/need-account-popup";
import {getFullTopicTitle, hasEditPermission} from "./utils";
import {TextField} from "@mui/material";



export function validExplanation(text: string) {
    return text.length > 0
}

export const RejectVersionModal = ({ open, onClose, topic, version }: {
    open: boolean
    onClose: () => void
    topic: TopicProps
    version: number
}) => {
    const user = useUser()
    const [explanation, setExplanation] = useState("")
    const [vandalism, setVandalism] = useState(false)
    const [oportunism, setOportunism] = useState(false)

    const infoPanelVandalism = <span>Si te parece que empeoró la calidad del contenido intencionalmente.</span>

    const infoPanelOportunism = <span>Si te parece que intentó obtener un rédito económico desproporcionado con respecto a la mejora que representa en el contenido.</span>

    const vandalismInfo = <span className="text-sm">Marcar como vandalismo <InfoPanel text={infoPanelVandalism} className="w-72"/></span>

    const oportunismInfo = <span className="text-sm">Marcar como oportunismo <InfoPanel text={infoPanelOportunism} className="w-72"/></span>

    if(hasEditPermission(user.user, topic.protection)){
        return <BaseFullscreenPopup open={open} closeButton={true} onClose={onClose}>
            <div className="space-y-6 px-6 pt-2 mb-4 flex flex-col items-center">
                <h3>
                    Deshacer el último cambio en {getFullTopicTitle(topic)}
                </h3>
                <div className="w-full">
                    <TextField
                        size={"small"}
                        label={"Motivo"}
                        minRows={4}
                        multiline={true}
                        fullWidth={true}
                        value={explanation}
                        onChange={(e) => {setExplanation(e.target.value)}}
                        placeholder="Explicá por qué te parece necesario deshacer este cambio."
                    />
                </div>
                <div className="w-full flex flex-col space-y-2">
                <TickButton
                    text={vandalismInfo}
                    setTicked={setVandalism}
                    ticked={vandalism}
                    size={20}
                    color="#455dc0"
                />
                <TickButton
                    text={oportunismInfo}
                    setTicked={setOportunism}
                    ticked={oportunism}
                    size={20}
                    color="#455dc0"
                />
                </div>
                <div className="">
                    <StateButton
                        handleClick={async () => {
                            /*if(user.user && content){
                                const result = await undoChange(entity.id, content.id, version, explanation, user.user.did, vandalism, oportunism)
                                if(!result) return {error: "Ocurrió un error un inesperado. Es posible que el cambio se haya deshecho correctamente. Contactate con el soporte."}
                                if(result.error) return {error: result.error}
                                mutate("/api/entity/"+entity.id)
                                mutate("/api/entities")
                                onClose()
                            }*/
                            return {}
                        }}
                        disabled={!validExplanation(explanation)}
                        disableElevation={true}
                        text1="Confirmar"
                        text2="Deshaciendo cambios..."
                    />
                </div>
            </div>
        </BaseFullscreenPopup>
    } else {
        return <AcceptButtonPanel
            open={true}
            onClose={onClose}
        >
            <div>
                <p>Necesitás permisos de edición para deshacer cambios.</p>
                <NoEditPermissionsMsg user={user.user} level={topic.protection}/>
            </div>
        </AcceptButtonPanel>
    }
};