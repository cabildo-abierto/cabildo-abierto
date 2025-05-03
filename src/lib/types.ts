import {Record as BskyPostRecord} from "@/lex-api/types/app/bsky/feed/post"
import {ProfileViewDetailed} from "@/lex-api/types/app/bsky/actor/defs";
import {ProfileViewBasic} from "@/lex-api/types/ar/cabildoabierto/actor/defs"

export type EditorStatus = "Beginner" | "Editor" | "Administrator"


export type Profile = {
    bsky: ProfileViewDetailed
    ca: CAProfile | null
}


export type CAProfile = {
    inCA: boolean
    followersCount: number
    followsCount: number
    editorStatus: EditorStatus
}


export type Session = {
    platformAdmin: boolean
    editorStatus: EditorStatus
    seenTutorial: boolean
    handle: string
    displayName: string | null
    avatar: string | null
    did: string
    hasAccess: boolean
    usedInviteCode: string | null
}


export type Account = {
    email?: string
}


export type PostRecord = BskyPostRecord
export type ATProtoStrongRef = {
    uri: string
    cid: string
}


export type FastPostReplyProps = {
    parent: ATProtoStrongRef
    root: ATProtoStrongRef
}


export type Collection =
    PostCollection |
    "ar.com.cabildoabierto.article" |
    "ar.com.cabildoabierto.topic" |
    "ar.com.cabildoabierto.vote" |
    "ar.com.cabildoabierto.visualization" |
    "ar.com.cabildoabierto.dataset" |
    "ar.com.cabildoabierto.dataBlock" |
    "app.bsky.feed.repost" |
    "app.bsky.feed.like"

export type PostCollection =
    "ar.com.cabildoabierto.quotePost" |
    "app.bsky.feed.post"


export type TopicVersionAuthorsProps = {
    text: string
    format: string
}


export type TopicsGraph = {
    nodeIds: string[]
    edges: {x: string, y: string}[]
    nodeLabels?: {id: string, label: string}[]
}


export type BothContributionsProps = {
    monetized: [string, number][]
    all: [string, number][]
}


export type ContributionsProps = [string, number][]


export type SubscriptionProps = {
    id: string
    userId?: string
    createdAt: Date
    boughtByUserId: string
    usedAt: Date | null
    endsAt: Date | null
    price: number
}


export type MessageProps = {
    createdAt: Date,
    id: string,
    text: string,
    fromUserId: string,
    toUserId: string,
    seen: boolean
}


export type UserStats = {
    posts: number
    entityEdits: number
    editedEntities: number
    reactionsInPosts: number
    reactionsInEntities: number
    income: number
    pendingConfirmationIncome: number
    pendingPayIncome: number
    entityAddedChars: number
    viewsInPosts: number
    viewsInEntities: number
}


export type MatchesType = {
    matches: {x: number, y: number}[]
    common: {x: number, y: number}[]
    perfectMatches: {x: number, y: number}[]
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