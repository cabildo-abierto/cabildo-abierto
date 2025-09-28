import {PostOutput} from "@/utils/fetch";
import {ArCabildoabiertoActorDefs, ArCabildoabiertoEmbedVisualization} from "@/lex-api/index"
import {AppBskyActorDefs} from "@atproto/api"

export type EditorStatus = "Beginner" | "Editor" | "Administrator"

export type Profile = {
    bsky: AppBskyActorDefs.ProfileViewDetailed
    ca: CAProfile | null
}

export type ValidationState = "org" | "persona" | string | null

export type CAProfile = {
    inCA: boolean
    followersCount: number
    followsCount: number
    articlesCount: number
    editsCount: number
    editorStatus: EditorStatus
    validation: ValidationState
}

export type FollowingFeedFilterOption = "Todos" | "Solo Cabildo Abierto"
export type FeedFormatOption = "Todos" | "Artículos"
export type EnDiscusionMetric = "Me gustas" | "Interacciones" | "Popularidad relativa" | "Recientes"
export type EnDiscusionTime = "Último día" | "Última semana" | "Último mes"
export type FollowingFeedFilter = "Todos" | "Solo Cabildo Abierto"
export type TTOption = EnDiscusionTime | "Ediciones recientes"

export type AlgorithmConfig = {
    following?: {
        filter?: FollowingFeedFilter
        format?: FeedFormatOption
    }
    enDiscusion?: {
        time?: EnDiscusionTime
        metric?: EnDiscusionMetric
        format?: FeedFormatOption
    }
    topicMentions?: {
        time?: EnDiscusionTime
        metric?: EnDiscusionMetric
        format?: FeedFormatOption
    }
    tt?: {
        time?: TTOption
    }
}


export type AuthorStatus = {
    isAuthor: boolean
    seenAuthorTutorial: boolean
}


export type MirrorStatus = "Sync" | "Dirty" | "InProcess" | "Failed" | "Failed - Too Large"


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


export type ATProtoStrongRef = {
    uri: string
    cid: string
}


export type FastPostReplyProps = {
    parent: ATProtoStrongRef
    root: ATProtoStrongRef
}


export type TopicContributor = {profile: ArCabildoabiertoActorDefs.ProfileViewBasic, all: number, monetized: number}

export type TopicVersionChangesProps = {
    prevText: string
    prevFormat: string | undefined
    curText: string
    curFormat: string | undefined
    curAuthor: ArCabildoabiertoActorDefs.ProfileViewBasic
    prevAuthor: ArCabildoabiertoActorDefs.ProfileViewBasic
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


export type PlotConfigProps = DeepPartial<ArCabildoabiertoEmbedVisualization.Main>


export type GetFeedProps<T> = (_?: string) => PostOutput<GetFeedOutput<T>>


export type GetFeedOutput<T> = {
    feed: T[]
    cursor: string | undefined
}


export type WikiEditorState = "changes" | "authors" | "normal" |
    "editing" | "editing-props" | "history" | "minimized" | "props"
export type MainFeedOption = "En discusión" | "Siguiendo" | "Descubrir" | "Artículos"