import {useAPI} from "@/components/utils/react/queries";
import {ValidationRequestView} from "@cabildo-abierto/api";


type AccessRequest = {
    id: string
    email: string
    comment: string
    createdAt: Date
    sentInviteAt: Date | null
    markedIgnored: boolean
}

export function useAccessRequests() {
    return useAPI<AccessRequest[]>("/access-requests", ["access-requests"])
}


export const usePendingValidationRequests = () => {
    const res = useAPI<{requests: ValidationRequestView[], count: number}>("/pending-validation-requests", ["pending-validation-requests"])
    return {...res, user: res.data}
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


export type AdminNotificationCounts = {
    unsentAccessRequests: number
    pendingValidationRequests: number
    unseenJobApplications: number
}

export function useAdminNotificationCounts() {
    return useAPI<AdminNotificationCounts>("/notification-counts", ["admin-notification-counts"])
}


export type JobApplication = {
    id: string
    name: string
    email: string
    comment: string
    cvFileName: string | null
    job: string
    createdAt: Date
    seen: boolean
}

export function useJobApplications() {
    return useAPI<JobApplication[]>("/job-applications", ["job-applications"])
}
