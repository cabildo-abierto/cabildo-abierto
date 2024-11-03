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
import { ChangesCounter, ChangesCounterWithText } from "./changes-counter";


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
    editorState, currentVersion, onClose, onSave, entity }: {
        editorState: EditorState,
        currentVersion: string
        onClose: () => void
        onSave: (v: boolean, editMsg: string) => Promise<{error?: string}>,
        entity: EntityProps
}) => {
    const [claimsAuthorship, setClaimsAuthorship] = useState(true)
    const {user} = useUser()
    const [editMsg, setEditMsg] = useState("")
    const [diff, setDiff] = useState(undefined)
    const [newVersionSize, setNewVersionSize] = useState(undefined)

    useEffect(() => {
        const jsonState = JSON.stringify(editorState)
        const d = charDiffFromJSONString(currentVersion, jsonState, true)

        if(!d){
            setDiff("too big")
        }
        
        setNewVersionSize(getAllText(JSON.parse(jsonState).root).length)
        setDiff(d)
    }, [])
    
    const infoAuthorship = <span className="link">Desactivá este tick si no sos autor/a de los cambios que agregaste. Por ejemplo, si estás sumando al tema el texto de una ley, o algo escrito por otra persona. Si no estás seguro/a no te preocupes, se puede cambiar después. <Link href={articleUrl("Cabildo_Abierto:_Temas")}>Más información</Link>
    </span>

    if(!newVersionSize){
        return null
    }

    if(newVersionSize > 1200000){
        return <AcceptButtonPanel
            onClose={onClose}
        >
            <span>No se pueden guardar los cambios porque el tema supera el límite de 1.200.000 caracteres (con <span className="text-red-600">{newVersionSize}</span> caracteres). Te sugerimos que separes el contenido en secciones en distintos temas.</span>
        </AcceptButtonPanel>
    }

    return (
        <>
            <div className="fixed inset-0 z-10 flex justify-center items-center px-1">
                
                <div className="bg-[var(--background)] rounded border-2 border-black p-4 z-10 text-center max-w-lg w-full">
                    <h2 className="py-4 text-lg">Confirmar cambios</h2>
                    {diff !== "too big" && diff != undefined && <div className="mb-8">
                        <ChangesCounterWithText charsAdded={diff.charsAdded} charsDeleted={diff.charsDeleted}/>
                    </div>}
                    {diff === "too big" && <div className="text-red-600 text-xs mb-8  sm:text-sm">Parece que hay demasiadas diferencias entre las dos versiones. Probá eliminar primero el contenido y después agregar el contenido nuevo.</div>
                    }

                    <div className="flex justify-center mb-8">
                        <EditMessageInput value={editMsg} setValue={setEditMsg}/>
                    </div>
                    {!hasEditPermission(user, entity.protection) && <div className="mb-8">
                    <NotEnoughPermissionsWarning entity={entity}/>
                    </div>}
                    {diff !== "too big" && diff != undefined && diff.charsAdded > 0 && <div className="flex justify-center">
                        <TickButton
                            ticked={claimsAuthorship}
                            setTicked={setClaimsAuthorship}
                            text={<span className="text-sm text-gray-700">Soy autor/a de los caracteres agregados. <InfoPanel text={infoAuthorship} className="w-72"/></span>}
                        />
                    </div>}
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
                                return await onSave(claimsAuthorship, editMsg)}
                            }
                            text1="Confirmar"
                            text2="Guardando..."
                            disabled={diff === "too big"}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};