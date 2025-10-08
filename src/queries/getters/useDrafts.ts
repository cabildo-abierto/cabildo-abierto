import {useAPI} from "@/queries/utils";
import {ArticleEmbedView} from "@/lex-api/types/ar/cabildoabierto/feed/article";

export type DraftPreview = {
    summary: string
    collection: string
    createdAt: Date
    lastUpdate: Date
    id: string
    title?: string
}


export type Draft = {
    text: string
    summary: string
    embeds?: ArticleEmbedView[]
    collection: string
    createdAt: Date
    lastUpdate: Date
    id: string
    title?: string
}


export function useDrafts() {
    return useAPI<DraftPreview[]>("/drafts", ["drafts"])
}


export function useDraft(id: string) {
    return useAPI<Draft>(`/draft/${id}`, ["draft", id])
}
