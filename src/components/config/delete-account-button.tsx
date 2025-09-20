import React, {useState} from "react";
import {logout} from "@/components/layout/auth/close-session-button";
import {Button} from "../../../modules/ui-utils/src/button";
import {post} from "@/utils/fetch";
import {useQueryClient} from "@tanstack/react-query";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {BaseFullscreenPopup} from "../../../modules/ui-utils/src/base-fullscreen-popup";
import {TextField} from "@mui/material";
import StateButton from "../../../modules/ui-utils/src/state-button";
import {useRouter} from "next/navigation";


export const DeleteAccountButton = () => {
    const [deletingAccount, setDeletingAccount] = useState<boolean>(false)
    const [text, setText] = useState("")
    const qc = useQueryClient()
    const router = useRouter()

    async function onClick() {
        const {error} = await post<{}, {}>("/delete-ca-profile", {})
        if(error) return {error}
        return await logout(qc, router)
    }

    return <div>
        <Button
            color={"background-dark2"}
            startIcon={<DeleteOutlineIcon/>}
            onClick={() => {setDeletingAccount(true)}}
            borderColor={"text-lighter"}
        >
            Borrar cuenta
        </Button>
        {deletingAccount && <BaseFullscreenPopup open={deletingAccount} onClose={() => {setDeletingAccount(false)}} closeButton={true}>
            <div className={"pb-4 flex flex-col items-center w-[400px] text-[var(--text-light)] px-8 space-y-4"}>
                <h2>
                    Borrar cuenta
                </h2>
                <div className={"text-sm space-y-2"}>
                    <p>
                        Tu cuenta va a dejar de ser parte de Cabildo Abierto pero no se va a borrar ningún contenido de tu repositorio personal de datos.
                    </p>
                    <p>
                        Esta decisión es reversible. Si querés borrar definitivamente todos tus datos escribinos a soporte@cabildoabierto.ar.
                    </p>
                    <p>
                        {'Escribí "borrarcuenta" para confirmar.'}
                    </p>
                </div>
                <div className={"w-full"}>
                    <TextField
                        fullWidth
                        size={"small"}
                        value={text}
                        onChange={(e) => {setText(e.target.value)}}
                    />
                </div>
                <div className={"flex justify-end w-full"}>
                    <StateButton
                        color={"red-dark"}
                        handleClick={onClick}
                        disabled={text != "borrarcuenta"}
                        text1={"Confirmar"}
                    />
                </div>
            </div>
        </BaseFullscreenPopup>}
    </div>
}