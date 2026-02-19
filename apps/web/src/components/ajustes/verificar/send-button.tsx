import {useQueryClient} from "@tanstack/react-query";
import {post} from "../../utils/react/fetch";
import { LoadingValidationRequest } from "./types";
import {useCallback, useState} from "react";
import {StateButton} from "@/components/utils/base/state-button"
import {AcceptButtonPanel} from "../../utils/dialogs/accept-button-panel";
import {ConfettiIcon} from "@phosphor-icons/react";
import {ValidationRequestProps} from "@cabildo-abierto/api";




function validateSubmission(request: LoadingValidationRequest): { success: true, request: ValidationRequestProps } | {
    success: false,
    error: string
} {
    if (request.tipo == "persona") {
        if (request.metodo == "dni" && request.dniDorso != undefined && request.dniFrente != undefined) {
            return {
                success: true,
                request: {
                    tipo: "persona",
                    metodo: "dni",
                    dniFrente: request.dniFrente,
                    dniDorso: request.dniDorso
                }
            }
        }
    } else if (request.tipo == "org") {
        if (request.tipoOrg != undefined) {
            return {
                success: true,
                request: {
                    tipo: "org",
                    tipoOrg: request.tipoOrg,
                    sitioWeb: request.sitioWeb,
                    email: request.email,
                    documentacion: request.documentacion,
                    comentarios: request.comentarios
                }
            }
        } else {
            return {
                success: false,
                error: "Elegí un tipo de organización."
            }
        }
    } else {
        return {
            success: false,
            error: "Elegí un tipo de cuenta."
        }
    }
}



export const SendButton = ({request}: {
    request: LoadingValidationRequest
}) => {
    const [requestSent, setRequestSent] = useState(false)
    const qc = useQueryClient()

    const validationRes = validateSubmission(request)

    const onSubmit = useCallback(async () => {
        if (validationRes.success === true) {
            const res = await post<ValidationRequestProps, {}>(
                "/validation-request",
                validationRes.request
            )
            if (res.success === true) {
                setRequestSent(true)
                return {}
            } else {
                return {error: res.error}
            }
        } else {
            return {error: validationRes.error}
        }
    }, [validationRes])

    return <>
        <StateButton
            handleClick={onSubmit}
            variant={"outlined"}
            disabled={validationRes.success != true}
        >
            Enviar
        </StateButton>
        {requestSent && validationRes.success && <AcceptButtonPanel
            onClose={() => {
                setRequestSent(false);
                qc.setQueryData(["validation-request"], {type: validationRes.request.tipo, result: "Pendiente"})
            }}
            open={requestSent}
        >
            <div className={"flex flex-col items-center space-y-4 pb-6"}>
                <div className={"text-[var(--text-light)] text-lg"}>
                    <ConfettiIcon fontSize={"22px"}/>
                </div>
                <h2 className={"normal-case"}>
                    Solicitud enviada
                </h2>
                <div className={"w-full"}>
                    En un plazo de {request.tipo == "org" ? 72 : 48} horas te va a llegar una notificación con el
                    resultado.
                </div>
            </div>
        </AcceptButtonPanel>}
    </>
}