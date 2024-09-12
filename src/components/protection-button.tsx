"use client"

import { setProtection } from "../actions/entities";
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
        className="article-btn"
        onClick={onClick}
        reUsable={true}
    />
}