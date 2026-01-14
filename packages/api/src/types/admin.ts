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
    authorStatus: string | null
    lastReadSession: Date | null
    verification: ValidationState
}