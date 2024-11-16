"use client"

import { setProtection } from "../actions/admin";
import { articleButtonClassname } from "./editor/wiki-editor";
import StateButton from "./state-button";

function protectionToName(protection: string){
    if(protection == "Administrator") {
        return "Administrador"
    } else {
        return "Sin protección"
    }
}

function otherProtection(protection: string) {
    return protection == "Administrator" ? "Beginner" : "Administrator"
}

export const SetProtectionButton = ({entity} : {entity: {id: string, protection: string}}) => {
    const protection = entity.protection
    
    async function onClick(){
        await setProtection(entity.id, otherProtection(protection))
        return {}
    }

    return <StateButton
        text1={"Cambiar protección a " + protectionToName(otherProtection(protection))}
        text2={"Cambiando..."}
        variant="text"
        handleClick={onClick}
    />
}