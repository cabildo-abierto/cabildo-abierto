"use client"

import { setProtection } from "src/actions/actions";
import StateButton from "./state-button";

function protectionToName(protection: string){
    if(protection == "Administrator") {
        return "Administrador"
    } else {
        return "Sin protección"
    }
}

function otherProtection(protection: string) {
    return protection == "Administrator" ? "Unprotected" : "Administrator"
}

export const SetProtectionButton = ({entity} : any) => {
    const protection = entity.protection
    
    async function onClick(){
        await setProtection(entity.id, otherProtection(protection))
    }

    return <StateButton
        text1={"Cambiar protección a " + protectionToName(otherProtection(protection))}
        text2={"Cambiando..."}
        className="gray-btn"
        onClick={onClick}
        reUsable={true}
    />
}