"use client"
import {post} from "@/utils/fetch";
import {
    CheckIcon,
    HourglassIcon,
    TrashIcon
} from "@phosphor-icons/react";
import StateButton from "../../../../components/layout/utils/state-button";
import {useCurrentValidationRequest} from "@/queries/getters/useValidation";
import {useQueryClient} from "@tanstack/react-query";


const Page = () => {
    const {data: curRequest} = useCurrentValidationRequest()
    const qc = useQueryClient()

    async function onCancel() {
        const {error} = await post<{}, {}>("/validation-request/cancel", {})
        if (!error) {
            qc.setQueryData(["validation-request"], {type: null})
        }
        return {error}
    }

    return <>
        {curRequest && curRequest.result == "Aceptada" &&
            <div className={"flex flex-col items-center space-y-4 p-8 bg-[var(--background-dark)] rounded-lg"}>
                <div
                    className={"h-16 w-16 rounded-full bg-[var(--background-dark2)] flex items-center justify-center text-green-400"}>
                    <CheckIcon fontSize={24}/>
                </div>
                <div className={"text-lg text-[var(--text-light)] font-semibold"}>
                    Tu cuenta ya está verificada
                </div>
            </div>}
        {curRequest && curRequest.type && curRequest.result == "Pendiente" && <div>
            <div className={"bg-[var(--background-dark)] p-4 w-full space-y-8 flex flex-col items-center"}>
                <div>
                    <HourglassIcon/>
                </div>
                <h2 className={"normal-case"}>
                    Estamos procesando tu solicitud
                </h2>
                <div className={"text-center text-[var(--text-light)]"}>
                    <p>
                        Solicitaste una verificación de
                        cuenta {curRequest.type == "persona" ? "personal" : "de organización"}. En un plazo
                        de {curRequest.type == "org" ? 72 : 48} horas te va a llegar una notificación con el
                        resultado.
                    </p>
                </div>
                <div className={"flex justify-end w-full"}>
                    <StateButton
                        endIcon={<TrashIcon/>}
                        size={"small"}
                        handleClick={onCancel}
                    >
                        Cancelar solicitud
                    </StateButton>
                </div>
            </div>
        </div>}
    </>
}


export default Page