import {Record as BskyPostRecord} from "@/lex-api/types/app/bsky/feed/post"
import {ProfileViewDetailed} from "@/lex-api/types/app/bsky/actor/defs";
import {
    Main as Visualization
} from "@/lex-api/types/ar/cabildoabierto/embed/visualization"
import {PostOutput} from "@/utils/fetch";
import {$Typed} from "@atproto/api";
import {ArticleView, FullArticleView, PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";

export type EditorStatus = "Beginner" | "Editor" | "Administrator"

export type ThreadContent = $Typed<PostView> | $Typed<ArticleView> | $Typed<FullArticleView>

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


export type MatchesType = {
    matches: {x: number, y: number}[]
    common: {x: number, y: number}[]
    perfectMatches: {x: number, y: number}[]
}


type DeepPartial<T> = {
    [P in keyof T]?:
    T[P] extends object ?
        T[P] extends Function ? T[P] : DeepPartial<T[P]>
        : T[P];
};


export type PlotConfigProps = DeepPartial<Visualization>


export type FilterProps = {
    value: any
    op: string
    column: string
}


export type GetFeedProps<T> = (cursor?: string) => PostOutput<GetFeedOutput<T>>


export type GetFeedOutput<T> = {
    feed: T[]
    cursor: string | undefined
}