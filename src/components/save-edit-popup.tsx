"use client"

import { EditorState } from "lexical";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useUser } from "../app/hooks/user";
import { EntityProps } from "../app/lib/definitions";
import { AcceptButtonPanel } from "./accept-button-panel";
import { charDiffFromJSONString, getAllText } from "./diff";
import InfoPanel from "./info-panel";
import { NotEnoughPermissionsWarning } from "./permissions-warning";
import StateButton from "./state-button";
import TickButton from "./tick-button";
import { articleUrl, hasEditPermission } from "./utils";


const EditMessageInput = ({value, setValue}: {value: string, setValue: (v: string) => void}) => {
    return <input
        className="custom-input"
        value={value}
        onChange={(e) => {setValue(e.target.value)}}
        placeholder="Una descripción de lo que cambiaste (opcional)"
        maxLength={50}
    />
}


export const SaveEditPopup = ({ 
    editorState, currentVersion, onClose, onSave, entity, errorOnSubmit }: {
        editorState: EditorState,
        currentVersion: string
        onClose: () => void
        onSave: (v: boolean, editMsg: string) => Promise<boolean>,
        entity: EntityProps
        errorOnSubmit: boolean
}) => {
    const [claimsAuthorship, setClaimsAuthorship] = useState(true)
    const {user} = useUser()
    const [editMsg, setEditMsg] = useState("")
    const [diff, setDiff] = useState(undefined)
    const [newVersionSize, setNewVersionSize] = useState(undefined)

    useEffect(() => {
        const jsonState = JSON.stringify(editorState)
        const d = charDiffFromJSONString(currentVersion, jsonState)
        setDiff(d)
        setNewVersionSize(getAllText(JSON.parse(jsonState).root).length)
    }, [])
    
    const infoAuthorship = <span className="link">Desactivá este tick si no sos el autor de los cambios que agregaste. Por ejemplo, si estás sumando al tema el texto de una Ley, o algo escrito por otra persona. Al desactivarlo no vas a obtener ingresos por los caracteres agregados en esta modificación. <Link href={articleUrl("Cabildo_Abierto:_Derechos_de_autor")}>Más información</Link>
    </span>

    if(!newVersionSize){
        return null
    }


    if(newVersionSize > 1200000){
        return <AcceptButtonPanel
            text={<span>No se pueden guardar los cambios porque el tema supera el límite de 1.200.000 caracteres (con <span className="text-red-600">{newVersionSize}</span> caracteres). Te sugerimos que separes el contenido en secciones en distintos temas.</span>}
            onClose={onClose}
        />
    }

    return (
        <>
            <div className="fixed inset-0 z-10 flex justify-center items-center px-1">
                
                <div className="bg-[var(--background)] rounded border-2 border-black p-4 z-10 text-center max-w-lg w-full">
                    <h2 className="py-4 text-lg">Confirmar cambios</h2>
                    {diff && <div className="mb-8">
                        Estás agregando <span className="text-green-600">{diff.charsAdded}</span> caracteres y eliminando <span className="text-red-600">{diff.charsDeleted}</span> caracteres.
                    </div>}
                    <div className="flex justify-center mb-8">
                        <EditMessageInput value={editMsg} setValue={setEditMsg}/>
                    </div>
                    {!hasEditPermission(user, entity.protection) && <div className="mb-8">
                    <NotEnoughPermissionsWarning entity={entity}/>
                    </div>}
                    <div className="flex justify-center">
                        <TickButton
                            ticked={claimsAuthorship}
                            setTicked={setClaimsAuthorship}
                            text={<span className="text-sm text-gray-700">Soy autor/a de los caracteres agregados. <InfoPanel text={infoAuthorship} className="w-72"/></span>}
                        />
                    </div>
                    <div className="flex justify-center items-center space-x-4 mt-4">
                        <button
                            className="gray-btn w-48"
                            onClick={async () => {onClose()}}
                        >
                            Volver
                        </button>
                        <StateButton
                            className="gray-btn w-48"
                            handleClick={async (e) => {
                                return await onSave(claimsAuthorship, editMsg)}}
                            text1="Confirmar"
                            text2="Guardando..."
                        />
                    </div>
                    {errorOnSubmit && <div className="text-center text-red-600 text-sm">Ocurrió un error al guardar los cambios. Intentá nuevamente.</div>}
                </div>
            </div>
        </>
    );
};