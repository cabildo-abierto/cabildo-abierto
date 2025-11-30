import {ArCabildoabiertoFeedArticle, EmbedContext, ImagePayload} from ".."

export type CreateDraftParams = {
    id?: string
    collection: "ar.cabildoabierto.feed.article" | "app.bsky.feed.post"
    text: string
    title: string
    embeds?: ArCabildoabiertoFeedArticle.ArticleEmbedView[]
    embedContexts?: EmbedContext[]
    description: string | null
    previewImage: ImagePayload
}

export type Draft = {
    text: string
    summary: string
    title?: string
    embeds?: ArCabildoabiertoFeedArticle.ArticleEmbedView[]
    embedContexts?: EmbedContext[]
    collection: string
    createdAt: Date
    lastUpdate: Date
    id: string
    previewImage?: string
}


export type DraftPreview = {
    summary: string
    title?: string
    collection: string
    createdAt: Date
    lastUpdate: Date
    id: string
    previewImage?: string
}