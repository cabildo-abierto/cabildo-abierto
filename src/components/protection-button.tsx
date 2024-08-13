"use client"

import { UserProps } from "@/actions/get-user";
import StateButton from "./state-button";
import { setProtection } from "@/actions/protection";

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
    return <StateButton
        text1={"Cambiar protección a " + protectionToName(otherProtection(protection))}
        text2={"Cambiando..."}
        className="gray-btn"
        onClick={async () => {await setProtection(entity.id, otherProtection(protection));}}
    />
}