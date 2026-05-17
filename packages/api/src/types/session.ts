
export type AuthorStatus = {
    isAuthor: boolean
    seenAuthorTutorial: boolean
}


export type AlgorithmConfig = {}


export type MirrorStatus = "Sync" | "Dirty" | "InProcess" | "Failed" | "Failed - Too Large"

export type VerificationState = "org" | "persona" | string | null

export type FeedTabView = {
    idOrUri: string
    displayName: string
}


export type APISuccess<T> = {
    success: true
    value: T
}


export type APIError<T> = {
    success: false
    error: string
}


export type APIResult<T> = APISuccess<T> | APIError<T>


export type MaybeSession = Session | {active: false}


export type Session = {
    active: true
    platformAdmin: boolean
    handle: string
    displayName: string | null
    avatar: string | null
    did: string
    hasAccess: boolean
    validation: VerificationState
    mirrorStatus: MirrorStatus
}

export type Account = {
    email?: string
    emailVerified?: boolean
    subscribedToEmailUpdates: boolean
    endpoint: string | null
}


export type LoginParams = {
    handle: string
    code?: string
}


export type LoginOutput = {
    url: string
}

export type SignupParams = {
    handle: string
    email: string
    /** YYYY-MM-DD  */
    dateOfBirth: string
    password: string
    code: string
}


export type SignupOutput = {
    did: string
    redirectUrl?: string
}