"use client"

import { EditorState } from "lexical";
import Link from "next/link";
import React, { useState } from "react";
import { useUser } from "../app/hooks/user";
import { EntityProps } from "../app/lib/definitions";
import { AcceptButtonPanel } from "./accept-button-panel";
import { charDiffFromJSONString, getAllText } from "./diff";
import InfoPanel from "./info-panel";
import { NotEnoughPermissionsWarning } from "./permissions-warning";
import StateButton from "./state-button";
import TickButton from "./tick-button";
import { hasEditPermission } from "./utils";

export const SaveEditPopup = ({ 
    editorState, currentVersion, onClose, onSave, entity }: {
        editorState: EditorState,
        currentVersion: string
        onClose: () => void,
        onSave: (v: boolean) => void,
        entity: EntityProps
}) => {
    const [claimsAuthorship, setClaimsAuthorship] = useState(true)
    const {user} = useUser()
    const jsonState = JSON.stringify(editorState)
    const d = charDiffFromJSONString(currentVersion, jsonState)
    
    const infoAuthorship = <span className="link">Desactivá este tick si no sos el autor de los cambios que agregaste. Por ejemplo, si estás sumando al artículo el texto de una Ley, o algo escrito por otra persona. Si lo desactivás no vas a obtener ingresos por los caracteres agregados en esta modificación. <Link href="/articulo/Cabildo_Abierto:_Derechos_de_autor">Más información</Link>
    </span>

    const newVersionSize = getAllText(JSON.parse(jsonState).root).length

    if(newVersionSize > 500000){
        return <AcceptButtonPanel
            text={<span>No se pueden guardar los cambios porque el artículo supera el límite de 500.000 caracteres (con <span className="text-red-600">{newVersionSize}</span> caracteres). Te sugerimos que separes el contenido en secciones en distintos artículos.</span>}
            onClose={onClose}
        />
    }

    return (
        <>
            <div className="fixed inset-0 z-10 flex justify-center items-center">
                
                <div className="bg-[var(--background)] rounded border-2 border-black p-4 z-10 text-center max-w-lg">
                    <h2 className="py-4 text-lg">Confirmar cambios</h2>
                    <div className="mb-8">
                        Estás agregando <span className="text-green-600">{d.charsAdded}</span> caracteres y eliminando <span className="text-red-600">{d.charsDeleted}</span> caracteres.
                    </div>
                    {!hasEditPermission(user, entity.protection) && <div className="mb-8">
                    <NotEnoughPermissionsWarning entity={entity}/>
                    </div>}
                    {true && <div className="flex justify-center">
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
                            onClick={async (e) => {await onSave(claimsAuthorship); onClose(); return true}}
                            text1="Confirmar"
                            text2="Guardando..."
                        />
                    </div>
                </div>
            </div>
        </>
    );
};