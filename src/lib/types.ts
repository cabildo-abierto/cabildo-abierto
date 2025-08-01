import {Record as BskyPostRecord} from "@/lex-api/types/app/bsky/feed/post"
import {ProfileViewDetailed} from "@/lex-api/types/app/bsky/actor/defs";
import {Main as Visualization} from "@/lex-api/types/ar/cabildoabierto/embed/visualization"
import {ProfileViewBasic as ProfileViewBasicCA} from "@/lex-api/types/ar/cabildoabierto/actor/defs"
import {PostOutput} from "@/utils/fetch";


export type EditorStatus = "Beginner" | "Editor" | "Administrator"

export type Profile = {
    bsky: ProfileViewDetailed
    ca: CAProfile | null
}

export type ValidationState = "org" | "persona" | string | null

export type CAProfile = {
    inCA: boolean
    followersCount: number
    followsCount: number
    editorStatus: EditorStatus
    validation: ValidationState
}


export type Session = {
    platformAdmin: boolean
    editorStatus: EditorStatus
    seenTutorial: {
        topics: boolean
        home: boolean
        topicMinimized: boolean
        topicMaximized: boolean
    }
    handle: string
    displayName: string | null
    avatar: string | null
    did: string
    hasAccess: boolean
    usedInviteCode: string | null
    validation: ValidationState
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


export type TopicContributor = {profile: ProfileViewBasicCA, all: number, monetized: number}

export type TopicVersionChangesProps = {
    prevText: string
    prevFormat: string | undefined
    curText: string
    curFormat: string | undefined
    curAuthor: ProfileViewBasicCA
    prevAuthor: ProfileViewBasicCA
    diff: MatchesType
}


export type TopicsGraph = {
    nodeIds: string[]
    edges: {x: string, y: string}[]
    data?: {id: string, categorySize?: number}[]
}


export type BothContributionsProps = {
    monetized: [string, number][]
    all: [string, number][]
}


export type ContributionsProps = [string, number][]


export type MatchesType = {
    matches: {x: number, y: number}[]
    common: {x: number, y: number}[]
    perfectMatches: {x: number, y: number}[]
}


export type DeepPartial<T> = {
    [P in keyof T]?:
    T[P] extends object ?
        T[P] extends Function ? T[P] : DeepPartial<T[P]>
        : T[P];
};


export type PlotConfigProps = DeepPartial<Visualization>


export type GetFeedProps<T> = (_?: string) => PostOutput<GetFeedOutput<T>>


export type GetFeedOutput<T> = {
    feed: T[]
    cursor: string | undefined
}


export type WikiEditorState = "changes" | "authors" | "normal" |
    "editing" | "editing-props" | "history" | "minimized" | "props"