import {useAPI} from "@/queries/utils";
import {ValidationRequestView} from "@/components/admin/admin-validation";
import {StatsDashboard} from "@/components/admin/stats";


type AccessRequest = {
    id: string
    email: string
    comment: string
    createdAt: Date
    sentInviteAt: Date | null
}

export function useAccessRequests() {
    return useAPI<AccessRequest[]>("/access-requests", ["access-requests"])
}


export const usePendingValidationRequests = () => {
    const res = useAPI<{requests: ValidationRequestView[], count: number}>("/pending-validation-requests", ["pending-validation-requests"])
    return {...res, user: res.data}
}


export function useStatsDashboard() {
    return useAPI<StatsDashboard>("/stats-dashboard", ["stats-dashboard"])
}


export type ActivityStats = {
    did: string
    handle: string
    articles: number
    topicVersions: number
    enDiscusion: number
}[]

export function useActivityStats() {
    return useAPI<ActivityStats>("/activity-stats", ["activity-stats"])
}


export type UserSyncStatus = {
    did: string
    handle: string | null
    mirrorStatus: string | null
    CAProfile: {
        createdAt: Date
    } | null
}

export function useUsersSyncStatus() {
    return useAPI<UserSyncStatus[]>("/sync-status", ["sync-status"])
}
