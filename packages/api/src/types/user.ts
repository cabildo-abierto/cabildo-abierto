import { ArCabildoabiertoActorDefs } from "../client";
import {FilePayload, OrgType} from "./admin";
import {GetFeedOutput} from "./feed";

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


export type FollowSuggestionsOutput = GetFeedOutput<ArCabildoabiertoActorDefs.ProfileView>