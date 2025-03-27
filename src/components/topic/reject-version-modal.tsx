import React, { useState } from 'react';
import TickButton from '../ui-utils/tick-button';
import StateButton from '../ui-utils/state-button';
import InfoPanel from '../ui-utils/info-panel';
import { BaseFullscreenPopup } from '../ui-utils/base-fullscreen-popup';
import {TextField} from "@mui/material";
import {rejectEdit} from "../../actions/topic/votes";
import {useSWRConfig} from "swr";
import {ATProtoStrongRef} from "../../app/lib/definitions";


export function validExplanation(text: string) {
    return text.length > 0
}


export const RejectVersionModal = ({ open, onClose, topicId, versionRef }: {
    open: boolean
    onClose: () => void
    versionRef: ATProtoStrongRef
    topicId: string
}) => {
    const [explanation, setExplanation] = useState("")
    const [vandalism, setVandalism] = useState(false)
    const [oportunism, setOportunism] = useState(false)
    const {mutate} = useSWRConfig()

    const infoPanelVandalism = <span>Si te parece que empeoró la calidad del contenido intencionalmente.</span>

    const infoPanelOportunism = <span>Si te parece que intentó obtener un rédito económico desproporcionado con respecto a la mejora que representa en el contenido.</span>

    const vandalismInfo = <span className="text-sm text-[var(--text-light)]">Marcar como vandalismo <InfoPanel text={infoPanelVandalism} className="w-72"/></span>

    const oportunismInfo = <span className="text-sm text-[var(--text-light)]">Marcar como oportunismo <InfoPanel text={infoPanelOportunism} className="w-72"/></span>

    const onReject = async () => {
        const {error} = await rejectEdit(topicId, versionRef)
        if(error) return {error}
        mutate("/api/topic/"+topicId)
        mutate("/api/topic-history/"+topicId)
        onClose()
        return {}
    }

    return <BaseFullscreenPopup open={open} closeButton={true} onClose={onClose}>
        <div className="space-y-6 px-6 pt-2 mb-4 flex flex-col items-center min-w-96">
            <h3>
                Rechazar versión
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
                    handleClick={onReject}
                    disabled={!validExplanation(explanation)}
                    disableElevation={true}
                    text1="Confirmar"
                />
            </div>
        </div>
    </BaseFullscreenPopup>
}