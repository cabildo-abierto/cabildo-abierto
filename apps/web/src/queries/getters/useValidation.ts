import {useAPI} from "@/components/utils/react/queries";

export type ValidationRequestStatus = {
    type: "org" | "persona" | null,
    result?: "Aceptada" | "Rechazada" | "Pendiente"
}

export const useCurrentValidationRequest = () => {
    const res = useAPI<ValidationRequestStatus>("/validation-request", ["validation-request"])
    return {...res, user: res.data}
}