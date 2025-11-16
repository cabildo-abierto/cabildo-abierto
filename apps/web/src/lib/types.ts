import {ArCabildoabiertoActorDefs} from "@cabildo-abierto/api"
import {MatchesType} from "@cabildo-abierto/editor-core";
import {PostOutput} from "@/components/utils/react/fetch";


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
    curAuthor?: ArCabildoabiertoActorDefs.ProfileViewBasic
    prevAuthor?: ArCabildoabiertoActorDefs.ProfileViewBasic
    diff: MatchesType
}


export type TopicsGraph = {
    nodeIds: string[]
    edges: {x: string, y: string}[]
    data?: {id: string, categorySize?: number}[]
}


export type GetFeedProps<T> = (_?: string) => PostOutput<GetFeedOutput<T>>


export type GetFeedOutput<T> = {
    feed: T[]
    cursor: string | undefined
}


export type MainFeedOption = "En discusión" | "Siguiendo" | "Descubrir" | "Artículos"