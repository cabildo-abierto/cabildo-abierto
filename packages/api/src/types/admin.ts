import { ArCabildoabiertoActorDefs } from "../client";
import {ValidationState} from "./session";

export type StatsDashboard = {
    counts: {
        registered: number
        active: number
        verified: number
        verifiedActive: number
        verifiedHuman: number
        totalArticles: number
        humanArticles: number
        totalEdits: number
        humanEdits: number
        totalEnDiscusion: number
        humanEnDiscusion: number
    },
    stats: {
        label: string
        data: {
            date: Date
            value: number
        }[]
    }[]
    users: StatsDashboardUser[]
}


export type StatsDashboardUser = {
    handle: string | null
    did: string
    email: string | null
    created_at: Date | null
    ca_created_at: Date | null
    authorStatus: string | null
    lastReadSession: Date | null
    verification: ValidationState
}


export type OrgType = "creador-individual" | "empresa" | "medio" | "fundacion" | "consultora" | "otro"


export type FilePayload = {
    base64: string
    fileName: string
}


export type ValidationRequestView = {
    id: string
    user: ArCabildoabiertoActorDefs.ProfileViewBasic
    createdAt: Date
} & ({
    tipo: "persona"
    dniFrente: FilePayload | null
    dniDorso: FilePayload | null
} | {
    tipo: "org"
    tipoOrg: OrgType
    sitioWeb?: string
    email?: string
    documentacion: FilePayload[]
    comentarios?: string
})


export type WorkerState = {
    counts: {
        waiting: number
        active: number
        completed: number
        failed: number
        delayed: number
        prioritized: number
    }
    waitingJobs: {
        id: string | undefined
        name: string
        timestamp: number | undefined
        processedOn: number | undefined
    }[]
    prioritizedJobs: {
        id: string | undefined
        name: string
        timestamp: number | undefined
        processedOn: number | undefined
    }[]
    delayedJobs: {
        id: string | undefined
        name: string
        timestamp: number | undefined
        processedOn: number | undefined
    }[]
    activeJobs: {
        id: string | undefined
        name: string
        timestamp: number | undefined
        processedOn: number | undefined
    }[]
    failedJobs: {
        id: string | undefined
        name: string
        failedReason: string | undefined
        timestamp: number | undefined
        finishedOn: number | undefined
    }[]
    scheduledJobs: {
        name: string | undefined
        every: number | undefined
        next: number | undefined
    }[]
    registeredJobs: string[]
    paused: boolean
}