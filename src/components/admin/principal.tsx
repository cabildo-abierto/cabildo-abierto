"use client"


import {AdminSection} from "@/components/admin/admin-section";
import {useState} from "react";
import {TextField} from "@mui/material";
import {post} from "@/utils/fetch";
import { Button } from "../../../modules/ui-utils/src/button";
import StateButton from "../../../modules/ui-utils/src/state-button";

export const AdminPrincipal = () => {
    const [route, setRoute] = useState("")

    async function onSendPost(){
        await post<{}, {}>(route)
        return {}
    }

    return <div className={"pt-16 space-y-8"}>
        <AdminSection title="Enviar POST">
            <div className={"flex space-x-4 justify-center"}>
                <TextField
                    label={"Ruta"}
                    value={route}
                    size={"small"}
                    onChange={(e) => {setRoute(e.target.value)}}
                />
                <StateButton handleClick={onSendPost} text1={"Enviar"}/>
            </div>
        </AdminSection>
    </div>
}