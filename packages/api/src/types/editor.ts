import { AppBskyEmbedExternal, ArCabildoabiertoEmbedVisualization, ArCabildoabiertoFeedArticle } from "../client";
import {$Typed} from "../client/util";


export type EmbedContext = {
    base64files?: string[]
} | null


export type ImagePayload = {
    src: string, $type: "url" } | {
    $type: "file",
    base64: string,
    src: string
}


export type ATProtoStrongRef = {
    uri: string
    cid: string
}


export type FastPostReplyProps = {
    parent: ATProtoStrongRef
    root: ATProtoStrongRef
}


export type CreateArticleProps = {
    title: string
    format: string
    text: string
    enDiscusion: boolean
    embeds?: ArCabildoabiertoFeedArticle.ArticleEmbedView[]
    embedContexts?: EmbedContext[]
    draftId?: string
    uri?: string
    previewImage?: ImagePayload
    description?: string
    bskyPostText: string | null
}

export type ImagePayloadForPostCreation = {
    $type: "url"
    src: string
} | {
    $type: "file"
    base64: string
}

export type CreatePostThreadElement = {
    text: string
    selection?: [number, number]
    images?: ImagePayloadForPostCreation[]
    externalEmbedView?: $Typed<AppBskyEmbedExternal.View>
    quotedPost?: ATProtoStrongRef
    visualization?: ArCabildoabiertoEmbedVisualization.Main
    uri?: string
}

export type CreatePostProps = {
    threadElements: CreatePostThreadElement[]
    forceEdit?: boolean
    enDiscusion?: boolean
    reply?: FastPostReplyProps
}