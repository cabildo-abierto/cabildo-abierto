import {FilePayload} from "@/utils/files";


export type OrgType = "creador-individual" | "empresa" | "medio" | "fundacion" | "consultora" | "otro"

export type DNIValidationRequestProps = {
    tipo: "persona"
    metodo: "dni"
    dniFrente: FilePayload
    dniDorso: FilePayload
}

export type MPValidationRequestProps = {
    tipo: "persona"
    metodo: "mercadopago"
}

export type OrgValidationRequestProps = {
    tipo: "org"
    tipoOrg: OrgType
    sitioWeb: string
    email: string
    documentacion: FilePayload[]
    comentarios: string
}

export type ValidationRequestProps = DNIValidationRequestProps | MPValidationRequestProps | OrgValidationRequestProps


export type LoadingValidationRequest = Partial<ValidationRequestProps>