import { ArCabildoabiertoActorDefs } from "../client";
import {FilePayload, OrgType} from "./admin";

export type DNIValidationRequestProps = {
    tipo: "persona"
    metodo: "dni"
    dniFrente: FilePayload
    dniDorso: FilePayload
}

export type MPValidationRequestProps = {
    tipo: "persona"
    metodo: "mp"
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


export type UserGuideGoal = {
    label: string
    progress: number
    objective: number
    detail?: string
}

export type UserGuideStatus = UserGuideGoal[]

export type CreateUserEventBody = {
    eventId: string
}

export type CreateUserEventOutput = {
    id: string
}
