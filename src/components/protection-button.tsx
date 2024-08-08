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
        className="py-1 px-4 rounded transition duration-200 bg-gray-200 hover:bg-gray-300 cursor-pointer"
        onClick={async () => {await setProtection(entity.id, otherProtection(protection));}}
    />
}