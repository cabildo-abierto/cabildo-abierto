import {EditorStatus} from "@prisma/client";
import {AlgorithmConfig} from "#/services/user/users.js";
import {MirrorStatus} from "#/services/redis/cache.js";


export type ATProtoStrongRef = {
    uri: string
    cid: string
}

export type ValidationState = "org" | "persona" | null

export type CAProfileDetailed = {
    did: string
    caProfile: string | null
    followersCount: number
    followsCount: number
    articlesCount: number
    editsCount: number
    editorStatus: EditorStatus
    verification: ValidationState
}


export type CAProfile = {
    did: string
    avatar: string | null
    handle: string
    displayName: string | null
    createdAt: Date
    caProfile: string | null
    editorStatus: EditorStatus
    verification: ValidationState
    description: string | null
    viewer: {
        following: string | null,
        followedBy: string | null
    }
}


export type AuthorStatus = {
    isAuthor: boolean
    seenAuthorTutorial: boolean
}

export type Session = {
    platformAdmin: boolean
    authorStatus: AuthorStatus | null
    editorStatus: EditorStatus
    seenTutorial: {
        topics: boolean
        home: boolean
        topicMinimized: boolean
        topicMaximized: boolean
    }
    seenVerifiedNotification: boolean
    caProfile: string | null
    handle: string
    displayName: string | null
    avatar: string | null
    did: string
    hasAccess: boolean
    validation: ValidationState
    algorithmConfig: AlgorithmConfig
    mirrorStatus: MirrorStatus
}


export type Account = {
    email?: string
}


export type TopicsGraph = {
    nodeIds: string[]
    edges: {x: string, y: string}[]
    data?: {id: string, categorySize?: number}[]
}


export type PlotConfigProps = {
    datasetUri?: string
    filters?: FilterProps[]
    kind?: string
    [key: string]: any
}


export type FilterProps = {
    value: any
    op: string
    column: string
}


export type JetstreamEvent = UpdateEvent | AccountEvent | IdentityEvent | CommitEvent


export type UpdateEvent = {
    kind: "update"
    did: string
    time_us: number
}


export type AccountEvent = {
    kind: "account"
    did: string
    time_us: number
}


export type IdentityEvent = {
    kind: "identity"
    did: string
    time_us: number
    identity: {
        did: string
        handle: string
        seq: number
        time: string
    }
}

export type CommitEvent = {
    kind: "commit"
    did: string
    time_us: number
    commit: {
        rev: string
        collection: string
        rkey: string
        cid: string
    } & (CreateCommit | DeleteCommit | UpdateCommit)
}


export type CreateCommit = {
    operation: "create"
    record: any
}


export type DeleteCommit = {
    operation: "delete"
}


export type UpdateCommit = {
    operation: "update"
    record: any
}